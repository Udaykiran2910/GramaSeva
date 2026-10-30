const bcrypt = require("bcryptjs");
const db = require("./db");

async function checkAdmin() {
  try {
    const email = "admin@gramaseva.com";
    const password = "ChangeMe123!";

    const [rows] = await db.execute(
      "SELECT id, email, password FROM admins WHERE email = ? LIMIT 1",
      [email]
    );

    console.log("Database admin found:", rows.length > 0);

    if (rows.length > 0) {
      console.log("Admin email:", rows[0].email);

      const matches = await bcrypt.compare(
        password,
        rows[0].password
      );

      console.log("Password matches database hash:", matches);
    }
  } catch (error) {
    console.error("Diagnostic error:", error.message);
  } finally {
    await db.end();
  }
}

checkAdmin();