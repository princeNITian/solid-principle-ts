interface Validator { validate(email: string): boolean; }
interface Hasher { hash(password: string): string; }
interface UserStore { save(email: string, hash: string): void; }
interface Notifier { sendWelcome(email: string): void; }

class EmailValidator implements Validator {
  validate(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

class ReverseHasher implements Hasher {          // mock; swap for bcrypt later
  hash(password: string) {
    return password.split("").reverse().join("");
  }
}

class ConsoleUserStore implements UserStore {
  save(email: string, hash: string) {
    console.log(`Saving ${email} with hash ${hash}`);
  }
}

class ConsoleNotifier implements Notifier {
  sendWelcome(email: string) {
    console.log(`Welcome email to ${email}`);
  }
}


// Coordinating class that uses the above interfaces
class UserRegistration {
  constructor(
    private validator: Validator,
    private hasher: Hasher,
    private store: UserStore,
    private notifier: Notifier,
  ) {}

  register(email: string, password: string): void {
    if (!this.validator.validate(email)) throw new Error("Invalid email");
    const hash = this.hasher.hash(password);
    this.store.save(email, hash);
    this.notifier.sendWelcome(email);
  }
}

// Wiring (done once, at the app's entry point)
const registration = new UserRegistration(
  new EmailValidator(),
  new ReverseHasher(),
  new ConsoleUserStore(),
  new ConsoleNotifier(),
);
registration.register("a@b.com", "secret");