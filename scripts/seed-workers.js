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

const workers = [
  ["worker.juan@marajogroup.com", "Juan", "Santos", "09171234001", "janitor", 5, ["Floor Cleaning", "Waste Management", "Restroom Sanitation", "Disinfection"], 4.8, 112],
  ["worker.maria@marajogroup.com", "Maria", "Reyes", "09171234002", "janitor", 3, ["Deep Cleaning", "Window Washing", "Floor Polishing", "Waste Disposal"], 4.6, 74],
  ["worker.pedro@marajogroup.com", "Pedro", "Cruz", "09171234003", "utility_worker", 6, ["General Repairs", "Moving Assistance", "Furniture Assembly", "Delivery Support"], 4.7, 98],
  ["worker.ana@marajogroup.com", "Ana", "Garcia", "09171234004", "utility_worker", 2, ["Office Setup", "Equipment Moving", "General Labor", "Stock Management"], 4.4, 31],
  ["worker.jose@marajogroup.com", "Jose", "Dela Cruz", "09171234005", "maintenance_staff", 8, ["Preventive Maintenance", "HVAC Checks", "Plumbing Basics", "Electrical Basics"], 4.9, 203],
  ["worker.rosa@marajogroup.com", "Rosa", "Mendoza", "09171234006", "maintenance_staff", 4, ["Building Repairs", "Painting", "Carpentry", "General Maintenance"], 4.55, 67],
  ["worker.carlo@marajogroup.com", "Carlo", "Villanueva", "09171234007", "electrician", 10, ["Wiring Installation", "Panel Upgrades", "Troubleshooting", "Generator Maintenance"], 4.95, 341],
  ["worker.luz@marajogroup.com", "Luz", "Bautista", "09171234008", "electrician", 5, ["Lighting Installation", "Outlet Repair", "Circuit Breaker", "Electrical Safety Inspection"], 4.65, 88],
  ["worker.romeo@marajogroup.com", "Romeo", "Aquino", "09171234009", "plumber", 7, ["Pipe Installation", "Leak Detection", "Drain Cleaning", "Fixture Replacement"], 4.85, 156],
  ["worker.teresa@marajogroup.com", "Teresa", "Ramos", "09171234010", "plumber", 3, ["Drain Unclogging", "Pipe Repair", "Toilet Repair", "Faucet Installation"], 4.5, 42],
  ["worker.mark@marajogroup.com", "Mark", "Flores", "09171234011", "security_personnel", 9, ["CCTV Monitoring", "Access Control", "Incident Response", "Fire Safety"], 4.88, 278],
  ["worker.linda@marajogroup.com", "Linda", "Torres", "09171234012", "security_personnel", 4, ["Roving Patrol", "Gate Monitoring", "Visitor Logging", "Emergency Response"], 4.6, 91],
  ["worker.ben@marajogroup.com", "Benjamin", "Lim", "09171234013", "technician", 11, ["Aircon Maintenance", "CCTV Installation", "Network Setup", "Equipment Inspection"], 4.92, 389],
  ["worker.grace@marajogroup.com", "Grace", "Tan", "09171234014", "technician", 4, ["IT Support", "Device Setup", "Network Troubleshooting", "CCTV Maintenance"], 4.55, 63],
];

(async () => {
  const passwordHash = await bcrypt.hash("password", 10);
  const pool = new Pool({ connectionString: loadEnvFile(), ssl: { rejectUnauthorized: false }, max: 2 });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const [email, firstName, lastName, phone, position, years, skills, rating, completed] of workers) {
      const user = await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, is_active, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,'worker',true,NOW(),NOW())
         ON CONFLICT (email) DO UPDATE SET first_name=EXCLUDED.first_name, last_name=EXCLUDED.last_name, phone=EXCLUDED.phone, role='worker', is_active=true, updated_at=NOW()
         RETURNING id`,
        [email, passwordHash, firstName, lastName, phone]
      );
      await client.query(
        `INSERT INTO workers (user_id, position, experience_years, skills, availability_status, background_check_status, verification_status, rating, total_jobs_completed, created_at, updated_at)
         VALUES ($1,$2,$3,$4::jsonb,'available','cleared','approved',$5,$6,NOW(),NOW())
         ON CONFLICT (user_id) DO UPDATE SET position=EXCLUDED.position, experience_years=EXCLUDED.experience_years, skills=EXCLUDED.skills, availability_status='available', background_check_status='cleared', verification_status='approved', rating=EXCLUDED.rating, total_jobs_completed=EXCLUDED.total_jobs_completed, updated_at=NOW()`,
        [user.rows[0].id, position, years, JSON.stringify(skills), rating, completed]
      );
    }
    await client.query("COMMIT");
    const count = await client.query("SELECT COUNT(*) AS c FROM workers WHERE verification_status='approved' AND availability_status='available'");
    console.log(`Seed complete. Approved available workers: ${count.rows[0].c}`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("ERROR seeding workers:", err.message || err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
})();
