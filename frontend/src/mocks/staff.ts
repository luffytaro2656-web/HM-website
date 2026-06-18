import type { StaffMember, AttendanceRecord, StaffRole, Shift, AttendanceStatus } from "@/types/staff";
import { HOSPITALS } from "./hospitals";

const ROLES: StaffRole[] = ["Nurse", "Lab Tech", "Admin", "Support", "Pharmacist"];
const SHIFTS: Shift[] = ["Morning", "Evening", "Night"];
const DEPTS = ["Emergency", "ICU", "OPD", "Pharmacy", "Laboratory", "Reception", "Surgery", "Pediatrics"];
const FIRST = ["Kavitha", "Ramesh", "Sneha", "Murali", "Anjali", "Vijay", "Lakshmi", "Suresh", "Divya", "Prakash"];
const LAST = ["Kumar", "Selvam", "Murugan", "Devi", "Bala", "Pandian", "Raj", "Nathan"];

// Generate mock staff members with qualifications and credentials
export const STAFF: StaffMember[] = Array.from({ length: 80 }, (_, i) => {
  const role = ROLES[i % ROLES.length];
  const name = `${FIRST[i % FIRST.length]} ${LAST[i % LAST.length]}`;
  const id = `S${String(i + 1).padStart(4, "0")}`;
  const username = `${name.toLowerCase().replace(" ", ".")}`;

  let qualifications = "Bachelor of Science in Nursing (B.Sc)";
  if (role === "Lab Tech") qualifications = "Diploma in Medical Lab Technology (DMLT)";
  else if (role === "Admin") qualifications = "Master of Business Administration (MBA)";
  else if (role === "Pharmacist") qualifications = "Bachelor of Pharmacy (B.Pharm)";
  else if (role === "Support") qualifications = "Higher Secondary Certificate (HSC)";

  return {
    id,
    name,
    role,
    hospitalId: HOSPITALS[i % HOSPITALS.length].id,
    department: DEPTS[i % DEPTS.length],
    shift: SHIFTS[i % SHIFTS.length],
    salary: 18000 + ((i * 1737) % 40000),
    contact: `+91 9${String(600000000 + i * 5431).slice(-9)}`,
    status: i % 19 === 0 ? "Inactive" : "Active",
    qualifications,
    employmentDate: new Date(2023, i % 12, (i * 3) % 28 + 1).toISOString().slice(0, 10),
    email: `${username}@hms-care.in`,
    hasLogin: i % 5 !== 0,
    username: i % 5 !== 0 ? username : undefined,
  };
});

// Daily attendance log
const ATT: AttendanceStatus[] = ["Present", "Present", "Present", "Late", "Absent", "Half-day"];

export const ATTENDANCE: AttendanceRecord[] = STAFF.map((s, i) => {
  const status = ATT[i % ATT.length];
  const checkInH = 8 + (i % 3);
  const checkInM = (i * 7) % 60;
  return {
    staffId: s.id,
    date: new Date().toISOString().slice(0, 10),
    checkIn: status === "Absent" ? undefined : `${String(checkInH).padStart(2, "0")}:${String(checkInM).padStart(2, "0")}`,
    checkOut: status === "Absent" || status === "Half-day" ? undefined : `${String(checkInH + 8).padStart(2, "0")}:${String(checkInM).padStart(2, "0")}`,
    status,
  };
});

// Leave Request Schema
export interface LeaveRequest {
  id: string;
  staffId: string;
  staffName: string;
  role: StaffRole;
  leaveType: "Sick Leave" | "Casual Leave" | "Earned Leave" | "Maternity Leave";
  startDate: string;
  endDate: string;
  reason: string;
  days: number;
  status: "Pending" | "Approved" | "Rejected";
}

// Generate Initial Leave Requests
export const LEAVE_REQUESTS: LeaveRequest[] = Array.from({ length: 15 }, (_, i) => {
  const staff = STAFF[i * 4 % STAFF.length];
  const days = (i % 4) + 1;
  const startDay = (i * 2) % 25 + 1;
  const startDate = `2026-06-${String(startDay).padStart(2, "0")}`;
  const endDate = `2026-06-${String(startDay + days).padStart(2, "0")}`;
  
  const reasons = [
    "Medical checkup and recovery",
    "Family wedding in native town",
    "Personal urgent administrative work",
    "Not feeling well, running temperature"
  ];

  const types = ["Sick Leave", "Casual Leave", "Earned Leave", "Casual Leave"] as const;

  return {
    id: `LR${String(i + 1).padStart(3, "0")}`,
    staffId: staff.id,
    staffName: staff.name,
    role: staff.role,
    leaveType: types[i % types.length],
    startDate,
    endDate,
    reason: reasons[i % reasons.length],
    days,
    status: i % 3 === 0 ? "Pending" : i % 3 === 1 ? "Approved" : "Rejected",
  };
});

// Payroll Schema
export interface PayrollRecord {
  id: string;
  staffId: string;
  staffName: string;
  role: StaffRole;
  basicSalary: number;
  allowance: number;
  deductions: number; // PF, taxes, etc.
  bonus: number;
  netPay: number;
  month: string; // e.g. "June 2026"
  status: "Paid" | "Unpaid" | "Processing";
  paymentDate?: string;
}

// Generate Monthly Payroll Records
export const PAYROLL_RECORDS: PayrollRecord[] = STAFF.map((s, i) => {
  const basicSalary = s.salary;
  const allowance = Math.round(basicSalary * 0.15); // HRA & Medical
  const deductions = Math.round(basicSalary * 0.12); // PF + Tax
  const bonus = i % 7 === 0 ? 3000 : 0;
  const netPay = basicSalary + allowance + bonus - deductions;

  return {
    id: `PR${String(i + 1).padStart(4, "0")}`,
    staffId: s.id,
    staffName: s.name,
    role: s.role,
    basicSalary,
    allowance,
    deductions,
    bonus,
    netPay,
    month: "June 2026",
    status: i % 4 === 0 ? "Unpaid" : "Paid",
    paymentDate: i % 4 === 0 ? undefined : "2026-06-05",
  };
});

// Mutable API functions
export function addStaffMember(member: Omit<StaffMember, "id">): StaffMember {
  const newId = `S${String(STAFF.length + 1).padStart(4, "0")}`;
  const fullMember: StaffMember = {
    ...member,
    id: newId,
  };
  STAFF.push(fullMember);

  // Add matching payroll template
  const allowance = Math.round(fullMember.salary * 0.15);
  const deductions = Math.round(fullMember.salary * 0.12);
  const netPay = fullMember.salary + allowance - deductions;
  PAYROLL_RECORDS.push({
    id: `PR${String(PAYROLL_RECORDS.length + 1).padStart(4, "0")}`,
    staffId: newId,
    staffName: fullMember.name,
    role: fullMember.role,
    basicSalary: fullMember.salary,
    allowance,
    deductions,
    bonus: 0,
    netPay,
    month: "June 2026",
    status: "Unpaid",
  });

  // Add attendance log
  ATTENDANCE.push({
    staffId: newId,
    date: new Date().toISOString().slice(0, 10),
    status: "Present",
    checkIn: "09:00",
    checkOut: "17:00",
  });

  return fullMember;
}

export function updateStaffMember(id: string, details: Partial<StaffMember>): StaffMember | null {
  const idx = STAFF.findIndex((s) => s.id === id);
  if (idx === -1) return null;

  STAFF[idx] = { ...STAFF[idx], ...details };

  // Sync details in Payroll
  const prIdx = PAYROLL_RECORDS.findIndex((pr) => pr.staffId === id);
  if (prIdx !== -1) {
    PAYROLL_RECORDS[prIdx].staffName = STAFF[idx].name;
    PAYROLL_RECORDS[prIdx].role = STAFF[idx].role;
    if (details.salary) {
      const basic = details.salary;
      const allowance = Math.round(basic * 0.15);
      const deductions = Math.round(basic * 0.12);
      PAYROLL_RECORDS[prIdx].basicSalary = basic;
      PAYROLL_RECORDS[prIdx].allowance = allowance;
      PAYROLL_RECORDS[prIdx].deductions = deductions;
      PAYROLL_RECORDS[prIdx].netPay = basic + allowance + PAYROLL_RECORDS[prIdx].bonus - deductions;
    }
  }

  return STAFF[idx];
}

export function updateRosterShift(id: string, newShift: Shift): StaffMember | null {
  return updateStaffMember(id, { shift: newShift });
}

export function submitLeaveRequest(request: Omit<LeaveRequest, "id" | "status">): LeaveRequest {
  const newId = `LR${String(LEAVE_REQUESTS.length + 1).padStart(3, "0")}`;
  const newReq: LeaveRequest = {
    ...request,
    id: newId,
    status: "Pending",
  };
  LEAVE_REQUESTS.unshift(newReq);
  return newReq;
}

export function updateLeaveStatus(id: string, status: "Approved" | "Rejected"): LeaveRequest | null {
  const req = LEAVE_REQUESTS.find((lr) => lr.id === id);
  if (!req) return null;
  req.status = status;
  return req;
}

export function processPayrollPay(id: string): PayrollRecord | null {
  const pr = PAYROLL_RECORDS.find((p) => p.id === id);
  if (!pr) return null;
  pr.status = "Paid";
  pr.paymentDate = new Date().toISOString().slice(0, 10);
  return pr;
}

export function logAttendanceRecord(staffId: string, status: AttendanceStatus, checkIn?: string, checkOut?: string): AttendanceRecord {
  const dateStr = new Date().toISOString().slice(0, 10);
  const existing = ATTENDANCE.find((a) => a.staffId === staffId && a.date === dateStr);

  if (existing) {
    existing.status = status;
    existing.checkIn = checkIn;
    existing.checkOut = checkOut;
    return existing;
  } else {
    const newRecord = { staffId, date: dateStr, status, checkIn, checkOut };
    ATTENDANCE.push(newRecord);
    return newRecord;
  }
}
