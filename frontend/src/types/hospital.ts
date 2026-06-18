export interface Hospital {
  id: string;
  name: string;
  city: string;
  address: string;
  contact: string;
  totalBeds: number;
  occupiedBeds: number;
  totalDoctors: number;
  totalPatients: number;
  revenueThisMonth: number;
  status: "Active" | "Inactive";
}
