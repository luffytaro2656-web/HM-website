import { apiFetch } from "./auth";
import type { Hospital } from "@/types/hospital";
import type { Department } from "@/mocks/hospitals";

export async function getHospitalsData(): Promise<Hospital[]> {
  const response = await apiFetch("/hospitals");
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch hospitals.");
  }
  return response.json();
}

export async function getHospitalDetails(id: string): Promise<Hospital> {
  const response = await apiFetch(`/hospitals/${id}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch hospital details.");
  }
  return response.json();
}

export async function createHospitalRequest(data: {
  name: string;
  city: string;
  address: string;
  contact: string;
  totalBeds: number;
  operatingHours: string;
  status: "Active" | "Inactive";
  facilities: string[];
  departments: string[];
}) {
  const response = await apiFetch("/hospitals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to register hospital.");
  }
  return response.json();
}

export async function updateHospitalRequest(id: string, data: Partial<Hospital>) {
  const response = await apiFetch(`/hospitals/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update hospital branch.");
  }
  return response.json();
}

export async function deleteHospitalRequest(id: string) {
  const response = await apiFetch(`/hospitals/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to delete hospital branch.");
  }
  return response.json();
}

// Department API operations
export async function getHospitalDepartments(hospitalId: string): Promise<Department[]> {
  const response = await apiFetch(`/hospitals/${hospitalId}/departments`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch branch departments.");
  }
  return response.json();
}

export async function createDepartmentRequest(hospitalId: string, data: {
  name: string;
  headOfDepartment: string;
  staffCount: number;
  bedCount: number;
}) {
  const response = await apiFetch(`/hospitals/${hospitalId}/departments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create department.");
  }
  return response.json();
}

export async function updateDepartmentRequest(hospitalId: string, deptId: string, data: {
  name?: string;
  headOfDepartment?: string;
  staffCount?: number;
  bedCount?: number;
  status?: "Active" | "Inactive";
}) {
  const response = await apiFetch(`/hospitals/${hospitalId}/departments/${deptId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update department details.");
  }
  return response.json();
}

export async function deleteDepartmentRequest(hospitalId: string, deptId: string) {
  const response = await apiFetch(`/hospitals/${hospitalId}/departments/${deptId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to delete department.");
  }
  return response.json();
}

// Bed API operations
export interface Bed {
  id: string;
  hospitalId: string;
  departmentId: string;
  wardName: string;
  category: "General" | "ICU" | "Private";
  status: "Available" | "Occupied" | "Maintenance";
  notes?: string;
}

export async function getHospitalBeds(hospitalId: string): Promise<Bed[]> {
  const response = await apiFetch(`/hospitals/${hospitalId}/beds`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch hospital beds.");
  }
  return response.json();
}

export async function createHospitalBed(hospitalId: string, data: {
  departmentId: string;
  wardName: string;
  category: "General" | "ICU" | "Private";
  status: "Available" | "Occupied" | "Maintenance";
  notes?: string;
}): Promise<Bed> {
  const response = await apiFetch(`/hospitals/${hospitalId}/beds`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create hospital bed.");
  }
  const result = await response.json();
  return result.bed;
}

export async function updateHospitalBed(hospitalId: string, bedId: string, data: {
  departmentId?: string;
  wardName?: string;
  category?: "General" | "ICU" | "Private";
  status?: "Available" | "Occupied" | "Maintenance";
  notes?: string;
}) {
  const response = await apiFetch(`/hospitals/${hospitalId}/beds/${bedId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update hospital bed.");
  }
  return response.json();
}

export async function deleteHospitalBed(hospitalId: string, bedId: string) {
  const response = await apiFetch(`/hospitals/${hospitalId}/beds/${bedId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to delete hospital bed.");
  }
  return response.json();
}
