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

function now() {
  return new Date().toISOString();
}

(async () => {
  const connStr = loadEnvFile();
  const pool = new Pool({ connectionString: connStr, ssl: { rejectUnauthorized: false }, max: 2 });
  const client = await pool.connect();

  try {
    // seed staff passwords for login
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash('admin123', 10);

    console.log('Updating admin password...');
    try {
      await client.query('BEGIN');
      await client.query(`UPDATE staff SET password_hash = $1 WHERE id = 1`, [passwordHash]);
      await client.query('COMMIT');
    } catch (e) {
      console.error('Failed updating admin password, continuing:', e.message || e);
      try {
        await client.query('ROLLBACK');
      } catch {}
    }

    console.log('Seeding inquiries...');
    try {
      await client.query('BEGIN');
      await client.query(`DELETE FROM inquiries`);
      await client.query(`DELETE FROM inquiry_activity`);
      await client.query(`DELETE FROM inquiry_notes`);
      await client.query(`DELETE FROM appointments`);
      await client.query(`DELETE FROM notifications WHERE title = 'Lead Status Updated' OR title = 'Appointment Created'`);

      await client.query('COMMIT');
    } catch (e) {
      console.error('Inquiries seed failed:', e.message || e);
      try {
        await client.query('ROLLBACK');
      } catch {}
    }

    const inquiryValues = [
      [1, 1, 'Maria Santos', 'maria@email.com', '+63 917 111 1111', 'Email', 'Marajo Tower', 'Studio Suite', 'Studio', 'PHP 2.8M', 'Cash', 'Personal Residence', 'Within 3 months', '2026-07-15', '10:00', 'Tower A', 'BGC, Taguig', 'Interested in studio.', 'https://marajogroup.com/properties/marajo-tower', 'Website', 'New Lead', 10, 2, 1, 1, '2026-06-30 16:31:20.568+00'],
      [2, 2, 'Carlos Reyes', 'carlos@email.com', '+63 918 222 2222', 'Phone', 'CEO Flats', 'Executive Studio', 'Studio', 'PHP 6.5M', 'Installment', 'Investment', '6-12 months', '2026-07-20', '14:00', 'Tower B', 'Makati', 'Seeking executive studio for rental.', 'https://marajogroup.com/properties/ceo-flats', 'Website', 'Contacted', 15, 3, 2, 2, '2026-06-30 16:31:20.568+00'],
      [3, 3, 'Ana Cruz', 'ana@email.com', '+63 919 333 3333', 'Email', 'Salcedo Towers', 'Mixed-Use', 'Mixed-Use', 'PHP 12M', 'Cash', 'Commercial', '3-6 months', null, null, 'Tower C', 'Makati', 'Needs mixed-use unit for office.', 'https://marajogroup.com/properties/salcedo-towers', 'Website', 'Qualified', 18, 4, 3, 3, '2026-06-30 16:31:20.568+00'],
      [4, 4, 'Jose Manuel', 'jose@email.com', '+63 920 444 4444', 'Phone', 'HQ Burgos', 'Ground Floor Commercial', 'Office/Commercial', 'PHP 12M', 'Bank Financing', 'Expansion', '2-3 months', '2026-07-22', '11:00', 'Tower D', 'Makati', 'Looking for ground floor commercial space.', 'https://marajogroup.com/properties/hq-burgos', 'Website', 'Site Visit Scheduled', 12, 4, 4, 4, '2026-06-30 16:31:20.568+00'],
      [2, 5, 'Rita Fernandez', 'rita@email.com', '+63 921 555 5555', 'Email', 'CEO Flats', '2 Bedroom Suite', '2BR', 'PHP 9.1M', 'Cash', 'Residence', 'Within 1 month', null, null, 'Tower B', 'Makati', 'Ready to reserve two-bedroom.', 'https://marajogroup.com/properties/ceo-flats', 'Website', 'Reserved', 20, 3, 5, 5, '2026-06-30 16:31:20.568+00'],
    ];

    // Insert inquiries one-by-one to avoid placeholder mismatches
    for (const vals of inquiryValues) {
      await client.query(
        `INSERT INTO inquiries
         (property_id, contact_id, name, email, phone, preferred_contact_method, project, unit_name, unit_type, budget_range, preferred_payment_method, intended_purpose, purchase_timeline, visit_date, visit_time, building, location, message, source_page_url, lead_source, status, lead_score, assigned_staff_id, views_count, return_visits_count, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26)`,
        vals
      );
    }

    const appointments = [
      [null, 4, 'Site Viewing — HQ Burgos', 'Jose Manuel', 'jose@email.com', '+63 920 444 4444', 'HQ Burgos', 'Ground Floor Commercial', 'Visit and contract discussion', '2026-07-22', '11:00', 'upcoming', '2026-06-30 16:31:20.568+00'],
    ];

    try {
      await client.query('BEGIN');
      for (const ap of appointments) {
        await client.query(
          `INSERT INTO appointments (inquiry_id, contact_id, title, client_name, client_email, client_phone, property_name, unit_name, notes, appt_date, appt_time, status, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
          ap
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      console.error('Appointments seed failed:', e.message || e);
      try {
        await client.query('ROLLBACK');
      } catch {}
    }

    console.log('Seeding parking facilities and slots...');
    await client.query(`DELETE FROM parking_reservations`);
    await client.query(`DELETE FROM parking_slots`);
    await client.query(`DELETE FROM parking_facilities`);
    try {
      await client.query(`DELETE FROM payments`);
    } catch (e) {
      console.log('payments table not present, skipping payments cleanup');
    }

    const facilities = [
      [1, 'BGC Parking', 'BGC, Taguig', 120, 90, 20, 5, 0, 1, now(), now()],
      [4, 'Makati Depot Parking', 'Makati', 80, 64, 10, 4, 0, 1, now(), now()],
    ];
    let facilityIds = [];
    try {
      await client.query('BEGIN');
      for (const f of facilities) {
        const res = await client.query(
          `INSERT INTO parking_facilities (property_id, name, location, total_capacity, available_slots, reserved_slots, occupied_slots, maintenance_slots, is_active, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
          f
        );
        facilityIds.push(res.rows[0].id);
      }
      await client.query('COMMIT');
    } catch (e) {
      console.error('Parking facilities seed failed:', e.message || e);
      try {
        await client.query('ROLLBACK');
      } catch {}
    }

    const slots = [];
    // build slots referring to facility index (0/1)
    for (let i = 1; i <= 10; i++) {
      slots.push([0, `A-${i}`, 1, 'standard', 'available', now(), now()]);
    }
    for (let i = 1; i <= 8; i++) {
      const status = i <= 6 ? 'available' : 'reserved';
      slots.push([1, `B-${i}`, 1, 'standard', status, now(), now()]);
    }
    try {
      await client.query('BEGIN');
      for (const s of slots) {
        const facilityIndex = s[0];
        const facilityId = facilityIds[facilityIndex];
        const slotParams = [facilityId, s[1], s[2], s[3], s[4], s[5], s[6]];
        await client.query(
          `INSERT INTO parking_slots (facility_id, slot_number, floor_level, slot_type, status, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          slotParams
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      console.error('Parking slots seed failed:', e.message || e);
      try {
        await client.query('ROLLBACK');
      } catch {}
    }

    const reservationDate = new Date();
    const tomorrow = new Date(reservationDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().slice(0, 10);

    const parking = [
      [null, 0, 'A-1', dateString, '09:00', '11:00', 2, 'sedan', 'ABC-1234', 'Black', 'Maria Santos', '+63 917 111 1111', 'maria@email.com', 'confirmed', 'paid', 'Reserved via admin seed', now(), now(), null],
      [null, 1, 'B-6', dateString, '13:00', '15:00', 2, 'suv', 'XYZ-5678', 'White', 'Carlos Reyes', '+63 918 222 2222', 'carlos@email.com', 'pending', 'pending', 'Awaiting payment confirmation', now(), now(), null],
    ];
    try {
      await client.query('BEGIN');
      for (const p of parking) {
        const facilityIndex = p[1];
        const facilityId = facilityIds[facilityIndex];
        const slotNumber = p[2];
        const slotRow = await client.query('SELECT id FROM parking_slots WHERE facility_id=$1 AND slot_number=$2 LIMIT 1', [facilityId, slotNumber]);
        if (!slotRow.rows[0]) {
          console.warn('Slot not found, skipping reservation for', slotNumber, 'in facility', facilityId);
          continue;
        }
        const slotId = slotRow.rows[0].id;
        const params = [p[0], facilityId, slotId, p[3], p[4], p[5], p[6], p[7], p[8], p[9], p[10], p[11], p[12], p[13], p[14], p[15], p[16], p[17], p[18]];
        await client.query(
          `INSERT INTO parking_reservations (user_id, facility_id, slot_id, reservation_date, entry_time, exit_time, total_duration_hours, vehicle_type, plate_number, vehicle_color, full_name, contact_number, email, reservation_status, payment_status, notes, created_at, updated_at, cancelled_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
          params
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      console.error('Parking reservations seed failed:', e.message || e);
      try {
        await client.query('ROLLBACK');
      } catch {}
    }

    try {
      const payments = [
        [1, null, 1600, 1340, 160, 100, 'paid', 'PAY-0001', now(), now()],
        [2, null, 1800, 1500, 180, 120, 'pending', 'PAY-0002', now(), now()],
      ];
      for (const pay of payments) {
        await client.query(
          `INSERT INTO payments (parking_reservation_id, user_id, amount, base_amount, vat_amount, service_fee, payment_status, reference_number, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          pay
        );
      }
    } catch (e) {
      console.log('payments table not present, skipping payments insert');
    }

    console.log('Updating property/unit inquiry counts and status counts...');
    await client.query(`UPDATE properties SET inquiries_count = 2 WHERE id = 1`);
    await client.query(`UPDATE properties SET inquiries_count = 2 WHERE id = 2`);
    await client.query(`UPDATE properties SET inquiries_count = 1 WHERE id = 4`);
    await client.query(`UPDATE units SET inquiries_count = 1 WHERE id IN (1, 2, 4, 5)`);

    console.log('Committing seed transaction');
    await client.query('COMMIT');
    console.log('Seed complete. Admin login for id=1 uses password: admin123');
  } catch (err) {
    console.error('ERROR', err && err.message ? err.message : err);
    await client.query('ROLLBACK');
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
})();
