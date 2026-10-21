# SOLID in an Interview: Round 5 (Everyday Indian Apps)

Same four beats: business story, naive code, principle plus smell plus pain, fix plus tradeoff. These are simplified illustrations inspired by apps you use daily, not their real code.

---

## S: Single Responsibility (IRCTC: Booking a Train Ticket)

**Say:**
> "Let's say we're building a train booking flow like IRCTC. When a passenger books, we validate the request, allocate a berth, charge the payment, and SMS the ticket."

**Initially we'd write:**

```ts
class TicketBooking {
  constructor(readonly passengerId: string, readonly trainNo: string, readonly seats: number) {}

  validate()       { /* train exists, seats 1-6, date within 60 days */ }
  allocateBerth()  { /* find lower/middle/upper berth, update chart */ }
  charge()         { /* call payment gateway */ }
  sendTicketSms()  { /* SMS with PNR */ }
}
```

**Say:**
> "This violates **SRP**: a class should have one reason to change. Railway policy changes validation rules, the reservation team changes berth allocation, the payments team changes gateways, and the communications team changes the SMS vendor. Four owners, one file. The smell is that I can't describe it without saying 'and'. The pain: a Tatkal rule change sits next to payment code, and I can't test berth logic without a payment gateway."

**Let's fix it:**

```ts
class TicketBooking {
  constructor(readonly passengerId: string, readonly trainNo: string, readonly seats: number) {}
}

class BookingValidator { validate(b: TicketBooking): void { /* throws if invalid */ } }
class BerthAllocator   { allocate(b: TicketBooking): string[] { /* ... */ return []; } }
class PaymentCharger   { charge(b: TicketBooking): void { /* ... */ } }
class TicketSms        { send(b: TicketBooking, pnr: string): void { /* ... */ } }

class BookTicket {                       // orchestration only
  constructor(
    private validator: BookingValidator,
    private allocator: BerthAllocator,
    private payments: PaymentCharger,
    private sms: TicketSms,
  ) {}

  run(b: TicketBooking) {
    this.validator.validate(b);
    const berths = this.allocator.allocate(b);
    this.payments.charge(b);
    this.sms.send(b, berths.join(","));
  }
}
```

**Say:**
> "Each class changes for one reason, and `BerthAllocator` is testable without a payment gateway. Tradeoff: more classes, so I'd split where concerns really change independently, not for a weekend prototype."

---

## O: Open/Closed (Zerodha/Groww-style: Brokerage Charges)

**Say:**
> "Let's say we're building a stock trading app. Brokerage differs by trade type: delivery trades, intraday trades, and futures and options. Later the business wants to add commodities."

**Initially we'd write (rates are illustrative):**

```ts
class BrokerageCalculator {
  charge(type: string, turnover: number): number {
    if (type === "delivery") return 0;
    if (type === "intraday") return Math.min(turnover * 0.0003, 20);
    if (type === "fno")      return 20;
    throw new Error("Unknown trade type");
  }
}
```

**Say:**
> "This violates **OCP**: open for extension, closed for modification. Adding commodities means reopening this method, which also computes money for every existing user. A slip in a new branch can silently change intraday charges. The smell is an `if/else` chain on a type string that grows with each product launch."

**Let's fix it:**

```ts
interface BrokeragePolicy {
  charge(turnover: number): number;
}

class DeliveryPolicy implements BrokeragePolicy {
  charge(turnover: number) { return 0; }
}
class IntradayPolicy implements BrokeragePolicy {
  charge(turnover: number) { return Math.min(turnover * 0.0003, 20); }
}
class FnoPolicy implements BrokeragePolicy {
  charge(turnover: number) { return 20; }
}

// New product: add a class, edit nothing
class CommodityPolicy implements BrokeragePolicy {
  charge(turnover: number) { return Math.min(turnover * 0.0003, 20); }
}

const policies: Record<string, BrokeragePolicy> = {
  delivery: new DeliveryPolicy(),
  intraday: new IntradayPolicy(),
  fno: new FnoPolicy(),
  commodity: new CommodityPolicy(),     // one registry line
};

function brokerage(type: string, turnover: number): number {
  const p = policies[type];
  if (!p) throw new Error(`Unknown trade type: ${type}`);
  return p.charge(turnover);
}
```

**Say:**
> "Each policy is isolated, so a new product can't break existing charges. The only edit is one registry line at the edge. Tradeoff: with two trade types a plain function is fine, so I'd wait for the third variant."

---

## L: Liskov Substitution (UPI Lite: Payment Limits)

**Say:**
> "Let's say we're building a payments app like PhonePe or Google Pay. Users pay bills using their bank account via UPI. We then add UPI Lite for small payments, which has a per-transaction limit."

**Initially we'd write:**

```ts
class PaymentMethod {
  pay(amount: number): void { /* debit any amount */ }
}

class UpiLite extends PaymentMethod {
  pay(amount: number): void {
    if (amount > 1000) throw new Error("Above Lite limit");   // stricter than parent
    /* debit */
  }
}

function payElectricityBill(method: PaymentMethod, amount: number) {
  method.pay(amount);       // crashes for a 4,500 bill if method is UpiLite
}
```

**Say:**
> "This violates **LSP**: anywhere the parent type is used, any subtype must work without surprises. The specific rule broken is 'preconditions can't be stronger': the parent accepts any amount, but `UpiLite` rejects large ones. `payElectricityBill` compiles, then fails at runtime on the due date. The compiler can't catch it because LSP is about behavior, not signatures."

**Let's fix it:**

```ts
interface PaymentMethod {
  canPay(amount: number): boolean;     // limits are now part of the contract
  pay(amount: number): void;
}

class BankUpi implements PaymentMethod {
  canPay(amount: number) { return amount > 0; }
  pay(amount: number) { /* debit bank */ }
}

class UpiLite implements PaymentMethod {
  canPay(amount: number) { return amount > 0 && amount <= 1000; }
  pay(amount: number) {
    if (!this.canPay(amount)) throw new Error("Above Lite limit");
    /* debit Lite balance */
  }
}

function payBill(methods: PaymentMethod[], amount: number) {
  const method = methods.find(m => m.canPay(amount));
  if (!method) throw new Error("No eligible payment method");
  method.pay(amount);
}

payBill([new UpiLite(), new BankUpi()], 4500);   // falls back to BankUpi
```

**Say:**
> "Instead of hiding a limit in a subclass, I made it part of the contract, so every implementation answers `canPay` the same way and callers check it. Now a large bill falls through to the bank account instead of crashing. Note that LSP doesn't ban limits, it bans surprises."

---

## I: Interface Segregation (Zomato/Swiggy: Three Apps, One Platform)

**Say:**
> "Let's say we're building the platform behind a food delivery service. Customers browse menus and place orders, restaurants accept orders and edit menus, and delivery partners mark orders delivered."

**Initially we'd write:**

```ts
interface PlatformUser {
  browseMenu(): string[];
  placeOrder(item: string): void;
  acceptOrder(orderId: string): void;
  updateMenu(item: string, price: number): void;
  markDelivered(orderId: string): void;
}

class Customer implements PlatformUser {
  browseMenu() { return ["Biryani"]; }
  placeOrder(item: string) { /* ... */ }
  acceptOrder(orderId: string): void { throw new Error("N/A"); }
  updateMenu(item: string, price: number): void { throw new Error("N/A"); }
  markDelivered(orderId: string): void { throw new Error("N/A"); }
}
```

**Say:**
> "This violates **ISP**: no client should be forced to depend on methods it doesn't use. A customer is stuck with three throwing stubs, including `updateMenu`, which would be a security hole if it were ever wired up. If the delivery method signature changes, customer code changes for no reason. The smell is throwing stubs on the implementer side, and it sets up LSP crashes."

**Let's fix it:**

```ts
interface MenuBrowser      { browseMenu(): string[]; }
interface OrderPlacer      { placeOrder(item: string): void; }
interface OrderAcceptor    { acceptOrder(orderId: string): void; }
interface MenuEditor       { updateMenu(item: string, price: number): void; }
interface DeliveryUpdater  { markDelivered(orderId: string): void; }

class Customer        implements MenuBrowser, OrderPlacer { /* ... */ }
class Restaurant      implements MenuBrowser, OrderAcceptor, MenuEditor { /* ... */ }
class DeliveryPartner implements DeliveryUpdater { /* ... */ }

function renderMenuScreen(source: MenuBrowser) {   // works for customers and restaurants
  return source.browseMenu();
}
```

**Say:**
> "Each role implements only its own capabilities, and each screen asks for only what it uses. A customer object can't be passed where `MenuEditor` is required, so the compiler blocks that mistake. I grouped `browseMenu` into one interface because it's used on its own, and I'd avoid splitting further into one-method interfaces unless clients really use them separately."

---

## D: Dependency Inversion (UPI App: Sending Money)

**Say:**
> "Let's say we're building a UPI app. When a user sends money, we debit their bank, and if it succeeds, notify both people by SMS."

**Initially we'd write:**

```ts
class SendMoneyService {
  private bank = new HdfcBankClient();         // created inside
  private sms = new SmsGateway();              // created inside

  send(fromVpa: string, toVpa: string, paise: number) {
    const ok = this.bank.transfer(fromVpa, toVpa, paise);
    if (ok) this.sms.send(fromVpa, `Sent ${paise / 100} to ${toVpa}`);
  }
}
```

**Say:**
> "This violates **DIP**: high-level business logic shouldn't depend on low-level details; both should depend on abstractions. Our core rule, 'notify only if the transfer succeeds', is welded to one bank's client and one SMS vendor. Supporting SBI or ICICI means editing business code. And to test the failure path, I'd need a real bank to decline a real transaction. The smell is `new` on infrastructure inside business logic."

**Let's fix it:**

```ts
interface BankGateway { transfer(fromVpa: string, toVpa: string, paise: number): boolean; }
interface Notifier    { send(to: string, message: string): void; }

class HdfcGateway implements BankGateway {
  transfer(from: string, to: string, paise: number) { /* HDFC API */ return true; }
}
class SmsNotifier implements Notifier {
  send(to: string, message: string) { /* SMS API */ }
}

class SendMoneyService {
  constructor(private bank: BankGateway, private notifier: Notifier) {}

  send(fromVpa: string, toVpa: string, paise: number): boolean {
    const ok = this.bank.transfer(fromVpa, toVpa, paise);
    if (ok) this.notifier.send(fromVpa, `Sent ${paise / 100} to ${toVpa}`);
    return ok;
  }
}

// Composition root: the only place that knows concrete classes
const service = new SendMoneyService(new HdfcGateway(), new SmsNotifier());
```

**Test the failure path with fakes:**

```ts
const sms: string[] = [];
const service = new SendMoneyService(
  { transfer: () => false },                    // bank declines
  { send: (_to, msg) => { sms.push(msg); } },
);

service.send("a@upi", "b@upi", 50000);
// sms is [], so no notification is sent on failure
```

**Say:**
> "The 'notify only on success' rule is now testable in milliseconds, including the decline case that is hard to trigger with a real bank. The interface is shaped by what we need, 'transfer money', not by HDFC's API. Supporting another bank is one adapter and one line in the composition root. Tradeoff: more wiring, so I only abstract real boundaries like banks, SMS, and time."

---

## Closing statement

> "**S** split the booking flow so railway rules, berth logic, payments, and SMS each have one owner. **O** let the trading app add commodities without editing tested brokerage code. **L** made UPI Lite's limit part of the contract, so no caller is surprised. **I** gave customers, restaurants, and delivery partners only their own capabilities. **D** kept the money-transfer rule independent of any one bank or SMS vendor, which made even the failure path testable. I apply these when I feel the pain, not by reflex."

---

## Map of all five rounds

| Principle | R1 | R2 | R3 | R4 (utility) | R5 (Indian apps) |
|---|---|---|---|---|---|
| S | Food receipt | Hospital discharge | Library return | To-do add task | IRCTC booking |
| O | E-commerce discounts | Airline baggage | Cab surge | Unit converter | Brokerage charges |
| L | COD refunds | Free streaming tier | Archive storage | Medicine alarm | UPI Lite limit |
| I | Office printer | Smart home | User service slices | Weather providers | Zomato roles |
| D | Ride-hailing | E-learning | Fitness reminders | Budget alerts | UPI send money |

**New idea this round:** the LSP example shows that a limit isn't automatically a violation. If the limit is part of the documented contract (`canPay`), it's fine. If it appears as a hidden surprise in a subclass, it breaks LSP.
