import { useState } from "react";
import { useLogin } from "../api/hooks";
import { useAppStore, type AppState } from "../store/useAppStore";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useLogin();
  const setAuth = useAppStore((s: AppState) => s.setAuth);
  const setCurrentView = useAppStore((s: AppState) => s.setCurrentView);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const result = await loginMutation.mutateAsync({ username, password });
      if (result?.stat === "ok" && result?.result) {
        setAuth(true, username);
        setCurrentView("albums");
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-gray-900 dark:text-white mb-2">
            Piwigo Photos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to your gallery
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
              placeholder="Enter username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
              placeholder="Enter password"
              required
            />
          </div>

          {loginMutation.isError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-400 text-sm">
              Login failed. Please check your credentials.
            </div>
          )}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loginMutation.isPending ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
