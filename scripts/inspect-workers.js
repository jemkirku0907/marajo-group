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
  const connectionString = loadEnvFile();
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();
  try {
    const cols = await client.query(
      "SELECT column_name, data_type, character_maximum_length FROM information_schema.columns WHERE table_schema='public' AND table_name='workers' ORDER BY ordinal_position"
    );
    console.log('WORKERS COLUMNS:');
    cols.rows.forEach((row) => console.log(`${row.column_name} | ${row.data_type}${row.character_maximum_length ? `(${row.character_maximum_length})` : ''}`));

    const userCount = await client.query('SELECT COUNT(*) AS c FROM users');
    console.log('USERS:', userCount.rows[0].c);

    const sample = await client.query('SELECT id, email, first_name, last_name FROM users ORDER BY id LIMIT 5');
    console.log('USER SAMPLE:', JSON.stringify(sample.rows, null, 2));
  } catch (err) {
    console.error('ERROR', err.message || err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
})();
