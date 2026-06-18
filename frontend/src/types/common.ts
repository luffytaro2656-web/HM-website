export type Role = "super_admin" | "hospital_admin" | "doctor" | "nurse" | "staff" | "patient";

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  hospital_admin: "Hospital Admin",
  doctor: "Doctor",
  nurse: "Nurse",
  staff: "Staff",
  patient: "Patient",
};

export type Gender = "Male" | "Female" | "Other";
export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
