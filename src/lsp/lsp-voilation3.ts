class Bird {
  fly() { console.log("flying"); }
}

class Ostrich extends Bird {
  fly() { throw new Error("Ostriches can't fly"); }
}

function launch(birds: Bird[]) {
  birds.forEach(b => b.fly());
}