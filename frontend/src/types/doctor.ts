export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  qualification: string;
  hospitalId: string;
  department: string;
  scheduleToday: string;
  patientsToday: number;
  status: "On Duty" | "Off Duty" | "On Leave";
  rating: number;
  contact: string;
}
