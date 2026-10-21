type LineItem = { name: string; price: number; quantity: number };

// Data + core business Logic
class invoice {
    constructor(
        public lineItems: LineItem[],
        public taxRate: number
    ) {}

    total(): number {
        const subtotal = this.lineItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        return subtotal * (1 + this.taxRate);
    }
}


// Presentation Logic
class InvoicePrinter  {

    render(inv: invoice): string {
        return `<h1>Invoice</h1><p>Total: ${inv.total()}</p>`;
    }
}

// Persistence Logic
class InvoiceRepository {
    save(invoice: invoice): void {
        // Logic to save the invoice to a database
        console.log("Invoice saved to database.");
    }
}

// Delivery Logic
class InvoiceEmailer {
    constructor(private renderer: InvoicePrinter) {}

    send(inv: invoice): void {
        // Logic to send the invoice via email
        smtp.send(inv.customerEmail,this.renderer.render(inv));
    }
}


// Tie it all together
class InvoiceService {
  constructor(
    private repo: InvoiceRepository,
    private mailer: InvoiceEmailer,
  ) {}

  process(inv: invoice) {
    this.repo.save(inv);
    this.mailer.send(inv);
  }
}