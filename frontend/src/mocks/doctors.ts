import type { Doctor } from "@/types/doctor";
import { HOSPITALS } from "./hospitals";

const SPECS = [
  "Cardiology", "Orthopedics", "Pediatrics", "General Medicine",
  "Neurology", "OB-GYN", "Dermatology", "ENT", "Oncology",
  "Pulmonology", "Nephrology", "Urology", "Psychiatry", "Radiology",
];

const FIRST = ["Arjun", "Priya", "Rajesh", "Lakshmi", "Karthik", "Divya", "Suresh", "Meera", "Vikram", "Anjali", "Ramesh", "Sneha", "Murali", "Kavitha", "Ashok"];
const LAST = ["Iyer", "Krishnan", "Subramanian", "Raman", "Pillai", "Menon", "Nair", "Reddy", "Sharma", "Venkatesh"];

export const DOCTORS: Doctor[] = Array.from({ length: 60 }, (_, i) => {
  const spec = SPECS[i % SPECS.length];
  const hospital = HOSPITALS[i % HOSPITALS.length];
  return {
    id: `D${String(i + 1).padStart(4, "0")}`,
    name: `Dr. ${FIRST[i % FIRST.length]} ${LAST[(i * 3) % LAST.length]}`,
    specialization: spec,
    qualification: i % 3 === 0 ? "MD, DM" : i % 3 === 1 ? "MBBS, MS" : "MBBS, MD",
    hospitalId: hospital.id,
    department: spec,
    scheduleToday: i % 4 === 0 ? "09:00 - 13:00" : i % 4 === 1 ? "14:00 - 20:00" : i % 4 === 2 ? "10:00 - 17:00" : "08:00 - 14:00",
    patientsToday: (i * 3) % 18,
    status: i % 9 === 0 ? "On Leave" : i % 5 === 0 ? "Off Duty" : "On Duty",
    rating: 3.5 + ((i * 13) % 15) / 10,
    contact: `+91 9${String(800000000 + i * 7654).slice(-9)}`,
  };
});

export function getDoctor(id: string): Doctor | undefined {
  return DOCTORS.find((d) => d.id === id);
}
