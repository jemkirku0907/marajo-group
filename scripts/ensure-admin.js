const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

function loadEnvFile() {
  const file = path.resolve(__dirname, "..", ".env.local");
  if (!fs.existsSync(file)) throw new Error(".env.local not found");
  const txt = fs.readFileSync(file, "utf8");
  const m = txt.match(/^DATABASE_URL=(.*)$/m);
  if (!m) throw new Error("DATABASE_URL not found in .env.local");
  return m[1].trim();
}

(async () => {
  const email = "admin@marajogroup.com";
  const passwordHash = await bcrypt.hash("Admin123!", 12);
  const pool = new Pool({ connectionString: loadEnvFile(), ssl: { rejectUnauthorized: false }, max: 2 });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const existing = await client.query("SELECT id FROM staff WHERE email=$1 LIMIT 1", [email]);
    if (existing.rows[0]) {
      await client.query(
        `UPDATE staff
         SET name=$1, role=$2, role_code=$3, password_hash=$4, is_active=1
         WHERE email=$5`,
        ["Marajo Admin", "Administrator", "admin", passwordHash, email]
      );
      console.log(`Updated admin account: ${email}`);
    } else {
      await client.query(
        `INSERT INTO staff (name, role, role_code, email, password_hash, is_active)
         VALUES ($1,$2,$3,$4,$5,1)`,
        ["Marajo Admin", "Administrator", "admin", email, passwordHash]
      );
      console.log(`Created admin account: ${email}`);
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("ERROR ensuring admin:", err.message || err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
})();
