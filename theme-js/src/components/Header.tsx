import { Moon, Sun, SunMoon } from "lucide-react";
import { useAppStore, type AppState } from "../store/useAppStore";
import { Link } from "./Link";

interface HeaderProps {
  username?: string | null;
  onLogout: () => void;
}

export default function Header({ username, onLogout }: HeaderProps) {
  const colorScheme = useAppStore((s: AppState) => s.colorScheme);
  const toggleDarkMode = useAppStore((s: AppState) => s.toggleDarkMode);

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={{ type: "home" }}>
              <h1 className="flex flex-row gap-2 text-xl font-light text-gray-900 dark:text-white items-center">
                <img
                  src={`${window.viteDevServer}public/piwigo.flat.svg`}
                  className="h-8"
                  alt="📸"
                />
                {window.piwigoData?.banner ?? "Piwigo"}
              </h1>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {username && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {username}
              </span>
            )}

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              title="Toggle dark mode"
            >
              {colorScheme === "light" ? (
                <Sun />
              ) : colorScheme === "dark" ? (
                <Moon />
              ) : (
                <SunMoon />
              )}
            </button>

            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
