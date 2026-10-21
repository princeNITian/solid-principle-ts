"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserManager {
    register(email, password) {
        if (!email.includes("@"))
            throw new Error("bad email");
        const hash = md5(password);
        db.query("INSERT INTO users ...", [email, hash]);
        smtp.send(email, "Welcome!");
    }
}
