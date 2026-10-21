"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NotificationSender {
    send(channel, msg) {
        if (channel === "email") { /* send email */ }
        else if (channel === "sms") { /* send SMS */ }
        else if (channel === "push") { /* send push */ }
    }
}
// Have to add WhatsAppNotifier
