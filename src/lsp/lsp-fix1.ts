interface Shape { area(): number; }

class Rectangle implements Shape {
  constructor(readonly w: number, readonly h: number) {}
  area() { return this.w * this.h; }
}

class Square implements Shape {
  constructor(readonly side: number) {}
  area() { return this.side ** 2; }
}

// The areaCalculator function can now accept any shape that implements the Shape interface
function areaCalculator(shape: Shape) {
  return shape.area();
}

// Usage
const rectangle = new Rectangle(5, 4);20
console.log(areaCalculator(rectangle)); // 20

const square = new Square(5);
console.log(areaCalculator(square)); // 25

