# SOLID in an Interview: Round 6 (More Everyday Indian Apps)

Same four beats: business story, naive code, principle plus smell plus pain, fix plus tradeoff. These are simplified illustrations inspired by apps you use daily, not their real code. Rates and rules are made up for demonstration.

---

## S: Single Responsibility (Blinkit/Zepto: Quick Commerce Order)

**Say:**
> "Let's say we're building a 10-minute grocery delivery app. When a customer places an order, we check stock at the nearest dark store, calculate the bill with delivery and handling fees, assign a rider, and push a notification."

**Initially we'd write:**

```ts
class QuickOrder {
  constructor(readonly items: { sku: string; price: number; qty: number }[], readonly userId: string) {}

  checkStock()    { /* query dark store inventory */ }
  calculateBill() { /* items + handling fee + delivery fee + surge */ }
  assignRider()   { /* find nearest free rider */ }
  notifyUser()    { /* push notification */ }
}
```

**Say:**
> "This violates **SRP**: a class should have one reason to change. Inventory ops changes stock logic, finance changes fee rules, logistics changes rider assignment, and the growth team changes notification copy. Four owners, one file. The smell is that I can't describe it without saying 'and'. The pain: a surge-fee tweak shares a file with rider assignment, and I can't test the bill without a stock database."

**Let's fix it:**

```ts
class QuickOrder {
  constructor(readonly items: { sku: string; price: number; qty: number }[], readonly userId: string) {}
}

class StockChecker  { check(o: QuickOrder): boolean { /* ... */ return true; } }
class BillCalculator { total(o: QuickOrder): number { /* ... */ return 0; } }
class RiderAssigner { assign(o: QuickOrder): string { /* ... */ return "rider-1"; } }
class OrderNotifier { notify(o: QuickOrder, riderId: string): void { /* ... */ } }

class PlaceQuickOrder {                    // orchestration only
  constructor(
    private stock: StockChecker,
    private billing: BillCalculator,
    private riders: RiderAssigner,
    private notifier: OrderNotifier,
  ) {}

  run(o: QuickOrder): number {
    if (!this.stock.check(o)) throw new Error("Out of stock");
    const total = this.billing.total(o);
    const rider = this.riders.assign(o);
    this.notifier.notify(o, rider);
    return total;
  }
}
```

**Say:**
> "Each class changes for one reason, and `BillCalculator` is a pure function I can test with no infrastructure. Tradeoff: more classes, so I'd split where concerns genuinely change independently."

---

## O: Open/Closed (Recharge App: Cashback Offers)

**Say:**
> "Let's say we're building a mobile recharge and bill payment app like Paytm or PhonePe. Marketing runs offers: flat cashback on first recharge, percentage cashback on electricity bills, and later a festival scratch-card bonus."

**Initially we'd write:**

```ts
class CashbackCalculator {
  compute(offer: string, amount: number): number {
    if (offer === "first-recharge") return Math.min(50, amount);
    if (offer === "electricity")    return Math.min(amount * 0.02, 100);
    return 0;
  }
}
```

**Say:**
> "This violates **OCP**: open for extension, closed for modification. Marketing launches a new offer almost every week, and each one means reopening this method that also pays out real money for existing offers. One wrong branch and we overpay thousands of users. The smell is an `if/else` on an offer string that grows with every campaign."

**Let's fix it:**

```ts
interface CashbackOffer {
  cashback(amount: number): number;
}

class FirstRechargeOffer implements CashbackOffer {
  cashback(amount: number) { return Math.min(50, amount); }
}
class ElectricityOffer implements CashbackOffer {
  cashback(amount: number) { return Math.min(amount * 0.02, 100); }
}

// Weekly campaign: add a class, edit nothing
class FestivalBonusOffer implements CashbackOffer {
  cashback(amount: number) { return Math.min(amount * 0.05, 75); }
}

class Checkout {
  constructor(private offers: CashbackOffer[]) {}

  totalCashback(amount: number): number {
    return this.offers.reduce((sum, o) => sum + o.cashback(amount), 0);
  }
}

new Checkout([new ElectricityOffer(), new FestivalBonusOffer()]).totalCashback(2000);
```

**Say:**
> "Offers are now independent and composable: stacking two campaigns is two entries in a list. `Checkout` never changes. In a real system I'd also add a cap on total cashback per transaction, as a business rule. Tradeoff: with only one or two offers a plain function is fine, so I'd wait for the third."

---

## L: Liskov Substitution (BookMyShow: Ticket Cancellation)

**Say:**
> "Let's say we're building a movie ticketing app. Users can book tickets and cancel them for a refund. We then add a 'non-refundable' promotional booking, like a discounted premiere show."

**Initially we'd write:**

```ts
class Booking {
  constructor(readonly id: string, readonly amount: number) {}
  cancel(): number { return this.amount; }        // returns refund
}

class PremiereBooking extends Booking {
  cancel(): number {
    throw new Error("Premiere tickets are non-refundable");
  }
}

function cancelAll(bookings: Booking[]): number {
  return bookings.reduce((sum, b) => sum + b.cancel(), 0);   // crashes on a premiere
}
```

**Say:**
> "This violates **LSP**: anywhere the parent type is used, any subtype must work without surprises. `cancelAll` takes `Booking[]` and reasonably expects `cancel` to return a refund. `PremiereBooking` compiles but crashes the whole batch, including the valid refunds for other bookings. The compiler can't catch it because LSP is about behavior, not signatures. The smell is an override that throws 'not supported'."

**Let's fix it:**

```ts
interface Bookable { readonly id: string; readonly amount: number; }
interface Cancellable { cancel(): number; }

class StandardBooking implements Bookable, Cancellable {
  constructor(readonly id: string, readonly amount: number) {}
  cancel() { return this.amount; }
}

class PremiereBooking implements Bookable {         // makes no cancel promise
  constructor(readonly id: string, readonly amount: number) {}
}

function cancelAll(bookings: Cancellable[]): number {
  return bookings.reduce((sum, b) => sum + b.cancel(), 0);
}
// cancelAll([new PremiereBooking("p1", 500)]);     // compile error
```

**Say:**
> "We model what's true: premiere bookings exist but aren't cancellable. The UI can hide the cancel button based on the type, and the batch refund job can't be handed a booking that would crash it. An alternative is the `canCancel()` contract from the UPI Lite example, which suits cases where eligibility depends on runtime data, like a cancellation window."

---

## I: Interface Segregation (Gmail-style Inbox: Email Client Features)

**Say:**
> "Let's say we're building an email client. The inbox list screen shows messages, the compose screen sends mail, and a settings screen manages filters and signatures. Different screens are built by different teams."

**Initially we'd write:**

```ts
interface MailService {
  fetchInbox(): string[];
  send(to: string, body: string): void;
  saveDraft(body: string): void;
  createFilter(rule: string): void;
  setSignature(text: string): void;
}

class InboxScreen {
  constructor(private mail: MailService) {}      // only needs fetchInbox
  render() { return this.mail.fetchInbox(); }
}
```

**Say:**
> "This violates **ISP**: no client should be forced to depend on methods it doesn't use. `InboxScreen` depends on five methods and uses one. If `setSignature` changes, the inbox team is affected for no reason, and to test the inbox I must fake all five. The smell is a client using a tiny slice of a big interface. ISP is about what clients need, so I count who uses what."

**Let's fix it:**

```ts
interface InboxReader   { fetchInbox(): string[]; }
interface MailSender    { send(to: string, body: string): void; saveDraft(body: string): void; }
interface MailSettings  { createFilter(rule: string): void; setSignature(text: string): void; }

class GmailLikeService implements InboxReader, MailSender, MailSettings { /* ... */ }

class InboxScreen {
  constructor(private mail: InboxReader) {}
}
class ComposeScreen {
  constructor(private mail: MailSender) {}
}
class SettingsScreen {
  constructor(private mail: MailSettings) {}
}
```

**Say:**
> "One class can still implement everything, but each screen asks only for its slice. Testing `InboxScreen` now fakes one method. I grouped `send` with `saveDraft` because the compose screen always uses them together, and I'd avoid one-method interfaces for everything. TypeScript's `Pick<MailService, 'fetchInbox'>` can also derive a slice from an existing interface."

---

## D: Dependency Inversion (Ola/Uber-style: Ride Fare Estimates)

**Say:**
> "Let's say we're building the fare estimate feature in a cab app. We get the route distance from a maps provider, fetch the current surge multiplier, and show the estimated fare."

**Initially we'd write:**

```ts
class FareEstimator {
  private maps = new GoogleMapsClient();       // created inside
  private surge = new SurgeServiceClient();    // created inside

  estimate(from: string, to: string): number {
    const km = this.maps.distanceKm(from, to);
    const multiplier = this.surge.currentMultiplier();
    return Math.round(km * 12 * multiplier);
  }
}
```

**Say:**
> "This violates **DIP**: high-level business logic shouldn't depend on low-level details; both should depend on abstractions. The pricing rule, 'distance times rate times surge', is our core logic, yet it's welded to Google Maps and one surge service. Switching to MapMyIndia, which many Indian apps consider for local data, means editing business code. And to test the surge path, I'd need real API calls with real quota and a real surge event. The smell is `new` on infrastructure inside business logic."

**Let's fix it:**

```ts
interface DistanceProvider { distanceKm(from: string, to: string): number; }
interface SurgeProvider    { currentMultiplier(): number; }

class GoogleMapsDistance implements DistanceProvider {
  distanceKm(from: string, to: string) { /* Maps API */ return 0; }
}
class RemoteSurge implements SurgeProvider {
  currentMultiplier() { /* HTTP call */ return 1; }
}

class FareEstimator {
  constructor(
    private distance: DistanceProvider,
    private surge: SurgeProvider,
  ) {}

  estimate(from: string, to: string): number {
    const km = this.distance.distanceKm(from, to);
    return Math.round(km * 12 * this.surge.currentMultiplier());
  }
}

// Composition root: the only place that knows concrete classes
const estimator = new FareEstimator(new GoogleMapsDistance(), new RemoteSurge());
```

**Test the surge path with fakes:**

```ts
const estimator = new FareEstimator(
  { distanceKm: () => 10 },
  { currentMultiplier: () => 1.5 },
);
// estimator.estimate("A", "B") is 180, with no network calls
```

**Say:**
> "The pricing rule is now testable with exact numbers, including a 2x surge that would be rare to catch live. The interfaces are shaped by what the estimator needs, 'give me a distance', not by any vendor's API. Switching map providers is one adapter and one line in the composition root. Tradeoff: more wiring, so I only abstract real boundaries like maps, surge, payments, and time."

---

## Closing statement

> "**S** split quick-commerce ordering so stock, billing, riders, and notifications each have one owner. **O** let the recharge app launch new cashback offers without editing tested payout code. **L** kept non-refundable premiere bookings from crashing a batch cancellation by modeling what they support. **I** gave each email screen only the slice of the mail service it uses. **D** kept the fare rule independent of any maps or surge vendor, which made it testable. I apply these when I feel the pain, not by reflex."

---

## Map of all six rounds

| Principle | R1 | R2 | R3 | R4 (utility) | R5 (Indian apps) | R6 (Indian apps) |
|---|---|---|---|---|---|---|
| S | Food receipt | Hospital discharge | Library return | To-do add task | IRCTC booking | Quick-commerce order |
| O | E-commerce discounts | Airline baggage | Cab surge | Unit converter | Brokerage charges | Recharge cashback |
| L | COD refunds | Free streaming tier | Archive storage | Medicine alarm | UPI Lite limit | Non-refundable premiere |
| I | Office printer | Smart home | User service slices | Weather providers | Zomato roles | Email client screens |
| D | Ride-hailing | E-learning | Fitness reminders | Budget alerts | UPI send money | Fare estimates |

**Pattern to remember:** the same five smells keep appearing: "and" in a class description (S), growing `if/else` on a type (O), a throwing override or hidden stricter rule (L), a client using a small slice or a stub that throws (I), and `new` on infrastructure in logic (D).

