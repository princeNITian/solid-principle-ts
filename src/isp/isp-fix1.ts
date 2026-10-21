interface Workable { work(): void; }
interface Sleepable { sleep(): void; }
interface Eatable { eat(): void; }

class Human implements Workable, Sleepable, Eatable {
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

class Robot implements Workable {

    work() {
        console.log("Robot working");
    }
}

// Now Robot only implements the methods it needs, adhering to the Interface Segregation Principle.

// some business logic that uses the interfaces
function performWork(worker: Workable) {
    worker.work();
}

function performSleep(sleeper: Sleepable) {
    sleeper.sleep();
}

function performEat(eater: Eatable) {
    eater.eat();
}

// Usage
const human = new Human();
performWork(human);
performSleep(human);
performEat(human);

const robot = new Robot();
performWork(robot);
// performSleep(robot); // compile time error: Robot does not implement Sleepable
// performEat(robot); // compile time error: Robot does not implement Eatable
