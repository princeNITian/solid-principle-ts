"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EmailNotifier {
    send(message) {
        console.log(`Sending email: ${message}`);
    }
}
class SmsNotifier {
    send(message) {
        console.log(`Sending SMS: ${message}`);
    }
}
class PushNotifier {
    send(message) {
        console.log(`Sending push notification: ${message}`);
    }
}
// The NotificationSender class is now open for extension but closed for modification
class NotificationSender {
    strategy;
    constructor(strategy) {
        this.strategy = strategy;
    }
    send(msg) {
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
class WhatsAppNotifier {
    send(message) {
        console.log(`Sending WhatsApp message: ${message}`);
    }
}
const whatsappSender = new NotificationSender(new WhatsAppNotifier());
whatsappSender.send("Hello via WhatsApp!");
