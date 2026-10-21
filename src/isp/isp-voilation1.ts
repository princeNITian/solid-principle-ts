interface Worker {
    work(): void;
    eat(): void;
    sleep(): void;
}

class Human implements Worker {
    work() {
        console.log("Human working");
    }

    eat() {
        console.log("Human eating");
    }

    sleep() {
        console.log("Human sleeping");
    }
}

class Robot implements Worker {
    work() {
        console.log("Robot working");
    }

    eat() {
        throw new Error("Robots do not eat");
    }

    sleep() {
        throw new Error("Robots do not sleep");
    }
}

// Here Robot is forced to implement methods that it does not need, violating the Interface Segregation Principle.