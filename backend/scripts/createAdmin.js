const bcrypt = require("bcrypt");
require("dotenv").config();
const db = require("../db");

async function createAdmin() {
  const fullName = process.env.ADMIN_FULL_NAME || "Admin User";
  const email = process.env.ADMIN_EMAIL || "admin@lagrancesela.com";
  const password = process.env.ADMIN_PASSWORD || "ChangeThisPassword123!";
  const role = process.env.ADMIN_ROLE || "Owner";

  const hash = await bcrypt.hash(password, 10);

  await db.query(
    `INSERT INTO admins (full_name, email, password_hash, role, is_active)
     VALUES (?, ?, ?, ?, TRUE)
     ON DUPLICATE KEY UPDATE
       full_name = VALUES(full_name),
       password_hash = VALUES(password_hash),
       role = VALUES(role),
       is_active = TRUE`,
    [fullName, email, hash, role]
  );

  console.log(`Admin ready: ${email} / ${role}`);
  process.exit(0);
}

createAdmin().catch((error) => {
  console.error("Create admin error:", error.message);
  process.exit(1);
});
