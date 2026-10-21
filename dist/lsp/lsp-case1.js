"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Rectangle {
    w;
    h;
    constructor(w, h) {
        this.w = w;
        this.h = h;
    }
    area() { return this.w * this.h; }
}
class Square {
    side;
    constructor(side) {
        this.side = side;
    }
    area() { return this.side ** 2; }
}
// The areaCalculator function can now accept any shape that implements the Shape interface
function areaCalculator(shape) {
    return shape.area();
}
// Usage
const rectangle = new Rectangle(5, 4);
console.log(areaCalculator(rectangle)); // 20
const square = new Square(5);
console.log(areaCalculator(square)); // 25
