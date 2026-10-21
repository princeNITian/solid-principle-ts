# Explaining SOLID in an Interview: Narrated Scripts

Each section follows the same four-beat pattern:

1. **"Let's say we want to build X..."** (set the scene)
2. **"Initially we'd write it like this..."** (naive code)
3. **"This violates P because..."** (name the principle, what it tells us, the real-world pain)
4. **"Let's fix it..."** (refactor, then the payoff)

---

## S: Single Responsibility (Food Delivery: Order Receipt)

**Say:**
> "Let's say we're building a food delivery app like Swiggy. After an order is delivered, we need to calculate the bill, generate a receipt, save it, and email it to the customer."

**Initially we'd write:**

```ts
class Receipt {
  constructor(
    readonly items: { name: string; price: number; qty: number }[],
    readonly email: string,
  ) {}

  total(): number {
    const subtotal = this.items.reduce((s, i) => s + i.price * i.qty, 0);
    return subtotal + subtotal * 0.05 + 40; // GST + delivery fee
  }

  toHtml(): string {
    return `<h1>Receipt</h1><p>Total: ${this.total()}</p>`;
  }

  save(): void {
    db.query("INSERT INTO receipts ...");
  }

  sendEmail(): void {
    smtp.send(this.email, this.toHtml());
  }
}
```

**Say:**
> "This works, but it violates the **Single Responsibility Principle**. SRP says a class should have only one reason to change. Here, finance changes the GST or delivery fee, design changes the receipt layout, the backend team migrates the database, and marketing switches the email provider. Four teams, one file. Every change risks breaking the others, and I can't test the bill calculation without a database or SMTP server."

**Let's fix it:**

```ts
class Receipt {
  constructor(
    readonly items: { name: string; price: number; qty: number }[],
    readonly email: string,
  ) {}
  subtotal() { return this.items.reduce((s, i) => s + i.price * i.qty, 0); }
}

class BillCalculator {                     // reason to change: pricing rules
  total(r: Receipt): number {
    return r.subtotal() * 1.05 + 40;
  }
}

class ReceiptRenderer {                    // reason to change: layout
  render(r: Receipt, total: number): string {
    return `<h1>Receipt</h1><p>Total: ${total}</p>`;
  }
}

class ReceiptRepository {                  // reason to change: storage
  save(r: Receipt): void { db.query("INSERT INTO receipts ..."); }
}

class ReceiptMailer {                      // reason to change: email provider
  send(to: string, html: string): void { smtp.send(to, html); }
}
```

**Say:**
> "Now each class has one reason to change. If the GST rate changes, only `BillCalculator` is touched, and I can unit test it with no infrastructure."

**Pitfall to mention:** "I wouldn't over-split. If two things always change together, they can stay together."

---

## O: Open/Closed (E-commerce: Festival Discounts)

**Say:**
> "Let's say we're building checkout for an e-commerce site. Marketing wants different discounts: VIP customers, Diwali sale, and later student offers."

**Initially we'd write:**

```ts
class DiscountCalculator {
  apply(price: number, type: string): number {
    if (type === "vip") return price * 0.8;
    if (type === "diwali") return price * 0.9;
    return price;
  }
}
```

**Say:**
> "This violates the **Open/Closed Principle**. OCP says software should be open for extension but closed for modification. When marketing asks for a student discount, I have to open this tested method and edit it. Every new offer risks breaking existing ones, and the method grows forever. The `if/else` chain on a type is the classic smell."

**Let's fix it:**

```ts
interface DiscountStrategy {
  apply(price: number): number;
}

class VipDiscount implements DiscountStrategy {
  apply(price: number) { return price * 0.8; }
}
class DiwaliDiscount implements DiscountStrategy {
  apply(price: number) { return price * 0.9; }
}
class NoDiscount implements DiscountStrategy {
  apply(price: number) { return price; }
}

class Checkout {
  constructor(private discount: DiscountStrategy) {}
  total(price: number) { return this.discount.apply(price); }
}

// Marketing asks for student offers: add a class, edit nothing
class StudentDiscount implements DiscountStrategy {
  apply(price: number) { return price * 0.85; }
}
```

**Say:**
> "Now new offers are new classes. `Checkout` never changes. The remaining decision of which strategy to pick lives at the edge of the app, in a registry or factory. One caveat: I'd wait until there are two or three variants before introducing the abstraction, so I don't over-engineer."

---

## L: Liskov Substitution (Payments: Wallet Refunds)

**Say:**
> "Let's say we're building a payment module. Customers can pay by card, UPI, or cash on delivery. We also need refunds when an order is cancelled."

**Initially we'd write:**

```ts
class PaymentMethod {
  pay(amount: number): void { /* generic */ }
  refund(amount: number): void { /* refund to source */ }
}

class CardPayment extends PaymentMethod { /* works */ }

class CashOnDelivery extends PaymentMethod {
  refund(amount: number): void {
    throw new Error("Cash can't be refunded");
  }
}

function cancelOrder(method: PaymentMethod, amount: number) {
  method.refund(amount);   // crashes for COD
}
```

**Say:**
> "This violates the **Liskov Substitution Principle**. LSP says anywhere I use a parent type, any subtype must work without surprises. `cancelOrder` accepts a `PaymentMethod` and reasonably expects `refund` to work. `CashOnDelivery` compiles fine but blows up at runtime, in production, when a customer cancels. The compiler can't catch it because LSP is about behavior, not signatures. The smell is a subclass that throws 'not supported'."

**Let's fix it:**

```ts
interface Payable { pay(amount: number): void; }
interface Refundable { refund(amount: number): void; }

class CardPayment implements Payable, Refundable {
  pay(a: number) { /* charge card */ }
  refund(a: number) { /* refund to card */ }
}

class CashOnDelivery implements Payable {          // makes no refund promise
  pay(a: number) { /* collect cash */ }
}

function cancelOrder(method: Refundable, amount: number) {
  method.refund(amount);
}

cancelOrder(new CardPayment(), 500);        // ok
// cancelOrder(new CashOnDelivery(), 500);  // compile error
```

**Say:**
> "We model what's actually true: COD is payable but not refundable. The bug moves from a production crash to a compile error."

---

## I: Interface Segregation (Office: Multi-function Printer)

**Say:**
> "Let's say we're building software for office devices. Some are all-in-one machines that print, scan, and fax. Others are cheap printers that only print."

**Initially we'd write:**

```ts
interface Machine {
  print(doc: string): void;
  scan(): string;
  fax(doc: string): void;
}

class OfficeMachine implements Machine {
  print(doc: string) { /* ... */ }
  scan() { return "scanned"; }
  fax(doc: string) { /* ... */ }
}

class BasicPrinter implements Machine {
  print(doc: string) { /* ... */ }
  scan(): string { throw new Error("Not supported"); }
  fax(doc: string): void { throw new Error("Not supported"); }
}
```

**Say:**
> "This violates the **Interface Segregation Principle**. ISP says no class should be forced to implement methods it doesn't use. `BasicPrinter` is stuck with `scan` and `fax` stubs that throw. Any client of `Machine` can't trust it, and if the fax method's signature changes, the printer code must change for no reason. The smell is empty or throwing stubs. It's often the root cause of LSP violations too."

**Let's fix it:**

```ts
interface Printer { print(doc: string): void; }
interface Scanner { scan(): string; }
interface Fax { fax(doc: string): void; }

class BasicPrinter implements Printer {
  print(doc: string) { /* ... */ }
}

class OfficeMachine implements Printer, Scanner, Fax {
  print(doc: string) { /* ... */ }
  scan() { return "scanned"; }
  fax(doc: string) { /* ... */ }
}

function digitize(s: Scanner) { return s.scan(); }   // asks only for what it uses
```

**Say:**
> "Each interface is shaped by what clients need. `digitize` accepts only a `Scanner`, so passing a `BasicPrinter` fails at compile time. I'd group methods that are always used together, and avoid one-method interfaces for everything."

---

## D: Dependency Inversion (Ride-Hailing: Booking and Payments)

**Say:**
> "Let's say we're building a ride-booking service like Ola. When a ride completes, we charge the customer and send an SMS receipt."

**Initially we'd write:**

```ts
class RazorpayClient {
  charge(amount: number) { /* calls Razorpay API */ }
}
class TwilioSms {
  send(phone: string, msg: string) { /* calls Twilio API */ }
}

class RideService {
  private payments = new RazorpayClient();   // created inside
  private sms = new TwilioSms();             // created inside

  completeRide(phone: string, fare: number) {
    this.payments.charge(fare);
    this.sms.send(phone, `Ride complete. Fare: ${fare}`);
  }
}
```

**Say:**
> "This violates the **Dependency Inversion Principle**. DIP says high-level business logic shouldn't depend on low-level details. Both should depend on abstractions. Here `RideService`, our core logic, is welded to Razorpay and Twilio. If we switch to Stripe, we edit business code. And I can't unit test `completeRide` without making real API calls and charging real money. The smell is `new` on infrastructure inside business logic."

**Let's fix it:**

```ts
interface PaymentGateway { charge(amount: number): void; }
interface SmsSender { send(phone: string, msg: string): void; }

class RazorpayGateway implements PaymentGateway {
  charge(amount: number) { /* Razorpay SDK */ }
}
class TwilioSender implements SmsSender {
  send(phone: string, msg: string) { /* Twilio SDK */ }
}

class RideService {
  constructor(
    private payments: PaymentGateway,
    private sms: SmsSender,
  ) {}

  completeRide(phone: string, fare: number) {
    this.payments.charge(fare);
    this.sms.send(phone, `Ride complete. Fare: ${fare}`);
  }
}

// Composition root: the only place that knows concrete classes
const rides = new RideService(new RazorpayGateway(), new TwilioSender());
```

**Test with fakes:**

```ts
const charged: number[] = [];
const service = new RideService(
  { charge: (a) => { charged.push(a); } },
  { send: () => {} },
);
service.completeRide("999", 250);
// charged is [250]; no real money, no real SMS
```

**Say:**
> "`RideService` now depends on interfaces shaped by our business needs, not by vendor SDKs. Swapping Razorpay for Stripe means writing one adapter and changing one line in the composition root. I'd only add interfaces at boundaries likely to change, like payment, messaging, database, and clock, not for every class."

---

## Closing statement for the interview

> "To summarize: **S** keeps each class focused on one reason to change. **O** lets me add variants without editing tested code. **L** ensures subtypes are safe to plug in, and I model real capabilities instead of faking them with throwing stubs. **I** keeps interfaces small and shaped by clients. **D** keeps business logic independent of infrastructure, which also makes it testable. They reinforce each other, and I apply them when I see the pain (growing `if/else`, hard-to-test code, throwing stubs), not by reflex."

---

## Delivery tips

- **Always start with the business story**, not the principle name. It shows you think in problems.
- **Show the pain before the fix**: a new requirement, a hard-to-test class, a runtime crash.
- **Name the smell**: `if/else` on type (O), throwing stub (L/I), `new` in logic (D), "and" in the description (S).
- **Mention the tradeoff once**: more classes and wiring, so don't over-split small scripts.
- **Keep code short on a whiteboard**: sketch signatures and skip bodies.

