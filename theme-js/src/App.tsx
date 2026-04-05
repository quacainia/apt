import { useEffect, type ReactNode } from "react";
import { useLogout, useSessionStatus } from "./api/hooks";
import Header from "./components/Header";
import { LoadingSpinner } from "./components/LoadingSpinner";
import LoginPage from "./components/LoginPage";
import { PageView } from "./components/PageView";
import { StandardErrorMessage } from "./components/StandardErrorMessage";
import { useRouter } from "./store/router";
import { useAppStore } from "./store/useAppStore";

function App() {
  const { route } = useRouter();

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
      view = <StandardErrorMessage error={sessionError} />;
    } else {
      view = <LoginPage />;
    }
  } else {
    view = <PageView route={route} />;
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
