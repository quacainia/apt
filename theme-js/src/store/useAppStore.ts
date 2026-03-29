import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AppState {
  // Auth
  isAuthenticated: boolean;
  username: string | null;
  pwgToken: string | null;
  userId: number | null;

  // Navigation
  currentView: "albums" | "photos" | "search" | "login";
  currentAlbumId: number | null;

  // UI State
  colorScheme: "light" | "dark" | "auto";

  // Actions
  setAuth: (
    isAuth: boolean,
    username?: string,
    token?: string,
    userId?: number,
  ) => void;
  clearAuth: () => void;
  setCurrentView: (view: "albums" | "photos" | "search" | "login") => void;
  setCurrentAlbum: (albumId: number | null) => void;
  toggleDarkMode: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      isAuthenticated: false,
      username: null,
      pwgToken: null,
      userId: null,
      currentView: "login",
      currentAlbumId: null,
      colorScheme: "auto",

      // Auth actions
      setAuth: (isAuth, username, token, userId) =>
        set({
          isAuthenticated: isAuth,
          username: username || null,
          pwgToken: token || null,
          userId: userId || null,
          currentView: isAuth ? "albums" : "login",
        }),

      clearAuth: () =>
        set({
          isAuthenticated: false,
          username: null,
          pwgToken: null,
          userId: null,
          currentView: "login",
        }),

      // Navigation actions
      setCurrentView: (view) => set({ currentView: view }),
      setCurrentAlbum: (albumId) => set({ currentAlbumId: albumId }),

      // UI actions
      toggleDarkMode: () =>
        set((state) => ({
          colorScheme:
            state.colorScheme === "auto"
              ? "light"
              : state.colorScheme === "dark"
                ? "auto"
                : "dark",
        })),
    }),
    {
      name: "piwigo-viewer-store",
      partialize: (state) => ({
        colorScheme: state.colorScheme,
      }),
    },
  ),
);
