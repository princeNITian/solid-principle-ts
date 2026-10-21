"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Human {
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
class Robot {
    work() {
        console.log("Robot working");
    }
}
// Now Robot only implements the methods it needs, adhering to the Interface Segregation Principle.
// some business logic that uses the interfaces
function performWork(worker) {
    worker.work();
}
function performSleep(sleeper) {
    sleeper.sleep();
}
function performEat(eater) {
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
