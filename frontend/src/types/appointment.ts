export type AppointmentStatus = "Scheduled" | "Confirmed" | "Completed" | "Cancelled" | "No-show";
export type AppointmentType = "OPD" | "Emergency" | "Follow-up";

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  hospitalId: string;
  dateTime: string; // ISO
  type: AppointmentType;
  status: AppointmentStatus;
  notes?: string;
}
