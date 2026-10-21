"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Ostrich {
    walk() { console.log("walking"); }
}
class Eagle {
    fly() { console.log("flying"); }
    walk() { console.log("walking"); }
}
// Function that launches all birds that can fly
function launch(birds) {
    birds.forEach(b => b.fly());
}
// Usage
const eagle = new Eagle();
const ostrich = new Ostrich();
launch([eagle]); // Works fine
// launch([ostrich]); // compile time error: Ostrich does not implement Flyable 
