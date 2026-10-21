/*
Open/Closed Principle (OCP): open for extension, closed for modification.
You should be able to add new behavior by writing new code, not by editing code that already works and is tested.

The smell: an if/else or switch on a type that grows every time a requirement is added.
*/

type CustomerType = "regular" | "vip" | "festive";

class DiscountCalculator {
  apply(price: number, type: CustomerType): number {
    if (type === "regular") return price;
    if (type === "vip") return price * 0.8;
    if (type === "festive") return price * 0.9;
    throw new Error("Unknown type");
  }
}

/*
Adding “student” means editing apply. Every edit risks breaking the existing branches, and every caller’s tests need re-running.

Refactor: Strategy pattern
*/