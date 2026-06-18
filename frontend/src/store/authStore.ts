import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "@/types/common";

export interface AuthUser {
  name: string;
  role: Role;
  hospitalId: string;
}

interface AuthState {
  user: AuthUser | null;
  activeHospitalId: string;
  login: (user: AuthUser) => void;
  logout: () => void;
  setActiveHospital: (id: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      activeHospitalId: "",
      login: (user) => set({ user, activeHospitalId: user.hospitalId }),
      logout: () => set({ user: null, activeHospitalId: "" }),
      setActiveHospital: (id) => set({ activeHospitalId: id }),
    }),
    { name: "hms-auth" },
  ),
);
