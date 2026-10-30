
const bcrypt = require("bcryptjs");
const db = require("./db");

async function resetAdminPassword() {
  const email = "admin@gramaseva.com";
  const newPassword = "Grama@123";

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const [result] = await db.execute(
      "UPDATE admins SET password = ? WHERE email = ?",
      [hashedPassword, email]
    );

    if (result.affectedRows === 0) {
      console.log("Admin account not found.");
    } else {
      console.log("Admin password reset successfully.");
      console.log("Email:", email);
      console.log("Password:", newPassword);
    }
  } catch (error) {
    console.error("Password reset failed:", error.message);
  } finally {
    await db.end();
  }
}

resetAdminPassword();
