interface Flyable { fly(): void; }
interface Walkable { walk(): void; }

class Ostrich implements Walkable {
  walk() { console.log("walking"); }
}

class Eagle implements Flyable, Walkable {
  fly() { console.log("flying"); }
  walk() { console.log("walking"); }
}

// Function that launches all birds that can fly
function launch(birds: Flyable[]) {
  birds.forEach(b => b.fly());
}

// Usage
const eagle = new Eagle();
const ostrich = new Ostrich();

launch([eagle]); // Works fine
// launch([ostrich]); // compile time error: Ostrich does not implement Flyable 