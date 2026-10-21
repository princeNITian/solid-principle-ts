class UserManager {
  register(email: string, password: string) {
    if (!email.includes("@")) throw new Error("bad email");
    const hash = md5(password);
    db.query("INSERT INTO users ...", [email, hash]);
    smtp.send(email, "Welcome!");
  }
}