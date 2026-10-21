abstract class Account {
    static count = 0; // belongs to the class
    readonly id: string; // set once, never changed
    protected balance = 0; // self + subclasses
    #pin: string; // truly private runtime

    constructor(id: string, pin: string) {
        this.id = id;
        this.#pin = pin;
        Account.count++;
    }

    get currentBalance() { // getter: read-only property
        return this.balance;
    }

    deposit(amt: number) { // encapsulation: validate here
        if (amt <= 0) {
            throw new Error("Deposit amount must be positive");
        }
        this.balance += amt;
    }

    abstract monthlyFee(): number; // subclasses must implement
}

class Savings extends Account { // inheritance: Savings is an Account
    monthlyFee() {
        return 0; // no fee for savings
    }
}

class Current extends Account {
    override monthlyFee() {
        return 10; // polymorphism: different behavior for Current
    }
}

const accounts: Account[] = [
    new Savings("S1", "1234"),
    new Current("C1", "5678")
];

accounts.forEach(acc => console.log(acc.id + ": $" + acc.monthlyFee())); // polymorphism: call the right method for each account