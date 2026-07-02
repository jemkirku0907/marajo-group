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

async function tableExists(client, table) {
  const { rows } = await client.query(
    `SELECT COUNT(*) AS c FROM information_schema.tables WHERE table_schema='public' AND table_name=$1`,
    [table]
  );
  return Number(rows[0]?.c ?? 0) > 0;
}

(async () => {
  const connStr = loadEnvFile();
  const pool = new Pool({ connectionString: connStr, ssl: { rejectUnauthorized: false }, max: 2 });
  const client = await pool.connect();

  try {
    if (!(await tableExists(client, 'payments'))) {
      console.log('Creating payments table...');
      await client.query(`
        CREATE TABLE payments (
          id SERIAL PRIMARY KEY,
          parking_reservation_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          amount NUMERIC(12,2) NOT NULL DEFAULT 0,
          base_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
          vat_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
          service_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
          payment_status VARCHAR(32) NOT NULL DEFAULT 'pending',
          reference_number VARCHAR(128) NOT NULL,
          payment_date TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
      await client.query(`CREATE INDEX payments_parking_reservation_id_idx ON payments (parking_reservation_id);`);
      await client.query(`CREATE INDEX payments_payment_status_idx ON payments (payment_status);`);
      await client.query(`CREATE INDEX payments_payment_date_idx ON payments (payment_date);`);
      console.log('payments table created successfully.');
    } else {
      console.log('payments table already exists.');
    }

    if (!(await tableExists(client, 'worker_bookings'))) {
      console.log('Creating worker_bookings table...');
      await client.query(`
        CREATE TABLE worker_bookings (
          id SERIAL PRIMARY KEY,
          user_id INTEGER,
          client_name VARCHAR(255) NOT NULL,
          contact_number VARCHAR(64) NOT NULL,
          email VARCHAR(255) NOT NULL,
          position VARCHAR(100) NOT NULL,
          slots_needed INTEGER NOT NULL DEFAULT 1,
          job_date DATE NOT NULL,
          shift_start TIME NOT NULL,
          shift_end TIME NOT NULL,
          notes TEXT,
          status VARCHAR(32) NOT NULL DEFAULT 'pending',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
      await client.query(`CREATE INDEX worker_bookings_user_id_idx ON worker_bookings (user_id);`);
      await client.query(`CREATE INDEX worker_bookings_job_date_idx ON worker_bookings (job_date);`);
      console.log('worker_bookings table created successfully.');
    } else {
      console.log('worker_bookings table already exists.');
    }
  } catch (error) {
    console.error('ERROR ensuring schema tables:', error.message || error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
})();
