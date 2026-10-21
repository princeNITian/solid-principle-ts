"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RegularDiscount {
    apply(price) {
        return price * 0.9; // 10% discount
    }
}
class VipDiscount {
    apply(price) {
        return price * 0.8; // 20% discount
    }
}
class FestiveDiscount {
    apply(price) {
        return price * 0.85; // 15% discount
    }
}
class Checkout {
    discountStrategy;
    constructor(discountStrategy) {
        this.discountStrategy = discountStrategy;
    }
    calculateTotal(price) {
        return this.discountStrategy.apply(price);
    }
}
// Usage
const regularCheckout = new Checkout(new RegularDiscount());
console.log(regularCheckout.calculateTotal(100)); // 90
const vipCheckout = new Checkout(new VipDiscount());
console.log(vipCheckout.calculateTotal(100)); // 80
const festiveCheckout = new Checkout(new FestiveDiscount());
console.log(festiveCheckout.calculateTotal(100)); // 85
// Now add StudentDiscount without modifying existing code
class StudentDiscount {
    apply(price) {
        return price * 0.7; // 30% discount
    }
}
const studentCheckout = new Checkout(new StudentDiscount());
console.log(studentCheckout.calculateTotal(100)); // 70
