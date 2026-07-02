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
  const connStr = loadEnvFile();
  const pool = new Pool({ connectionString: connStr, ssl: { rejectUnauthorized: false }, max: 2 });
  const client = await pool.connect();

  try {
    const tableNames = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
    );
    console.log('TABLES:', tableNames.rows.map((r) => r.table_name).join(', '));

    const queries = [
      { label: 'workers', sql: 'SELECT COUNT(*) AS c FROM workers' },
      { label: 'approved_available_workers', sql: "SELECT COUNT(*) AS c FROM workers WHERE verification_status='approved' AND availability_status='available'" },
      { label: 'work_schedules', sql: 'SELECT COUNT(*) AS c FROM work_schedules' },
      { label: 'worker_bookings', sql: 'SELECT COUNT(*) AS c FROM worker_bookings' },
      { label: 'users', sql: 'SELECT COUNT(*) AS c FROM users' },
    ];

    for (const q of queries) {
      try {
        const res = await client.query(q.sql);
        console.log(`${q.label}: ${res.rows[0].c}`);
      } catch (err) {
        console.log(`${q.label}: ERROR ${err.message}`);
      }
    }
  } catch (err) {
    console.error('ERROR', err.message || err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
})();
