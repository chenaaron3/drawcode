import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // Theme (future expansion)
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Theme
      theme: "system",
      setTheme: (theme) => set(() => ({ theme })),
    }),
    {
      name: "app-storage",
      partialize: (state) => ({
        theme: state.theme,
      }),
    }
  )
);
