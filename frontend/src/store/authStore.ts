import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "@/types/common";

import { ROLE_PERMISSIONS, type SystemRole, type AppModule, type PermissionAction } from "@/config/roleConfig";

export interface AuthUser {
  id?: number;
  name: string;
  email?: string;
  role: Role;
  backendRole: string;
  hospitalId: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  activeHospitalId: string;
  permissions: typeof ROLE_PERMISSIONS;
  login: (user: AuthUser, accessToken: string) => void;
  logout: () => void;
  setAccessToken: (token: string | null) => void;
  setActiveHospital: (id: string) => void;
  updatePermission: (role: SystemRole, module: AppModule, action: PermissionAction, enabled: boolean) => void;
  setPermissions: (permissions: typeof ROLE_PERMISSIONS) => void;
  resetPermissions: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      activeHospitalId: "",
      permissions: ROLE_PERMISSIONS,
      login: (user, accessToken) => set({ user, accessToken, activeHospitalId: user.hospitalId }),
      logout: () => set({ user: null, accessToken: null, activeHospitalId: "" }),
      setAccessToken: (accessToken) => set({ accessToken }),
      setActiveHospital: (id) => set({ activeHospitalId: id }),
      setPermissions: (permissions) => set({ permissions }),
      updatePermission: (role, module, action, enabled) =>
        set((state) => {
          const updatedPermissions = { ...state.permissions };
          const roleRules = { ...updatedPermissions[role] };
          const moduleRule = roleRules[module] ? { ...roleRules[module] } : { access: "None" as const, actions: [] };

          let newActions = [...(moduleRule.actions || [])];
          if (enabled) {
            if (!newActions.includes(action)) {
              newActions.push(action);
            }
          } else {
            newActions = newActions.filter((a) => a !== action);
          }

          // Compute new access level: if no actions are left, module access is "None"
          const accessLevel = newActions.length > 0 ? (moduleRule.access === "None" ? "View" : moduleRule.access) : "None";

          roleRules[module] = {
            access: accessLevel,
            actions: newActions,
          };
          updatedPermissions[role] = roleRules;

          return { permissions: updatedPermissions };
        }),
      resetPermissions: () => set({ permissions: ROLE_PERMISSIONS }),
    }),
    { name: "hms-auth" },
  ),
);

