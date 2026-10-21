# SOLID in an Interview: Round 4 (Daily Utility Apps)

Same four beats: business story, naive code, principle plus smell plus pain, fix plus tradeoff. The apps here are ones everyone uses daily: to-do, unit converter, alarm, weather, and expense tracker.

---

## S: Single Responsibility (To-Do App: Adding a Task)

**Say:**
> "Let's say we're building a to-do app. When a user adds a task, we need to validate the title, save it locally, schedule a reminder notification, and sync it to the cloud."

**Initially we'd write:**

```ts
class Task {
  constructor(readonly id: string, readonly title: string, readonly due: Date) {}

  validate()          { /* reject empty or too-long titles */ }
  save()              { /* write to local SQLite */ }
  scheduleReminder()  { /* register OS notification */ }
  syncToCloud()       { /* POST to backend */ }
}
```

**Say:**
> "This violates **SRP**: a class should have only one reason to change. Product changes validation rules, the mobile team changes how local storage works, the OS notification API changes with every Android or iOS release, and the backend team changes the sync protocol. That's four owners in one class, and the smell is that I can't describe it without saying 'and'. The pain: a notification API upgrade touches the same file as the sync code, and I can't test validation without a database."

**Let's fix it:**

```ts
class Task {
  constructor(readonly id: string, readonly title: string, readonly due: Date) {}
}

class TaskValidator     { validate(t: Task): void { /* throws if invalid */ } }
class TaskRepository    { save(t: Task): void { /* SQLite */ } }
class ReminderScheduler { schedule(t: Task): void { /* OS notification */ } }
class CloudSync         { push(t: Task): void { /* HTTP */ } }

class AddTask {                         // orchestration only
  constructor(
    private validator: TaskValidator,
    private repo: TaskRepository,
    private reminders: ReminderScheduler,
    private sync: CloudSync,
  ) {}

  run(t: Task) {
    this.validator.validate(t);
    this.repo.save(t);
    this.reminders.schedule(t);
    this.sync.push(t);
  }
}
```

**Say:**
> "Each class now changes for one reason, and `TaskValidator` is testable with no database. The coordinator has one job too: sequencing. Tradeoff: more classes, so for a weekend prototype I'd keep it in one file and split when the pain shows up."

---

## O: Open/Closed (Unit Converter)

**Say:**
> "Let's say we're building a unit converter app. Version 1 supports km to miles, kg to pounds, and Celsius to Fahrenheit. Users keep asking for more: litres to gallons, cm to inches, and so on."

**Initially we'd write:**

```ts
class Converter {
  convert(value: number, type: string): number {
    if (type === "km-mi") return value * 0.621371;
    if (type === "kg-lb") return value * 2.20462;
    if (type === "c-f")   return (value * 9) / 5 + 32;
    throw new Error("Unsupported conversion");
  }
}
```

**Say:**
> "This violates **OCP**: open for extension, closed for modification. Every new unit pair means reopening this tested method, and a typo in a new branch can break Celsius to Fahrenheit for every existing user. The smell is an `if/else` chain on a type string that grows with every feature request."

**Let's fix it:**

```ts
interface Conversion {
  convert(value: number): number;
}

class KmToMiles implements Conversion {
  convert(v: number) { return v * 0.621371; }
}
class KgToPounds implements Conversion {
  convert(v: number) { return v * 2.20462; }
}
class CelsiusToFahrenheit implements Conversion {
  convert(v: number) { return (v * 9) / 5 + 32; }
}

// New request: add a class, edit no logic
class LitresToGallons implements Conversion {
  convert(v: number) { return v * 0.264172; }
}

const conversions: Record<string, Conversion> = {
  "km-mi": new KmToMiles(),
  "kg-lb": new KgToPounds(),
  "c-f":   new CelsiusToFahrenheit(),
  "l-gal": new LitresToGallons(),          // one registry line
};

function convert(type: string, value: number): number {
  const c = conversions[type];
  if (!c) throw new Error(`Unsupported conversion: ${type}`);
  return c.convert(value);
}
```

**Say:**
> "Each conversion is isolated, so adding one can't break the others. The only edit is one line in the registry at the edge of the app. Tradeoff: with just two conversions, a plain function is fine. I'd introduce the abstraction at the third variant."

---

## L: Liskov Substitution (Alarm Clock: Snooze)

**Say:**
> "Let's say we're building an alarm clock app. Normal alarms ring and can be snoozed. We then add a medicine alarm that must never be snoozed, because a missed dose is a health risk."

**Initially we'd write:**

```ts
class Alarm {
  constructor(readonly time: string) {}
  ring()                  { console.log("Ringing", this.time); }
  snooze(minutes: number) { console.log(`Snoozed ${minutes} min`); }
}

class MedicineAlarm extends Alarm {
  snooze(minutes: number): void {
    throw new Error("Medicine alarms can't be snoozed");
  }
}

function snoozeAll(alarms: Alarm[]) {
  alarms.forEach(a => a.snooze(10));   // crashes on MedicineAlarm
}
```

**Say:**
> "This violates **LSP**: anywhere the parent type is used, any subtype must work without surprises. The 'snooze all' button takes `Alarm[]` and reasonably expects `snooze` to work. `MedicineAlarm` compiles but crashes at runtime at 6 AM, while the user is half asleep and the alarm is still ringing. The compiler can't catch it because LSP is about behavior, not signatures. The smell is an override that throws 'not supported'. Silently ignoring the call would be no better, since the UI would claim it snoozed."

**Let's fix it:**

```ts
interface Ringable  { ring(): void; }
interface Snoozable { snooze(minutes: number): void; }

class StandardAlarm implements Ringable, Snoozable {
  constructor(readonly time: string) {}
  ring()                  { console.log("Ringing", this.time); }
  snooze(minutes: number) { console.log(`Snoozed ${minutes} min`); }
}

class MedicineAlarm implements Ringable {      // makes no snooze promise
  constructor(readonly time: string) {}
  ring() { console.log("Take your medicine", this.time); }
}

function snoozeAll(alarms: Snoozable[]) {
  alarms.forEach(a => a.snooze(10));
}
// snoozeAll([new MedicineAlarm("06:00")]);   // compile error
```

**Say:**
> "We model what's true: a medicine alarm rings but isn't snoozable. A 6 AM production crash becomes a compile error, and the UI can hide the snooze button based on the type."

---

## I: Interface Segregation (Weather App: Data Providers)

**Say:**
> "Let's say we're building a weather app. We have a home-screen widget that shows the current temperature, a forecast screen with hourly and weekly data, and an air-quality card. We plan to support several weather APIs, and some are free with limited data."

**Initially we'd write:**

```ts
interface WeatherProvider {
  current(city: string): number;
  hourly(city: string): number[];
  weekly(city: string): number[];
  airQuality(city: string): number;
  alerts(city: string): string[];
}

class FreeApiProvider implements WeatherProvider {
  current(city: string) { return 29; }
  hourly(city: string): number[]  { throw new Error("Paid plan only"); }
  weekly(city: string): number[]  { throw new Error("Paid plan only"); }
  airQuality(city: string): number { throw new Error("Not supported"); }
  alerts(city: string): string[]  { throw new Error("Not supported"); }
}

class Widget {
  constructor(private weather: WeatherProvider) {}   // only needs current()
}
```

**Say:**
> "This violates **ISP**: no client should be forced to depend on methods it doesn't use. The free provider is stuck with four throwing stubs, and the widget depends on a five-method interface while using one. If the `alerts` signature changes, widget code is affected for no reason, and testing the widget means faking five methods. There are two smells here: throwing stubs on the implementer side, and a client using a tiny slice on the consumer side. The throwing stubs also set up LSP crashes."

**Let's fix it:**

```ts
interface CurrentWeather { current(city: string): number; }
interface Forecast       { hourly(city: string): number[]; weekly(city: string): number[]; }
interface AirQuality     { airQuality(city: string): number; }
interface Alerts         { alerts(city: string): string[]; }

class FreeApiProvider implements CurrentWeather {
  current(city: string) { return 29; }
}

class PremiumProvider implements CurrentWeather, Forecast, AirQuality, Alerts {
  current(city: string) { return 29; }
  hourly(city: string)  { return [29, 30, 31]; }
  weekly(city: string)  { return [29, 31, 28, 27, 30, 32, 29]; }
  airQuality(city: string) { return 82; }
  alerts(city: string)  { return ["Heat advisory"]; }
}

class Widget {
  constructor(private weather: CurrentWeather) {}     // works with both providers
  render(city: string) { return `${this.weather.current(city)}°C`; }
}

class ForecastScreen {
  constructor(private weather: Forecast) {}           // free provider can't be passed in
}
```

**Say:**
> "Each provider implements only what it supports, and each screen asks only for the slice it uses. The widget works with every provider, and `ForecastScreen` can't be given a free provider by mistake. I grouped `hourly` and `weekly` because forecast screens always use them together. One-method interfaces for everything would be noise."

---

## D: Dependency Inversion (Expense Tracker: Budget Alerts)

**Say:**
> "Let's say we're building a personal expense tracker. The user sets a monthly budget, and the app should send a notification when spending in the current month crosses it."

**Initially we'd write:**

```ts
class BudgetMonitor {
  private db = new SqliteDatabase();               // created inside
  private notifier = new PhoneNotification();      // created inside

  check(budget: number) {
    const now = new Date();                        // hidden dependency on time
    const spent = this.db.allExpenses()
      .filter(e => e.date.getMonth() === now.getMonth()
                && e.date.getFullYear() === now.getFullYear())
      .reduce((sum, e) => sum + e.amount, 0);

    if (spent > budget) this.notifier.show(`Over budget: ${spent}`);
  }
}
```

**Say:**
> "This violates **DIP**: high-level business logic shouldn't depend on low-level details; both should depend on abstractions. The rule 'alert when this month's spending exceeds the budget' is our core logic, yet it's welded to SQLite, the phone's notification API, and the system clock. If we move to cloud storage or add email alerts, I'm editing business code. And to test the monthly boundary, like an expense on the 31st versus the 1st, I'd need a real database, real notifications, and a real calendar. The smell is `new` on infrastructure inside business logic, plus `new Date()` hiding in the middle."

**Let's fix it:**

```ts
type Expense = { amount: number; date: Date };

interface ExpenseSource { all(): Expense[]; }
interface Notifier      { show(message: string): void; }
interface Clock         { now(): Date; }

class SqliteExpenseSource implements ExpenseSource { all() { /* SQL */ return []; } }
class PhoneNotifier implements Notifier { show(m: string) { /* OS API */ } }
class SystemClock implements Clock { now() { return new Date(); } }

class BudgetMonitor {
  constructor(
    private expenses: ExpenseSource,
    private notifier: Notifier,
    private clock: Clock,
  ) {}

  check(budget: number): void {
    const now = this.clock.now();
    const spent = this.expenses.all()
      .filter(e => e.date.getMonth() === now.getMonth()
                && e.date.getFullYear() === now.getFullYear())
      .reduce((sum, e) => sum + e.amount, 0);

    if (spent > budget) this.notifier.show(`Over budget: ${spent}`);
  }
}

// Composition root: the only place that knows concrete classes
const monitor = new BudgetMonitor(
  new SqliteExpenseSource(), new PhoneNotifier(), new SystemClock(),
);
```

**Test with fakes (no DB, no phone, frozen time):**

```ts
const shown: string[] = [];
const monitor = new BudgetMonitor(
  { all: () => [
      { amount: 300, date: new Date("2026-03-31") },   // last month, ignored
      { amount: 700, date: new Date("2026-04-02") },
      { amount: 500, date: new Date("2026-04-10") },
  ] },
  { show: m => { shown.push(m); } },
  { now: () => new Date("2026-04-15") },
);
monitor.check(1000);
// shown is ["Over budget: 1200"]
```

**Say:**
> "The month-boundary rule is now testable in milliseconds with frozen time. The interfaces are shaped by what the monitor needs, like 'give me expenses', not by SQLite. Adding email alerts is one new `Notifier` and one line in the composition root. Tradeoff: more wiring, so I abstract only real boundaries: storage, notifications, and time."

---

## Closing statement

> "**S** gave each task step, like validation, storage, reminders, and sync, its own reason to change. **O** let the converter grow by adding classes instead of editing a tested method. **L** kept the medicine alarm from crashing a snooze-all button by modeling what it actually supports. **I** let a free weather provider implement only the data it has, and let the widget depend on just the current temperature. **D** kept the budget rule independent of SQLite, the notification API, and the system clock, which made it testable. I apply these when I feel the pain, not by reflex."

---

## Map of all four rounds

| Principle | Round 1 | Round 2 | Round 3 | Round 4 (utility apps) | Smell to name |
|---|---|---|---|---|---|
| S | Food receipt | Hospital discharge | Library return | To-do add task | Class with "and" in its description |
| O | E-commerce discounts | Airline baggage | Cab surge | Unit converter | Growing `if/else` on a type |
| L | COD refunds | Free streaming tier | Archive storage | Medicine alarm snooze | Override that throws "not supported" |
| I | Office printer | Smart home | User service slices | Weather providers | Throwing stubs, or a client using a tiny slice |
| D | Ride-hailing | E-learning | Fitness reminders | Budget alerts | `new` on infrastructure or `new Date()` in logic |

**Pattern across all rounds:** the principle names change but the smells repeat. If you can spot the smell in unfamiliar code, you can name the principle and apply the fix.
