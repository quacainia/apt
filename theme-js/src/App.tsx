import { useEffect, useState, type ReactNode } from "react";
import { useLogout, useSessionStatus } from "./api/hooks";
import CategoryView from "./components/CategoryView";
import Header from "./components/Header";
import { LoadingSpinner } from "./components/LoadingSpinner";
import LoginPage from "./components/LoginPage";
import { RootAlbum } from "./RootAlbum";
import { useAppStore } from "./store/useAppStore";
import { parseRoute, type PiwigoRoute } from "./utils/query";

function App() {
  const [route, setRoute] = useState<PiwigoRoute | undefined>();

  const {
    data: sessionStatus,
    isLoading: sessionLoading,
    error: sessionError,
  } = useSessionStatus();

  const { isAuthenticated, clearAuth, colorScheme, setAuth, username } =
    useAppStore();

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

  useEffect(() => {
    const handlePopState = () => {
      const route = parseRoute(window.location.search);
      setRoute(route);
    };

    window.addEventListener("popstate", handlePopState);
    handlePopState();

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

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

  let view: ReactNode;
  if (sessionLoading) {
    view = <LoadingSpinner />;
  } else if (!isAuthenticated) {
    if (sessionError && sessionError.status === 502) {
      view = (
        <div className="flex flex-col items-center">
          <div className="max-w-7xl p-10">
            Trouble connecting to the server, please try again.
          </div>
        </div>
      );
    } else {
      view = <LoginPage />;
    }
  } else if (route?.category) {
    view = <CategoryView categoryId={route?.category} />;
  } else {
    view = <RootAlbum />;
  }

  return (
    <div className="size-full bg-white dark:bg-gray-900">
      <div className="flex flex-col h-full bg-white dark:bg-gray-900 overflow-hidden items-stretch">
        <Header username={username} onLogout={handleLogout} />
        {view}
      </div>
    </div>
  );
}

export default App;
