import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // Theme (future expansion)
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;

  // Sidebar state
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Theme
      theme: "system",
      setTheme: (theme) => set(() => ({ theme })),

      // Sidebar
      isSidebarOpen: false,
      setSidebarOpen: (isOpen) => set(() => ({ isSidebarOpen: isOpen })),
      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    }),
    {
      name: "app-storage",
      partialize: (state) => ({
        theme: state.theme,
        isSidebarOpen: state.isSidebarOpen,
      }),
    },
  ),
);
