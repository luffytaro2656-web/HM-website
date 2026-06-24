import * as z from "zod";

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
  facilities: string[];
  operatingHours: string;
}

export const registerHospitalSchema = z.object({
  name: z.string().min(2, "Hospital name must be at least 2 characters"),
  city: z.string().min(1, "Please select a city location"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  contact: z.string().min(10, "Contact number must be at least 10 characters"),
  totalBeds: z.coerce.number().int().positive("Beds capacity must be a positive number"),
  operatingHours: z.string().min(1, "Please specify operating hours"),
  status: z.enum(["Active", "Inactive"] as const),
  facilities: z.array(z.string()).min(1, "Please select at least one facility"),
  departments: z.array(z.string()).min(1, "Please select at least one department"),
});

export type RegisterHospitalFormValues = z.infer<typeof registerHospitalSchema>;


