interface OrderStore {
  save(order: Order): void;
}

interface Notifier {
    send(to: string, msg: string): void;
}

class MySqlDatabase implements OrderStore {
  save(order: Order) { console.log("Saving to MySQL"); }
}

class EmailService implements Notifier {
  send(to: string, msg: string) { console.log("Email sent"); }
}

class OrderService {

  constructor(private db: OrderStore, private email: Notifier) {}

  place(order: Order) {
    this.db.save(order);
    this.email.send(order.email, "Order placed");
  }
}


const orderService = new OrderService(new MySqlDatabase(), new EmailService());
orderService.place({ email: "user@example.com" });