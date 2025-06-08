import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // UI Mode
  isLessonMode: boolean;
  toggleLessonMode: (mode?: boolean) => void;

  // Navigation state
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Theme (future expansion)
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // UI Mode
      isLessonMode: false,
      toggleLessonMode: (mode) =>
        set((state) => ({
          isLessonMode: mode !== undefined ? mode : !state.isLessonMode,
        })),

      // Navigation state
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) =>
        set(() => ({ sidebarCollapsed: collapsed })),

      // Theme
      theme: "system",
      setTheme: (theme) => set(() => ({ theme })),
    }),
    {
      name: "app-storage",
      partialize: (state) => ({
        isLessonMode: state.isLessonMode,
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
);
