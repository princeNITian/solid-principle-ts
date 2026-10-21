"use strict";
/*
Dependency Inversion Principle (DIP): high-level modules shouldn’t depend on low-level modules. Both should depend on abstractions. Also, abstractions shouldn’t depend on details; details depend on abstractions.

High-level: business logic (OrderService, UserRegistration)
Low-level: details (MySQL, SMTP, Stripe, file system)

Without DIP, the arrow points from business logic down to the details. With DIP, both point at an interface that the high-level code owns.
*/
Object.defineProperty(exports, "__esModule", { value: true });
class MySqlDatabase {
    save(order) { console.log("Saving to MySQL"); }
}
class EmailService {
    send(to, msg) { console.log("Email sent"); }
}
class OrderService {
    db = new MySqlDatabase(); // created inside
    email = new EmailService(); // created inside
    place(order) {
        this.db.save(order);
        this.email.send(order.email, "Order placed");
    }
}
/*
Problems:

Switching to Postgres or SMS means editing OrderService
You can’t unit test place without hitting the real DB and mail server
Business logic knows infrastructure details

*/ 
