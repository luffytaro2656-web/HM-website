import { useAuthStore } from "@/store/authStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// 1. Fetch active permissions matrix
export async function getPermissionsRequest() {
  const { accessToken } = useAuthStore.getState();

  const response = await fetch(`${API_BASE_URL}/permissions`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch permissions.");
  }

  return response.json();
}

// 2. Update a single role permission toggle
export async function updatePermissionRequest(
  role: string,
  module: string,
  action: string,
  enabled: boolean
) {
  const { accessToken } = useAuthStore.getState();

  const response = await fetch(`${API_BASE_URL}/permissions`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ role, module, action, enabled }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update permission.");
  }

  return response.json();
}

// 3. Reset permissions back to default values
export async function resetPermissionsRequest() {
  const { accessToken } = useAuthStore.getState();

  const response = await fetch(`${API_BASE_URL}/permissions/reset`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to reset permissions.");
  }

  return response.json();
}
