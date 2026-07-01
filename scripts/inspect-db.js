const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

function loadEnvFile() {
  const file = path.resolve(__dirname, '..', '.env.local');
  if (!fs.existsSync(file)) throw new Error('.env.local not found');
  const txt = fs.readFileSync(file, 'utf8');
  const m = txt.match(/^DATABASE_URL=(.*)$/m);
  if (!m) throw new Error('DATABASE_URL not found in .env.local');
  return m[1].trim();
}

(async () => {
  const conn = loadEnvFile();
  const pool = new Pool({ connectionString: conn, ssl: { rejectUnauthorized: false }, max: 2 });
  try {
    const tablesRes = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
    );
    const tableNames = tablesRes.rows.map((row) => row.table_name);
    console.log(JSON.stringify({ tables: tableNames }, null, 2));
    const counts = {};
    for (const table of tableNames) {
      try {
        const res = await pool.query(`SELECT COUNT(*) AS c FROM ${table}`);
        counts[table] = Number(res.rows[0]?.c ?? 0);
      } catch (err) {
        counts[table] = 'ERROR';
      }
    }
    console.log(JSON.stringify({ counts }, null, 2));
  } catch (err) {
    console.error('ERROR', err && err.message ? err.message : err);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
