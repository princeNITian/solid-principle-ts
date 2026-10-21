# SOLID in an Interview: Round 3 (New Examples)

Same four-beat pattern: business story, naive code, name the principle and the smell, fix it.

---

## S: Single Responsibility (Library: Book Checkout)

**Say:**
> "Let's say we're building software for a public library. When a member returns a book, we need to calculate any late fine, update the book's availability, log the transaction, and send a reminder if the fine is unpaid."

**Initially we'd write:**

```ts
class BookReturn {
  constructor(readonly memberId: string, readonly bookId: string, readonly dueDate: Date) {}

  fine(returnedOn: Date)   { /* days late * rate, cap at book price */ }
  markAvailable()          { /* UPDATE books SET available = true */ }
  logTransaction()         { /* INSERT INTO audit_log */ }
  sendReminder()           { /* email member about fine */ }
}
```

**Say:**
> "This violates **SRP**: a class should have one reason to change. The librarian's policy changes the fine rules, the inventory team changes availability tracking, compliance changes audit logging, and IT changes the email vendor. The smell is that I can't describe this class without saying 'and'. The pain: tweaking the fine cap risks breaking the audit log, and I can't test `fine()` without a database."

**Let's fix it:**

```ts
class BookReturn {
  constructor(readonly memberId: string, readonly bookId: string, readonly dueDate: Date) {}
}

class FineCalculator   { amount(r: BookReturn, returnedOn: Date): number { /* ... */ } }
class BookInventory    { markAvailable(bookId: string): void { /* ... */ } }
class AuditLog         { record(r: BookReturn): void { /* ... */ } }
class FineReminder     { send(memberId: string, fine: number): void { /* ... */ } }
```

**Say:**
> "Each class has one owner and one reason to change, and `FineCalculator` is a pure function of its inputs, so it's trivially testable. Tradeoff: more classes, so I'd split only where concerns really change independently."

---

## O: Open/Closed (Ride Sharing: Surge Pricing)

**Say:**
> "Let's say we're building fare calculation for a cab app. Today we charge by distance, and the business wants rain surge, peak-hour surge, and later airport pickup fees."

**Initially we'd write:**

```ts
class FareCalculator {
  calculate(km: number, condition: string): number {
    const base = km * 12;
    if (condition === "rain") return base * 1.5;
    if (condition === "peak") return base * 1.3;
    return base;
  }
}
```

**Say:**
> "This violates **OCP**: open for extension, closed for modification. When the airport fee arrives, I edit this tested method again, and each new rule can accidentally change the others. The smell is an `if/else` on a type that grows with every business request. A second problem: what if rain and peak apply together? This design can't express that."

**Let's fix it:**

```ts
interface PricingRule {
  apply(fare: number): number;
}

class RainSurge implements PricingRule {
  apply(fare: number) { return fare * 1.5; }
}
class PeakSurge implements PricingRule {
  apply(fare: number) { return fare * 1.3; }
}

// New requirement: add a class, edit nothing
class AirportFee implements PricingRule {
  apply(fare: number) { return fare + 150; }
}

class FareCalculator {
  constructor(private rules: PricingRule[]) {}

  calculate(km: number): number {
    const base = km * 12;
    return this.rules.reduce((fare, rule) => rule.apply(fare), base);
  }
}

new FareCalculator([new RainSurge(), new PeakSurge()]).calculate(10);
```

**Say:**
> "Rules are now composable: rain plus peak is just two entries in a list. `FareCalculator` never changes when rules are added. Note that rule order can matter (multiplier before flat fee), so I'd document or test it. Tradeoff: I'd wait for the second or third rule before introducing this."

---

## L: Liskov Substitution (File Storage: Cloud Drive)

**Say:**
> "Let's say we're building a document app that stores files. We have normal storage, and the company also wants an 'archive' storage for old documents that must never change."

**Initially we'd write:**

```ts
class Storage {
  read(name: string): string { /* ... */ return ""; }
  write(name: string, data: string): void { /* ... */ }
}

class ArchiveStorage extends Storage {
  write(name: string, data: string): void {
    throw new Error("Archive is read-only");
  }
}

function autosave(store: Storage, name: string, text: string) {
  store.write(name, text);     // crashes for ArchiveStorage
}
```

**Say:**
> "This violates **LSP**: anywhere the parent type is used, any subtype must work without surprises. `autosave` takes a `Storage` and reasonably expects `write` to succeed. `ArchiveStorage` compiles but blows up at runtime, possibly losing a user's unsaved work. The compiler can't catch it because LSP is about behavior, not signatures. The smell is an override that throws 'not supported'. Silently doing nothing would be just as bad, because it would hide data loss."

**Let's fix it:**

```ts
interface Readable  { read(name: string): string; }
interface Writable  { write(name: string, data: string): void; }

class DiskStorage implements Readable, Writable {
  read(name: string) { return ""; }
  write(name: string, data: string) { /* ... */ }
}

class ArchiveStorage implements Readable {
  read(name: string) { return ""; }
}

function autosave(store: Writable, name: string, text: string) {
  store.write(name, text);
}
// autosave(new ArchiveStorage(), "a.txt", "x");   // compile error
```

**Say:**
> "We model what's true: archives can be read but not written. The runtime crash becomes a compile error, and `autosave` states exactly what it needs."

---

## I: Interface Segregation (Notifications: Mobile App Services)

**Say:**
> "Let's say we're building the backend for a news app. Different services consume a user data layer: the home feed reads profiles, the settings screen updates them, and an admin tool deletes accounts."

**Initially we'd write:**

```ts
interface UserService {
  getProfile(id: string): User;
  updateProfile(id: string, data: Partial<User>): void;
  deleteAccount(id: string): void;
  exportAllUsers(): User[];
}

class FeedService {
  constructor(private users: UserService) {}   // only needs getProfile
  render(id: string) { const u = this.users.getProfile(id); /* ... */ }
}
```

**Say:**
> "This violates **ISP**: no client should be forced to depend on methods it doesn't use. `FeedService` only reads a profile, yet it depends on `deleteAccount` and `exportAllUsers`. If either signature changes, the feed code is affected for no reason, and the feed could accidentally call something destructive. For testing, I'd have to fake four methods to test one. The smell is a big interface where each client uses a small slice. ISP is about what clients need, so I count who uses what, not how many methods exist."

**Let's fix it:**

```ts
interface ProfileReader  { getProfile(id: string): User; }
interface ProfileWriter  { updateProfile(id: string, data: Partial<User>): void; }
interface AccountAdmin   { deleteAccount(id: string): void; exportAllUsers(): User[]; }

class UserRepository implements ProfileReader, ProfileWriter, AccountAdmin { /* ... */ }

class FeedService {
  constructor(private users: ProfileReader) {}    // can't delete, even by mistake
}
class SettingsService {
  constructor(private users: ProfileReader & ProfileWriter) {}
}
```

**Say:**
> "One class can still implement everything, but each client asks for only its slice. Tests for `FeedService` fake a single method. I grouped `deleteAccount` and `exportAllUsers` because the same admin clients use both. TypeScript's intersection types (`A & B`) make recombining cheap, and `Pick<UserService, 'getProfile'>` can derive a slice from an existing interface."

---

## D: Dependency Inversion (Fitness App: Workout Reminders)

**Say:**
> "Let's say we're building a fitness app. Every morning it checks whether a user has worked out in the last 3 days, and if not, sends a motivational push notification."

**Initially we'd write:**

```ts
class ReminderJob {
  private db = new MongoClient();           // created inside
  private push = new FirebasePush();        // created inside

  run() {
    const users = this.db.findAll();
    const threeDaysAgo = Date.now() - 3 * 86400000;
    for (const u of users) {
      if (u.lastWorkout < threeDaysAgo) {
        this.push.send(u.deviceToken, "Time to move!");
      }
    }
  }
}
```

**Say:**
> "This violates **DIP**: high-level business logic shouldn't depend on low-level details; both should depend on abstractions. The rule 'inactive for 3 days means remind' is our core logic, yet it's welded to MongoDB, Firebase, and the system clock. Moving to Postgres or APNs means editing business code. And to test the 3-day rule, I'd need a real database, real push messages to real phones, and real time. The smell is `new` on infrastructure inside business logic."

**Let's fix it:**

```ts
interface UserSource   { findAll(): { deviceToken: string; lastWorkout: number }[]; }
interface PushSender   { send(token: string, msg: string): void; }
interface Clock        { now(): number; }

class MongoUserSource implements UserSource { findAll() { /* Mongo query */ return []; } }
class FirebasePushSender implements PushSender { send(t: string, m: string) { /* FCM */ } }
class SystemClock implements Clock { now() { return Date.now(); } }

class ReminderJob {
  constructor(
    private users: UserSource,
    private push: PushSender,
    private clock: Clock,
  ) {}

  run(): void {
    const cutoff = this.clock.now() - 3 * 86400000;
    for (const u of this.users.findAll()) {
      if (u.lastWorkout < cutoff) this.push.send(u.deviceToken, "Time to move!");
    }
  }
}

// Composition root
const job = new ReminderJob(new MongoUserSource(), new FirebasePushSender(), new SystemClock());
```

**Test with fakes:**

```ts
const sent: string[] = [];
const day = 86400000;
const job = new ReminderJob(
  { findAll: () => [
      { deviceToken: "old", lastWorkout: 0 },
      { deviceToken: "recent", lastWorkout: 9 * day },
  ] },
  { send: (t) => { sent.push(t); } },
  { now: () => 10 * day },
);
job.run();
// sent is ["old"]; no DB, no phones, frozen time
```

**Say:**
> "The 3-day rule is now a pure piece of logic I can test in milliseconds. The abstractions are shaped by what the job needs (`UserSource`, not 'Mongo'), so swapping vendors is one adapter and one line in the composition root. Tradeoff: more wiring, so I abstract only real boundaries like database, push, and time."

---

## Closing statement

> "**S** gives each class one reason to change. **O** lets me add rules without editing tested code. **L** keeps subtypes safe by modeling real capabilities. **I** keeps interfaces shaped by what each client uses. **D** keeps business rules independent of infrastructure, which makes them testable. I apply them when I feel the pain, not by reflex."

---

## Map of all three rounds

| Principle | Round 1 | Round 2 | Round 3 | Smell to name |
|---|---|---|---|---|
| S | Food delivery receipt | Hospital discharge | Library book return | Class with "and" in its description |
| O | E-commerce discounts | Airline baggage fees | Cab surge pricing | `if/else` on a type that keeps growing |
| L | Payment refunds (COD) | Streaming free tier | Archive storage | Override that throws "not supported" |
| I | Office printer | Smart home devices | User service slices | Client uses a small slice of a big interface |
| D | Ride-hailing | E-learning enrollment | Fitness reminders | `new` on infrastructure in business logic |
