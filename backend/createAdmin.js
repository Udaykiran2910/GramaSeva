
require("dotenv").config();

const bcrypt = require("bcryptjs");
const db = require("./db");

async function createAdmin() {
  const name = process.argv[2];
  const email = process.argv[3];
  const password = process.argv[4];

  if (!name || !email || !password) {
    console.log(
      'Usage: node createAdmin.js "Admin Name" "email@example.com" "StrongPassword123!"'
    );
    process.exitCode = 1;
    return;
  }

  if (password.length < 8) {
    console.log("Password must contain at least 8 characters.");
    process.exitCode = 1;
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    await db.execute(
      `INSERT INTO users (name, email, password, role)
       VALUES (?, ?, ?, 'admin')`,
      [name.trim(), email.trim().toLowerCase(), hashedPassword]
    );

    console.log("Admin account created successfully.");
    console.log("Email:", email.trim().toLowerCase());
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      console.log("That email is already registered. Use a different email.");
    } else {
      console.error("Could not create admin:", error.message);
    }

    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

createAdmin();
