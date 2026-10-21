# SOLID in an Interview: Round 2 (New Examples)

Same four-beat pattern, following the delivery tips: business story first, pain before the fix, name the smell, mention the tradeoff once, short whiteboard-style code.

---

## S: Single Responsibility (Hospital: Patient Discharge)

**Say:**
> "Let's say we're building software for a hospital. When a patient is discharged, we need to calculate the final bill, generate a discharge summary, save it to the records system, and notify the patient's family."

**Initially we'd write:**

```ts
class Discharge {
  constructor(readonly patientId: string, readonly treatments: { cost: number }[]) {}

  bill()    { /* sum treatments, apply insurance rules */ }
  summary() { /* format PDF text */ }
  save()    { /* write to records DB */ }
  notify()  { /* send SMS to family */ }
}
```

**Say:**
> "This violates **SRP**: a class should have one reason to change. Here the insurance team changes billing rules, doctors change the summary format, IT changes the records system, and communications changes the SMS vendor. One file, four owners. The smell is a class description with an 'and' in it. The pain: a billing tweak can break notifications, and I can't test `bill()` without a database."

**Let's fix it:**

```ts
class Discharge { constructor(readonly patientId: string, readonly treatments: { cost: number }[]) {} }

class BillingCalculator { total(d: Discharge): number { /* ... */ } }
class SummaryFormatter  { format(d: Discharge): string { /* ... */ } }
class RecordsRepository { save(d: Discharge): void { /* ... */ } }
class FamilyNotifier    { notify(d: Discharge): void { /* ... */ } }
```

**Say:**
> "Each class now changes for one reason, and `BillingCalculator` is testable in isolation. The tradeoff is more classes, so I'd only split where the concerns genuinely change independently."

---

## O: Open/Closed (Airline: Baggage Fees)

**Say:**
> "Let's say we're building a booking system for an airline. Baggage fees depend on the fare class: economy, business, and later, a new 'budget saver' fare."

**Initially we'd write:**

```ts
class BaggageFee {
  calculate(kg: number, fare: string): number {
    if (fare === "economy")  return Math.max(0, kg - 15) * 500;
    if (fare === "business") return Math.max(0, kg - 30) * 300;
    throw new Error("Unknown fare");
  }
}
```

**Say:**
> "This violates **OCP**: open for extension, closed for modification. When the airline launches 'budget saver', I must edit this tested method, and every fare's logic sits in the same place where a slip can break existing ones. The smell is an `if/else` chain on a type that grows with each requirement."

**Let's fix it:**

```ts
interface BaggagePolicy { fee(kg: number): number; }

class EconomyPolicy implements BaggagePolicy {
  fee(kg: number) { return Math.max(0, kg - 15) * 500; }
}
class BusinessPolicy implements BaggagePolicy {
  fee(kg: number) { return Math.max(0, kg - 30) * 300; }
}

// New fare: new class, nothing edited
class BudgetSaverPolicy implements BaggagePolicy {
  fee(kg: number) { return kg * 700; }
}

class Booking {
  constructor(private policy: BaggagePolicy) {}
  baggageFee(kg: number) { return this.policy.fee(kg); }
}
```

**Say:**
> "`Booking` never changes when fares are added. The choice of policy is made once at the edge, via a lookup map. Tradeoff: I'd wait for the second or third variant before abstracting."

---

## L: Liskov Substitution (Streaming: Subscription Plans)

**Say:**
> "Let's say we're building a video streaming platform. Users can watch and download titles, and we have a free tier with ads."

**Initially we'd write:**

```ts
class Subscription {
  stream(title: string): void { /* play */ }
  download(title: string): void { /* save offline */ }
}

class FreeTier extends Subscription {
  download(title: string): void {
    throw new Error("Upgrade to download");
  }
}

function prepareForFlight(sub: Subscription, titles: string[]) {
  titles.forEach(t => sub.download(t));   // crashes for FreeTier
}
```

**Say:**
> "This violates **LSP**: any subtype must be usable wherever the parent is, without surprises. `prepareForFlight` takes a `Subscription` and reasonably expects `download` to work. `FreeTier` compiles but crashes at runtime for real users. The compiler can't catch it because LSP is about behavior, not signatures. The smell is an override that throws 'not supported'."

**Let's fix it:**

```ts
interface Streamable { stream(title: string): void; }
interface Downloadable { download(title: string): void; }

class FreeTier implements Streamable {
  stream(title: string) { /* play with ads */ }
}
class PremiumTier implements Streamable, Downloadable {
  stream(title: string) { /* play */ }
  download(title: string) { /* save offline */ }
}

function prepareForFlight(sub: Downloadable, titles: string[]) {
  titles.forEach(t => sub.download(t));
}
// prepareForFlight(new FreeTier(), [...]);  // compile error
```

**Say:**
> "We model what's true: free users can stream, only premium can download. The production crash becomes a compile error, and the UI can show an upgrade prompt based on the type."

---

## I: Interface Segregation (Smart Home: Devices)

**Say:**
> "Let's say we're building a smart home app that controls lights, thermostats, and speakers."

**Initially we'd write:**

```ts
interface SmartDevice {
  turnOn(): void;
  turnOff(): void;
  setBrightness(level: number): void;
  setTemperature(deg: number): void;
  playMusic(track: string): void;
}

class Bulb implements SmartDevice {
  turnOn() {} turnOff() {}
  setBrightness(level: number) {}
  setTemperature(deg: number): void { throw new Error("N/A"); }
  playMusic(track: string): void { throw new Error("N/A"); }
}
```

**Say:**
> "This violates **ISP**: no class should be forced to depend on methods it doesn't use. A bulb can't play music, yet it must carry `playMusic`. If that signature changes, bulb code changes for no reason, and any client holding a `SmartDevice` can't trust it. The smell is empty or throwing stubs. It's often the root cause of LSP violations."

**Let's fix it:**

```ts
interface Switchable  { turnOn(): void; turnOff(): void; }
interface Dimmable    { setBrightness(level: number): void; }
interface Heating     { setTemperature(deg: number): void; }
interface AudioPlayer { playMusic(track: string): void; }

class Bulb implements Switchable, Dimmable { /* ... */ }
class Thermostat implements Switchable, Heating { /* ... */ }
class Speaker implements Switchable, AudioPlayer { /* ... */ }

function goodNight(devices: Switchable[]) {
  devices.forEach(d => d.turnOff());
}
```

**Say:**
> "Each interface is shaped by what a client needs. `goodNight` only needs `Switchable`, so it works across every device. I grouped `turnOn` and `turnOff` together because they always travel together, since one-method interfaces for everything would be noise."

---

## D: Dependency Inversion (Online Learning: Course Enrollment)

**Say:**
> "Let's say we're building an e-learning platform. When a student enrolls, we record the enrollment and send a confirmation, and we want a free-trial deadline based on today's date."

**Initially we'd write:**

```ts
class EnrollmentService {
  private db = new PostgresClient();       // created inside
  private mailer = new SendGridMailer();   // created inside

  enroll(studentEmail: string, courseId: string) {
    const trialEnds = new Date(Date.now() + 7 * 86400000);
    this.db.insert({ studentEmail, courseId, trialEnds });
    this.mailer.send(studentEmail, `Enrolled! Trial ends ${trialEnds}`);
  }
}
```

**Say:**
> "This violates **DIP**: high-level business logic shouldn't depend on low-level details; both should depend on abstractions. Our core enrollment rule is welded to Postgres and SendGrid, and even to the system clock. Switching vendors means editing business code, and I can't test the 7-day rule without a real database, real emails, and waiting for real time. The smell is `new` on infrastructure inside business logic."

**Let's fix it:**

```ts
interface EnrollmentStore { save(e: { email: string; courseId: string; trialEnds: Date }): void; }
interface Mailer { send(to: string, body: string): void; }
interface Clock { now(): Date; }

class PostgresEnrollmentStore implements EnrollmentStore { save(e: any) { /* SQL */ } }
class SendGridMailer implements Mailer { send(to: string, body: string) { /* API */ } }
class SystemClock implements Clock { now() { return new Date(); } }

class EnrollmentService {
  constructor(
    private store: EnrollmentStore,
    private mailer: Mailer,
    private clock: Clock,
  ) {}

  enroll(email: string, courseId: string) {
    const trialEnds = new Date(this.clock.now().getTime() + 7 * 86400000);
    this.store.save({ email, courseId, trialEnds });
    this.mailer.send(email, `Enrolled! Trial ends ${trialEnds.toDateString()}`);
  }
}

// Composition root: the only place that knows concrete classes
const svc = new EnrollmentService(
  new PostgresEnrollmentStore(), new SendGridMailer(), new SystemClock(),
);
```

**Test with fakes (no DB, no email, frozen time):**

```ts
const saved: any[] = [];
const svc = new EnrollmentService(
  { save: e => { saved.push(e); } },
  { send: () => {} },
  { now: () => new Date("2026-01-01") },
);
svc.enroll("a@b.com", "ts101");
// saved[0].trialEnds is exactly 2026-01-08
```

**Say:**
> "The service depends on interfaces shaped by our needs, injected from one composition root. Injecting a `Clock` makes time-based rules deterministic. Tradeoff: more wiring, so I only abstract real boundaries (database, email, payment, time), not every class."

---

## Closing statement

> "**S** keeps classes to one reason to change. **O** lets me add variants without editing tested code. **L** keeps subtypes safe to plug in by modeling real capabilities instead of throwing stubs. **I** keeps interfaces small and client-shaped. **D** keeps business logic independent of infrastructure and testable. I apply them when I feel the pain (growing `if/else`, throwing stubs, hard-to-test code), not by reflex."

---

## Quick map of both rounds

| Principle | Round 1 | Round 2 | Smell to name |
|---|---|---|---|
| S | Food delivery receipt | Hospital discharge | Class with "and" in its description |
| O | E-commerce discounts | Airline baggage fees | `if/else` on a type that keeps growing |
| L | Payment refunds (COD) | Streaming plans (free tier) | Override that throws "not supported" |
| I | Office printer | Smart home devices | Empty or throwing stubs |
| D | Ride-hailing | E-learning enrollment | `new` on infrastructure in business logic |
