import { useEffect } from "react";
import { useLogout, useSessionStatus } from "./api/hooks";
import AlbumsView from "./components/AlbumsView";
import Header from "./components/Header";
import LoginPage from "./components/LoginPage";
import PhotosView from "./components/PhotosView";
import { useAppStore } from "./store/useAppStore";
import { parseQuery } from "./utils/query";

function App() {
  const { data: sessionStatus, isLoading: sessionLoading } = useSessionStatus();

  const {
    isAuthenticated,
    currentView,
    setAuth,
    clearAuth,
    setCurrentView,
    colorScheme,
    username,
  } = useAppStore();

  const logoutMutation = useLogout();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    clearAuth();
  };

  // Update auth state based on session status
  useEffect(() => {
    if (!sessionLoading && sessionStatus) {
      const result = sessionStatus.result;

      // Check for a valid logged-in state
      // Logic: If there is a username and the status isn't "guest" or "ko"
      const isAuthenticated =
        result &&
        result.status !== "ko" &&
        result.status !== "guest" &&
        !!result.username;

      if (isAuthenticated) {
        const username = result.username;
        const userId = result.user_id;
        const token = result.pwg_token;
        setAuth(true, username, token, userId);
      } else {
        clearAuth();
      }
    }
  }, [sessionStatus, sessionLoading, setAuth, clearAuth]);

  // Handle query string changes
  useEffect(() => {
    const handlePopState = () => {
      const query = parseQuery(window.location.search);
      const view = query.view || "albums";
      if (isAuthenticated) {
        setCurrentView(view);
      }
    };

    window.addEventListener("popstate", handlePopState);
    handlePopState();

    return () => window.removeEventListener("popstate", handlePopState);
  }, [isAuthenticated, setCurrentView]);

  // Apply dark mode
  useEffect(() => {
    if (colorScheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (colorScheme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      const match = window.matchMedia("(prefers-color-scheme: dark)");

      const setScheme = (matches: boolean) => {
        if (matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      };

      const setSchemeHandler = (event: MediaQueryListEvent) => {
        setScheme(event.matches);
      };

      setScheme(window.matchMedia("(prefers-color-scheme: dark)").matches);

      match.addEventListener("change", setSchemeHandler);

      return () => {
        match.removeEventListener("change", setSchemeHandler);
      };
    }
  }, [colorScheme]);

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-50"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="size-full bg-white dark:bg-gray-900">
      <div className="flex flex-col h-full bg-white dark:bg-gray-900 overflow-hidden items-stretch">
        <Header username={username} onLogout={handleLogout} />
        {currentView === "albums" && <AlbumsView />}
        {currentView === "photos" && <PhotosView />}
      </div>
    </div>
  );
}

export default App;
