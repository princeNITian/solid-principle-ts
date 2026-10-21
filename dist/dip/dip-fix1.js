"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MySqlDatabase {
    save(order) { console.log("Saving to MySQL"); }
}
class EmailService {
    send(to, msg) { console.log("Email sent"); }
}
class OrderService {
    db;
    email;
    constructor(db, email) {
        this.db = db;
        this.email = email;
    }
    place(order) {
        this.db.save(order);
        this.email.send(order.email, "Order placed");
    }
}
const orderService = new OrderService(new MySqlDatabase(), new EmailService());
orderService.place({ email: "user@example.com" });
