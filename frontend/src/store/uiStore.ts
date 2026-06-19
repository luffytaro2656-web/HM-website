import { create } from "zustand";

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebar: (v: boolean) => void;
  mobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
  setMobileSidebar: (v: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebar: (sidebarCollapsed) => set({ sidebarCollapsed }),
  mobileSidebarOpen: false,
  toggleMobileSidebar: () => set((s) => ({ mobileSidebarOpen: !s.mobileSidebarOpen })),
  setMobileSidebar: (mobileSidebarOpen) => set({ mobileSidebarOpen }),
}));
