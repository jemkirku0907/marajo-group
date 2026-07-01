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

const tables = [
  'appointments',
  'contacts',
  'inquiries',
  'tasks',
  'parking_reservations',
  'parking_slots',
  'parking_facilities',
  'properties',
  'units',
  'staff',
  'users',
];

(async () => {
  const conn = loadEnvFile();
  const pool = new Pool({ connectionString: conn, ssl: { rejectUnauthorized: false }, max: 2 });
  try {
    for (const table of tables) {
      console.log(`\nTABLE: ${table}`);
      const cols = await pool.query(
        `SELECT column_name, data_type, is_nullable, column_default
         FROM information_schema.columns
         WHERE table_schema='public' AND table_name=$1
         ORDER BY ordinal_position`,
        [table]
      );
      cols.rows.forEach((col) => {
        console.log(`  ${col.column_name} ${col.data_type} ${col.is_nullable} ${col.column_default || ''}`);
      });
    }
  } catch (err) {
    console.error('ERROR', err && err.message ? err.message : err);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
