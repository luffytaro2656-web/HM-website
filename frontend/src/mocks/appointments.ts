import type { Appointment, AppointmentStatus, AppointmentType } from "@/types/appointment";
import { PATIENTS } from "./patients";
import { DOCTORS } from "./doctors";

const STATUSES: AppointmentStatus[] = ["Scheduled", "Confirmed", "Completed", "Cancelled", "No-show"];
const TYPES: AppointmentType[] = ["OPD", "Emergency", "Follow-up"];

export let APPOINTMENTS: Appointment[] = Array.from({ length: 150 }, (_, i) => {
  const patient = PATIENTS[i % PATIENTS.length];
  const doctor = DOCTORS[i % DOCTORS.length];
  const offsetDays = (i % 40) - 20; // -20 to +19 days
  const date = new Date(Date.now() + offsetDays * 86400000);
  date.setHours(9 + (i % 9), (i % 4) * 15, 0, 0);
  return {
    id: `APT-2024-${String(i + 1).padStart(5, "0")}`,
    patientId: patient.id,
    doctorId: doctor.id,
    hospitalId: patient.hospitalId,
    dateTime: date.toISOString(),
    type: TYPES[i % TYPES.length],
    status: offsetDays < 0 ? STATUSES[(i % 3) + 2] : STATUSES[i % 2],
  };
});

export function addAppointment(apt: Omit<Appointment, "id">) {
  const newApt: Appointment = {
    ...apt,
    id: `APT-2024-${String(APPOINTMENTS.length + 1).padStart(5, "0")}`,
  };
  APPOINTMENTS = [newApt, ...APPOINTMENTS];
  return newApt;
}

export function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  const apt = APPOINTMENTS.find((a) => a.id === id);
  if (apt) {
    apt.status = status;
  }
}

export function rescheduleAppointment(id: string, newDateTime: string) {
  const apt = APPOINTMENTS.find((a) => a.id === id);
  if (apt) {
    apt.dateTime = newDateTime;
    apt.status = "Confirmed";
  }
}

export function cancelAppointment(id: string) {
  const apt = APPOINTMENTS.find((a) => a.id === id);
  if (apt) {
    apt.status = "Cancelled";
  }
}

