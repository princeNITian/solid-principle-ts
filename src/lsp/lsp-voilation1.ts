/*
    Liskov Substitution Principle (LSP): anywhere you use a parent type, you must be able to use any subtype without breaking correctness. 
    A subclass should honor the parent’s contract, not just match its method signatures.
*/

class Rectangle {
  constructor(protected w: number, protected h: number) {}
  setWidth(w: number) { this.w = w; }
  setHeight(h: number) { this.h = h; }
  area() { return this.w * this.h; }
}

class Square extends Rectangle {
  setWidth(w: number) { this.w = w; this.h = w; }   // surprise side effect
  setHeight(h: number) { this.w = h; this.h = h; }
}

function resize(r: Rectangle) {
  r.setWidth(5);
  r.setHeight(4);
  console.log(r.area()); // caller expects 20
}

resize(new Rectangle(1, 1)); // 20
resize(new Square(1, 1));    // 16, broken