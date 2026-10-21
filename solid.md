# SOLID Principles: Study Notes (TypeScript)

## Quick reference

| Letter | Principle | One-line rule | Smell to watch for |
|---|---|---|---|
| **S** | Single Responsibility | A class has one reason to change | Class description contains "and" |
| **O** | Open/Closed | Extend by adding code, not editing | Growing `if/else` or `switch` on type |
| **L** | Liskov Substitution | Subtypes must be safely swappable for parents | `throw new Error("not supported")` in an override |
| **I** | Interface Segregation | Don't force unused methods on clients | Empty or throwing method stubs |
| **D** | Dependency Inversion | Depend on abstractions, not concretes | `new ConcreteClass()` inside business logic |

---

## S: Single Responsibility Principle

**Definition:** A class should have only one reason to change.

**Test question:** Who would request a change to this code? If more than one team or concern, split it.

### Violation
```ts
class Invoice {
  total() { /* tax rules */ }
  toHtml() { /* formatting */ }
  save() { /* database */ }
  email() { /* SMTP */ }
}
```

### Fix
```ts
class Invoice { total() { /* ... */ } }
class InvoiceHtmlRenderer { render(inv: Invoice) { /* ... */ } }
class InvoiceRepository { save(inv: Invoice) { /* ... */ } }
class InvoiceMailer { send(inv: Invoice) { /* ... */ } }
```

### Watch out for
- Over-splitting into one-method classes
- Splitting concerns that always change together

---

## O: Open/Closed Principle

**Definition:** Open for extension, closed for modification.

**Test question:** To add a new variant, do I edit existing code?

### Violation
```ts
class DiscountCalculator {
  apply(price: number, type: string) {
    if (type === "vip") return price * 0.8;
    if (type === "festive") return price * 0.9;
    return price;
  }
}
```

### Fix (Strategy pattern)
```ts
interface DiscountStrategy { apply(price: number): number; }
class VipDiscount implements DiscountStrategy { apply(p: number) { return p * 0.8; } }
class FestiveDiscount implements DiscountStrategy { apply(p: number) { return p * 0.9; } }
// New discount = new class, nothing else changes
```

### Watch out for
- Don't abstract before a second or third variant appears (rule of three)
- Two stable branches don't need a class hierarchy

---

## L: Liskov Substitution Principle

**Definition:** Anywhere a parent type is used, any subtype must work without breaking correctness.

**Test question:** Can I pass this subclass to code written for the parent without surprises?

### Violation
```ts
class Bird { fly() { /* ... */ } }
class Ostrich extends Bird {
  fly() { throw new Error("can't fly"); }
}
```

### Fix
```ts
interface Flyable { fly(): void; }
interface Walkable { walk(): void; }
class Sparrow implements Flyable, Walkable { fly() {} walk() {} }
class Ostrich implements Walkable { walk() {} }
```

### Contract rules
- Preconditions can't be stronger
- Postconditions can't be weaker
- No new unexpected exceptions
- Parent invariants must be preserved

---

## I: Interface Segregation Principle

**Definition:** No class should be forced to implement methods it doesn't use.

**Test question:** Does every client of this interface use all of its methods?

### Violation
```ts
interface Worker { work(): void; eat(): void; sleep(): void; }
class Robot implements Worker {
  work() {}
  eat() { throw new Error("n/a"); }
  sleep() { throw new Error("n/a"); }
}
```

### Fix
```ts
interface Workable { work(): void; }
interface Eatable { eat(): void; }
class Robot implements Workable { work() {} }
```

### TypeScript helpers
- `Pick` / `Omit` for narrower views
- Intersection types (`A & B`) to recombine
- Structural typing for inline shapes

---

## D: Dependency Inversion Principle

**Definition:** High-level modules and low-level modules both depend on abstractions.

**Test question:** Does business logic call `new` on infrastructure (DB, email, payment)?

### Violation
```ts
class OrderService {
  private db = new MySqlDatabase();
  private email = new EmailService();
}
```

### Fix
```ts
interface OrderStore { save(o: Order): void; }
interface Notifier { send(to: string, msg: string): void; }

class OrderService {
  constructor(private store: OrderStore, private notifier: Notifier) {}
}

// Composition root: the only place that knows concrete classes
const service = new OrderService(new MySqlOrderStore(), new EmailNotifier());
```

### Related terms
- **DIP:** the principle
- **DI:** the technique (constructor injection)
- **IoC container:** the tool (NestJS, InversifyJS)

---

## How the principles connect

- **S** splits classes, **I** splits interfaces
- **O** says add subtypes, **L** says they must be safe to plug in
- **I** is the usual cure for **L** violations
- **D** makes **O** and testing practical

---

## Interview answer template

> "The original class did **[X, Y, Z]** together. That's **S**, so I split it into ...
> It used `if/else` on **[type]**. That's **O**, so I introduced `[Interface]` with one class per variant ...
> **[Subclass]** threw on **[method]**. That's **L** and **I**, so I split `[Interface]` into ...
> It called `new [Concrete]()` inside business logic. That's **D**, so I injected `[Interface]` from a composition root."

---

## Common mistakes checklist

- [ ] Interface per class by reflex
- [ ] Abstracting before a second variant exists
- [ ] Using `static` for anything that does I/O
- [ ] Optional methods or throwing stubs instead of splitting interfaces
- [ ] Service locator or global singletons hiding dependencies
- [ ] Not abstracting time (`new Date()`) or randomness

---

## Practice log

| Date | Problem | Principles applied | Confident? |
|---|---|---|---|
| | Parking Lot | S, O, D | |
| | Splitwise | S, O, D | |
| | Checkout | S, O, L, I, D | |
| | | | |

---

## Self-test (one line each)

1. What is the smell for **O**?
2. Which TypeScript keyword stops reassignment after construction?
3. Why is `static` risky for I/O classes?
4. Which principle does a throwing stub violate, and which cures it?
5. Where do `new` calls on concrete classes belong?

*Answers: growing `if/else` on type; `readonly`; it hard-wires dependencies and blocks testing; **L**, cured by **I**; the composition root.*