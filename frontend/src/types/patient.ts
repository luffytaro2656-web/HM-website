import type { BloodGroup, Gender } from "./common";

export type PatientStatus = "Inpatient" | "Outpatient" | "Discharged";

export interface Patient {
  id: string;
  uhid: string;
  name: string;
  age: number;
  gender: Gender;
  bloodGroup: BloodGroup;
  phone: string;
  email: string;
  hospitalId: string;
  doctorId: string;
  status: PatientStatus;
  lastVisit: string; // ISO
  admissionDate?: string;
  ward?: string;
  bed?: string;
}
