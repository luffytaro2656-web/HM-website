import { useAuthStore } from "@/store/authStore";
import { type AppModule, type PermissionAction, type SystemRole } from "@/config/roleConfig";

export function usePermission() {
  const user = useAuthStore((s) => s.user);
  const permissions = useAuthStore((s) => s.permissions);

  const canAccess = (module: AppModule, action?: PermissionAction): boolean => {
    if (!user || !permissions) return false;
    const activeRole = user.backendRole || user.role;
    
    const normalizedRoleName = activeRole.toLowerCase().replace(/_/g, " ");
    const matchedRole = Object.keys(permissions).find(
      (key) => key.toLowerCase().replace(/_/g, " ") === normalizedRoleName
    ) as SystemRole | undefined;

    if (!matchedRole) return false;

    const rule = permissions[matchedRole][module];
    if (!rule || rule.access === "None") return false;

    if (action && !rule.actions.includes(action)) return false;

    return true;
  };

  return {
    canAccess,
    userRole: user?.backendRole || user?.role || "",
    isSuperAdmin: user?.role === "super_admin" || user?.backendRole === "Super Admin",
    isHospitalAdmin: user?.role === "hospital_admin" || user?.backendRole === "Hospital Admin",
  };
}
