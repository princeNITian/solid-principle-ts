"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Bird {
    fly() { console.log("flying"); }
}
class Ostrich extends Bird {
    fly() { throw new Error("Ostriches can't fly"); }
}
function launch(birds) {
    birds.forEach(b => b.fly());
}
