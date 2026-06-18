export type StaffRole = "Nurse" | "Lab Tech" | "Admin" | "Support" | "Pharmacist";
export type Shift = "Morning" | "Evening" | "Night";
export type AttendanceStatus = "Present" | "Absent" | "Late" | "Half-day";

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  hospitalId: string;
  department: string;
  shift: Shift;
  salary: number;
  contact: string;
  status: "Active" | "Inactive";
  qualifications?: string;
  employmentDate?: string;
  email?: string;
  hasLogin?: boolean;
  username?: string;
}

export interface AttendanceRecord {
  staffId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
}
