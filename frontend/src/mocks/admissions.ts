import { PATIENTS } from "./patients";
import { DOCTORS } from "./doctors";

export interface Bed {
  id: string; // e.g. "B-101"
  ward: string; // e.g. "General Ward A", "ICU", "Pediatrics"
  status: "Occupied" | "Vacant" | "Maintenance";
  patientId?: string;
  notes?: string;
}

export interface AdmissionRecord {
  id: string;
  patientId: string;
  doctorId: string;
  bedId: string;
  admissionDate: string;
  dischargeDate?: string;
  admissionNotes: string;
  dischargeNotes?: string;
  billingStatus: "Pending" | "Cleared";
  totalBillAmount: number;
}

// Generate beds across 4 wards
export const WARDS = [
  "General Ward A",
  "General Ward B",
  "ICU (Intensive Care)",
  "Pediatric Ward"
];

export let BEDS: Bed[] = [];

// Populate 8 beds per ward
WARDS.forEach((ward, wIdx) => {
  for (let i = 1; i <= 8; i++) {
    const bedId = `B-${wIdx + 1}${String(i).padStart(2, "0")}`;
    BEDS.push({
      id: bedId,
      ward,
      status: "Vacant",
      notes: "Routine housekeeping complete."
    });
  }
});

// Map initial in-patients from PATIENTS mock data to BEDS
const inpatients = PATIENTS.filter(p => p.status === "Inpatient");
inpatients.forEach((p, idx) => {
  if (idx < BEDS.length) {
    BEDS[idx].status = "Occupied";
    BEDS[idx].patientId = p.id;
    BEDS[idx].notes = `Patient admitted under Chief Complaint monitoring.`;
    // Update patient record to match bed ID and ward name
    p.bed = BEDS[idx].id;
    p.ward = BEDS[idx].ward;
  }
});

export let ADMISSIONS: AdmissionRecord[] = inpatients.map((p, idx) => {
  const bed = BEDS.find(b => b.patientId === p.id);
  const docId = p.doctorId || DOCTORS[idx % DOCTORS.length].id;
  return {
    id: `ADM-2024-${String(idx + 1).padStart(5, "0")}`,
    patientId: p.id,
    doctorId: docId,
    bedId: bed?.id || "B-101",
    admissionDate: p.admissionDate || new Date(Date.now() - (idx % 10) * 86400000).toISOString(),
    admissionNotes: "Admitted for routine observations and therapeutic care plan compliance.",
    billingStatus: "Pending",
    totalBillAmount: 12500 + (idx * 3200)
  };
});

// Mutators
export function admitPatient(patientId: string, doctorId: string, bedId: string, notes: string) {
  const patient = PATIENTS.find(p => p.id === patientId);
  const bed = BEDS.find(b => b.id === bedId);

  if (!patient || !bed || bed.status !== "Vacant") return null;

  // Update Bed
  bed.status = "Occupied";
  bed.patientId = patientId;
  bed.notes = notes;

  // Update Patient
  patient.status = "Inpatient";
  patient.bed = bedId;
  patient.ward = bed.ward;
  patient.doctorId = doctorId;
  patient.admissionDate = new Date().toISOString();

  // Create Admission Record
  const newRecord: AdmissionRecord = {
    id: `ADM-2024-${String(ADMISSIONS.length + 1).padStart(5, "0")}`,
    patientId,
    doctorId,
    bedId,
    admissionDate: new Date().toISOString(),
    admissionNotes: notes,
    billingStatus: "Pending",
    totalBillAmount: 5000 // Base admission fee
  };

  ADMISSIONS.unshift(newRecord);
  return newRecord;
}

export function dischargePatient(patientId: string, dischargeNotes: string, dischargeStatus: "Pending" | "Cleared") {
  const record = ADMISSIONS.find(a => a.patientId === patientId && !a.dischargeDate);
  const patient = PATIENTS.find(p => p.id === patientId);
  
  if (!record) return null;

  const bed = BEDS.find(b => b.id === record.bedId);

  // Free Bed
  if (bed) {
    bed.status = "Vacant";
    bed.patientId = undefined;
    bed.notes = "Sanitization complete post patient discharge.";
  }

  // Update Patient
  if (patient) {
    patient.status = "Discharged";
    patient.bed = undefined;
    patient.ward = undefined;
  }

  // Update Record
  record.dischargeDate = new Date().toISOString();
  record.dischargeNotes = dischargeNotes;
  record.billingStatus = dischargeStatus;
  
  // Calculate final billing estimate based on days admitted
  const days = Math.max(1, Math.ceil((new Date().getTime() - new Date(record.admissionDate).getTime()) / 86400000));
  record.totalBillAmount = days * 4500 + 8000; // 4500/day + 8000 clinical charges

  return record;
}

export function updateBedStatus(bedId: string, status: Bed["status"], notes: string) {
  const bed = BEDS.find(b => b.id === bedId);
  if (bed) {
    bed.status = status;
    bed.notes = notes;
    if (status !== "Occupied") {
      bed.patientId = undefined;
    }
  }
}
