class NotificationSender {
  send(channel: string, msg: string) {
    if (channel === "email") { /* send email */ }
    else if (channel === "sms") { /* send SMS */ }
    else if (channel === "push") { /* send push */ }
  }
}

// Have to add WhatsAppNotifier
