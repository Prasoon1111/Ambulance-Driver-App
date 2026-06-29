import { create } from "zustand";

import { activityFeed, emergencies, hospitals, priorityAlerts, systemStatus } from "@/services/mockPoliceData";

export const usePoliceStore = create((set, get) => ({
  emergencies,
  hospitals,
  priorityAlerts,
  activityFeed,
  systemStatus,
  selectedEmergencyId: emergencies[0]?.id ?? null,
  drawerOpen: false,
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  searchQuery: "",
  isAuthenticated: false,

  login: () => set({ isAuthenticated: true }),
  logout: () => set({ isAuthenticated: false }),
  selectEmergency: (id) => set({ selectedEmergencyId: id, drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  getSelectedEmergency: () => {
    const { emergencies: emergencyList, selectedEmergencyId } = get();
    return emergencyList.find((emergency) => emergency.id === selectedEmergencyId) ?? emergencyList[0];
  },
}));
