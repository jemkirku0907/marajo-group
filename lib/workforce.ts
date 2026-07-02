export type PublicWorker = {
  id: number;
  name: string;
  email?: string;
  contact_number?: string;
  position: string;
  experience_years: number;
  skills: string[];
  rating: number;
  verification_status: string;
  availability_status: string;
  profile_photo?: string;
};

export const fallbackWorkers: PublicWorker[] = [
  { id: 9001, name: "Juan Santos", email: "worker.juan@marajogroup.com", contact_number: "09171234001", position: "janitor", experience_years: 5, skills: ["Floor Cleaning", "Waste Management", "Restroom Sanitation", "Disinfection"], rating: 4.8, verification_status: "approved", availability_status: "available", profile_photo: "/assets/logo.png" },
  { id: 9002, name: "Carlo Villanueva", email: "worker.carlo@marajogroup.com", contact_number: "09171234007", position: "electrician", experience_years: 10, skills: ["Wiring Installation", "Panel Upgrades", "Troubleshooting", "Generator Maintenance"], rating: 4.95, verification_status: "approved", availability_status: "available", profile_photo: "/assets/logo.png" },
  { id: 9003, name: "Romeo Aquino", email: "worker.romeo@marajogroup.com", contact_number: "09171234009", position: "plumber", experience_years: 7, skills: ["Pipe Installation", "Leak Detection", "Drain Cleaning", "Fixture Replacement"], rating: 4.85, verification_status: "approved", availability_status: "available", profile_photo: "/assets/logo.png" },
  { id: 9004, name: "Rosa Mendoza", email: "worker.rosa@marajogroup.com", contact_number: "09171234006", position: "maintenance_staff", experience_years: 4, skills: ["Building Repairs", "Painting", "Carpentry", "General Maintenance"], rating: 4.55, verification_status: "approved", availability_status: "available", profile_photo: "/assets/logo.png" },
  { id: 9005, name: "Benjamin Lim", email: "worker.ben@marajogroup.com", contact_number: "09171234013", position: "technician", experience_years: 11, skills: ["Aircon Maintenance", "CCTV Installation", "Network Setup", "Equipment Inspection"], rating: 4.92, verification_status: "approved", availability_status: "available", profile_photo: "/assets/logo.png" },
  { id: 9006, name: "Ana Garcia", email: "worker.ana@marajogroup.com", contact_number: "09171234004", position: "utility_worker", experience_years: 2, skills: ["Office Setup", "Equipment Moving", "General Labor", "Stock Management"], rating: 4.4, verification_status: "approved", availability_status: "available", profile_photo: "/assets/logo.png" },
];

export function filterFallbackWorkers(position?: string | null): PublicWorker[] {
  return fallbackWorkers.filter((worker) => !position || worker.position === position);
}
