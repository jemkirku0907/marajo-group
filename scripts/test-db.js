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
  try {
    const conn = loadEnvFile();
    console.log('Using DATABASE_URL:', conn.replace(/:\/\/.*@/, '://***@'));
    const pool = new Pool({ connectionString: conn, ssl: { rejectUnauthorized: false }, max: 2 });
    const res = await pool.query('SELECT 1 AS ok');
    console.log('Query result:', res.rows[0]);
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('ERROR', err && err.message ? err.message : err);
    process.exit(2);
  }
})();
