import type { Patient } from "@/types/patient";
import type { BloodGroup, Gender } from "@/types/common";
import { HOSPITALS } from "./hospitals";
import { DOCTORS } from "./doctors";

const FIRST_M = ["Aarav", "Vihaan", "Aditya", "Karthik", "Rohan", "Siddharth", "Manoj", "Ganesh", "Sanjay", "Praveen", "Naveen", "Harish"];
const FIRST_F = ["Ananya", "Diya", "Saanvi", "Priya", "Kavya", "Shreya", "Pooja", "Nandini", "Aishwarya", "Radhika", "Sushmita", "Bhavana"];
const LAST = ["Kumar", "Selvam", "Murugan", "Raj", "Bose", "Nathan", "Chandran", "Devi", "Bala", "Pandian"];
const BG: BloodGroup[] = ["A+", "A-", "B+", "B-", "AB+", "O+", "O-", "AB-"];
const STATUSES: Patient["status"][] = ["Inpatient", "Outpatient", "Discharged"];

export const PATIENTS: Patient[] = Array.from({ length: 220 }, (_, i) => {
  const gender: Gender = i % 2 === 0 ? "Male" : "Female";
  const first = (gender === "Male" ? FIRST_M : FIRST_F)[i % 12];
  const last = LAST[i % LAST.length];
  const hospital = HOSPITALS[i % HOSPITALS.length];
  const doctor = DOCTORS[i % DOCTORS.length];
  const status = STATUSES[i % STATUSES.length];
  const visitDaysAgo = (i * 3) % 60;
  const lastVisit = new Date(Date.now() - visitDaysAgo * 86400000).toISOString();
  return {
    id: `P${String(i + 1).padStart(5, "0")}`,
    uhid: `UHID-2024-${String(i + 1).padStart(5, "0")}`,
    name: `${first} ${last}`,
    age: 5 + ((i * 7) % 80),
    gender,
    bloodGroup: BG[i % BG.length],
    phone: `+91 9${String(700000000 + i * 4321).slice(-9)}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@mail.com`,
    hospitalId: hospital.id,
    doctorId: doctor.id,
    status,
    lastVisit,
    admissionDate: status === "Inpatient" ? new Date(Date.now() - (i % 10) * 86400000).toISOString() : undefined,
    ward: status === "Inpatient" ? `Ward ${String.fromCharCode(65 + (i % 6))}` : undefined,
    bed: status === "Inpatient" ? `B-${100 + (i % 80)}` : undefined,
  };
});

export function getPatient(id: string): Patient | undefined {
  return PATIENTS.find((p) => p.id === id);
}

export interface ConsultationLog {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  notes: string;
  diagnosis: string;
  symptoms: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes: string;
}

export interface VitalRecord {
  id: string;
  patientId: string;
  date: string;
  bp: string;
  pulse: number;
  temperature: number;
  spo2: number;
  nursingNotes?: string;
}

// Global mutable lists for mocked operations
export let CONSULTATION_LOGS: ConsultationLog[] = Array.from({ length: 400 }, (_, i) => {
  const patient = PATIENTS[i % PATIENTS.length];
  const doctor = DOCTORS[i % DOCTORS.length];
  const daysAgo = (i * 2) % 30;
  return {
    id: `LOG-${1000 + i}`,
    patientId: patient.id,
    doctorId: doctor.id,
    date: new Date(Date.now() - daysAgo * 86400000).toISOString(),
    symptoms: ["Dry cough, headache", "Knee pain during extension", "Mild fever and sore throat", "Routine checkup", "Follow-up post surgery"][(i) % 5],
    diagnosis: ["Upper Respiratory Infection", "Osteoarthritis", "Pharyngitis", "Healthy", "Normal Recovery"][(i) % 5],
    notes: "Patient advised adequate rest and medication compliance."
  };
});

export let PRESCRIPTIONS: Prescription[] = Array.from({ length: 300 }, (_, i) => {
  const patient = PATIENTS[i % PATIENTS.length];
  const doctor = DOCTORS[i % DOCTORS.length];
  const daysAgo = (i * 3) % 30;
  return {
    id: `PR-${1000 + i}`,
    patientId: patient.id,
    doctorId: doctor.id,
    date: new Date(Date.now() - daysAgo * 86400000).toISOString(),
    medicine: ["Paracetamol 650mg", "Amoxicillin 500mg", "Ibuprofen 400mg", "Pantoprazole 40mg", "Cetirizine 10mg"][(i) % 5],
    dosage: ["1 tablet", "1 capsule", "1 tablet", "1 tablet", "1 tablet"][(i) % 5],
    frequency: ["Three times daily", "Twice daily", "As needed for pain", "Once daily before food", "Once daily at night"][(i) % 5],
    duration: ["5 days", "7 days", "3 days", "14 days", "10 days"][(i) % 5],
    notes: ["Post meals", "Complete course", "Take with water", "Avoid alcohol", "May cause drowsiness"][(i) % 5]
  };
});

export let VITALS: VitalRecord[] = Array.from({ length: 500 }, (_, i) => {
  const patient = PATIENTS[i % PATIENTS.length];
  const daysAgo = i % 15;
  return {
    id: `VT-${1000 + i}`,
    patientId: patient.id,
    date: new Date(Date.now() - daysAgo * 86400000).toISOString(),
    bp: `${110 + (i % 20)}/${70 + (i % 15)}`,
    pulse: 65 + (i % 25),
    temperature: 97.5 + (i % 30) / 10,
    spo2: 95 + (i % 5),
    nursingNotes: i % 2 === 0 ? "Vitals stable, patient comfortable." : "Patient reports slight fatigue."
  };
});

export function addConsultationLog(log: Omit<ConsultationLog, "id">) {
  const newLog = { ...log, id: `LOG-${Date.now()}` };
  CONSULTATION_LOGS.unshift(newLog);
  return newLog;
}

export function addPrescription(p: Omit<Prescription, "id">) {
  const newP = { ...p, id: `PR-${Date.now()}` };
  PRESCRIPTIONS.unshift(newP);
  return newP;
}

export function addVital(v: Omit<VitalRecord, "id">) {
  const newV = { ...v, id: `VT-${Date.now()}` };
  VITALS.unshift(newV);
  return newV;
}

