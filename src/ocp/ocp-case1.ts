interface NotificationStrategy {
  send(message: string): void;
}

class EmailNotifier implements NotificationStrategy {
  send(message: string) {
    console.log(`Sending email: ${message}`);
  }
}

class SmsNotifier implements NotificationStrategy {
  send(message: string) {
    console.log(`Sending SMS: ${message}`);
  }
}

class PushNotifier implements NotificationStrategy {
  send(message: string) {
    console.log(`Sending push notification: ${message}`);
  }
}


// The NotificationSender class is now open for extension but closed for modification
class NotificationSender {
  constructor(private strategy: NotificationStrategy) {}

  send(msg: string) {
    this.strategy.send(msg);
  }
}

// Usage
const emailSender = new NotificationSender(new EmailNotifier());
emailSender.send("Hello via Email!");

const smsSender = new NotificationSender(new SmsNotifier());
smsSender.send("Hello via SMS!");

const pushSender = new NotificationSender(new PushNotifier());
pushSender.send("Hello via Push!");


// WhatsAppNotifier can be added without modifying the existing NotificationSender class
class WhatsAppNotifier implements NotificationStrategy {
  send(message: string) {
    console.log(`Sending WhatsApp message: ${message}`);
  }
}

const whatsappSender = new NotificationSender(new WhatsAppNotifier());
whatsappSender.send("Hello via WhatsApp!");