import { useAuthStore } from "@/store/authStore";
import type { Role } from "@/types/common";

const API_BASE_URL = "http://localhost:5000/api";

// Map frontend lowercase-snake roles to backend Pascal-spaced roles
const ROLE_MAP_TO_BACKEND: Record<Role, string> = {
  super_admin: "Super Admin",
  hospital_admin: "Hospital Admin",
  doctor: "Doctor",
  nurse: "Nurse",
  staff: "Receptionist", // Fallback staff to Receptionist
  patient: "Patient",
};

const ROLE_MAP_TO_FRONTEND: Record<string, Role> = {
  "Super Admin": "super_admin",
  "Hospital Admin": "hospital_admin",
  "Hospital Manager": "hospital_admin", // Map Manager to Admin view
  "Doctor": "doctor",
  "Nurse": "nurse",
  "Receptionist": "staff",
  "Billing Executive": "staff",
  "Pharmacy Staff": "staff",
  "Lab Technician": "staff",
  "Patient": "patient",
};

// Login API call
export async function loginRequest(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to log in.");
  }

  const data = await response.json();
  
  // Map backend role back to frontend Role
  const mappedRole = ROLE_MAP_TO_FRONTEND[data.user.role] || "staff";

  return {
    accessToken: data.accessToken,
    user: {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: mappedRole,
      backendRole: data.user.role,
      hospitalId: data.user.hospitalId || "",
    },
  };
}

// Signup (Register) API call
export async function signupRequest(
  name: string,
  email: string,
  password: string,
  role: Role,
  hospitalId?: string
) {
  const backendRole = ROLE_MAP_TO_BACKEND[role];

  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      password,
      role: backendRole,
      hospitalId: hospitalId || null,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to register account.");
  }

  return response.json();
}

// Logout API call
export async function logoutRequest() {
  const { accessToken } = useAuthStore.getState();

  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Logout failed on server.");
  }

  return response.json();
}

// Silent Refresh API call
export async function refreshRequest() {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to refresh session.");
  }

  const data = await response.json();
  return data.accessToken as string;
}

// User Management API Calls
export async function getUsersRequest() {
  const response = await apiFetch("/users");
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to retrieve users.");
  }
  return response.json();
}

export async function createUserRequest(payload: any) {
  const response = await apiFetch("/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create user account.");
  }
  return response.json();
}

export async function approveUserRequest(id: number) {
  const response = await apiFetch(`/users/${id}/approve`, {
    method: "PATCH",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to approve user.");
  }
  return response.json();
}

export async function rejectUserRequest(id: number) {
  const response = await apiFetch(`/users/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to reject user.");
  }
  return response.json();
}

export async function updateUserStatusRequest(id: number, status: "Active" | "Inactive") {
  const response = await apiFetch(`/users/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update user status.");
  }
  return response.json();
}

export async function deleteUserRequest(id: number) {
  const response = await apiFetch(`/users/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to delete user account.");
  }
  return response.json();
}

// Authenticated fetch wrapper helper
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const store = useAuthStore.getState();
  const headers = new Headers(options.headers);

  if (store.accessToken) {
    headers.set("Authorization", `Bearer ${store.accessToken}`);
  }

  options.headers = headers;

  let response = await fetch(`${API_BASE_URL}${endpoint}`, options);

  // If unauthorized/forbidden, attempt token refresh once
  if (response.status === 401 || response.status === 403) {
    try {
      const newAccessToken = await refreshRequest();
      useAuthStore.getState().setAccessToken(newAccessToken);
      
      // Retry request with new token
      headers.set("Authorization", `Bearer ${newAccessToken}`);
      options.headers = headers;
      response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    } catch (refreshError) {
      // Clear session if refresh fails
      useAuthStore.getState().logout();
      window.location.href = "/login";
      throw refreshError;
    }
  }

  return response;
}
