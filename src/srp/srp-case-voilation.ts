/*
SRP: a class should have only one reason to change. 
A good test is to ask “who would request a change to this code?” 
If the answer is more than one team or concern, split it.
*/
class Invoice {
    constructor(
        readonly items: { name: string; price: number; qty: number }[],
        readonly customerEmail: string,
    ) {}

    // Reason 1: business rules (finance team changes tax logic)
    total(): number {
        const subtotal = this.items.reduce((s,i) => s + i.price * i.qty, 0);
        return subtotal * 1.18; // GST
    }

    // Reason 2: presentation (design team changes the format)
    toHtml(): string {
        return `<h1>Invoice</h1><p>Total: ${this.total()}</p>`;
    }

    // Reason 3: persistence (infra team changes the database)
    save() {
        db.query("INSERT INTO invoices ...");
    }

    // Reason 4: delivery (marketing changes the email provider)
    email() {
        smtp.send(this.customerEmail, this.toHtml());
    }
}

/* Changing the GST rate, the HTML layout,
   the database, or the email provider all force edits to the same file,
   and each edit risks breaking the others.  
*/