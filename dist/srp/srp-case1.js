"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EmailValidator {
    validate(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}
class ReverseHasher {
    hash(password) {
        return password.split("").reverse().join("");
    }
}
class ConsoleUserStore {
    save(email, hash) {
        console.log(`Saving ${email} with hash ${hash}`);
    }
}
class ConsoleNotifier {
    sendWelcome(email) {
        console.log(`Welcome email to ${email}`);
    }
}
// Coordinating class that uses the above interfaces
class UserRegistration {
    validator;
    hasher;
    store;
    notifier;
    constructor(validator, hasher, store, notifier) {
        this.validator = validator;
        this.hasher = hasher;
        this.store = store;
        this.notifier = notifier;
    }
    register(email, password) {
        if (!this.validator.validate(email))
            throw new Error("Invalid email");
        const hash = this.hasher.hash(password);
        this.store.save(email, hash);
        this.notifier.sendWelcome(email);
    }
}
// Wiring (done once, at the app's entry point)
const registration = new UserRegistration(new EmailValidator(), new ReverseHasher(), new ConsoleUserStore(), new ConsoleNotifier());
registration.register("a@b.com", "secret");
