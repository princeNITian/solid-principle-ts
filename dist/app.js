"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Account {
    static count = 0; // belongs to the class
    id; // set once, never changed
    balance = 0; // self + subclasses
    #pin; // truly private runtime
    constructor(id, pin) {
        this.id = id;
        this.#pin = pin;
        Account.count++;
    }
    get currentBalance() {
        return this.balance;
    }
    deposit(amt) {
        if (amt <= 0) {
            throw new Error("Deposit amount must be positive");
        }
        this.balance += amt;
    }
}
class Savings extends Account {
    monthlyFee() {
        return 0; // no fee for savings
    }
}
class Current extends Account {
    monthlyFee() {
        return 10; // polymorphism: different behavior for Current
    }
}
const accounts = [
    new Savings("S1", "1234"),
    new Current("C1", "5678")
];
accounts.forEach(acc => console.log(acc.id + ": $" + acc.monthlyFee())); // polymorphism: call the right method for each account
