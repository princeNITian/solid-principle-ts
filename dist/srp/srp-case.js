"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Data + core business Logic
class invoice {
    lineItems;
    taxRate;
    constructor(lineItems, taxRate) {
        this.lineItems = lineItems;
        this.taxRate = taxRate;
    }
    total() {
        const subtotal = this.lineItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        return subtotal * (1 + this.taxRate);
    }
}
// Presentation Logic
class InvoicePrinter {
    render(inv) {
        return `<h1>Invoice</h1><p>Total: ${inv.total()}</p>`;
    }
}
// Persistence Logic
class InvoiceRepository {
    save(invoice) {
        // Logic to save the invoice to a database
        console.log("Invoice saved to database.");
    }
}
// Delivery Logic
class InvoiceEmailer {
    renderer;
    constructor(renderer) {
        this.renderer = renderer;
    }
    send(inv) {
        // Logic to send the invoice via email
        smtp.send(inv.customerEmail, this.renderer.render(inv));
    }
}
// Tie it all together
class InvoiceService {
    repo;
    mailer;
    constructor(repo, mailer) {
        this.repo = repo;
        this.mailer = mailer;
    }
    process(inv) {
        this.repo.save(inv);
        this.mailer.send(inv);
    }
}
