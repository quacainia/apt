import { create } from "zustand";
import { type PiwigoRoute, hrefToRoute, routeToHref } from "../utils/routes";

interface RouterStore {
  route: PiwigoRoute;
  navigate: (route: PiwigoRoute) => void;
  _initializeFromUrl: () => void;
}

export const useRouter = create<RouterStore>((set) => ({
  route: { type: "home" },

  navigate: (newRoute: PiwigoRoute) => {
    const href = routeToHref(newRoute);
    const url = new URL(href, window.location.origin);
    window.history.pushState(null, "", url.href);
    set({ route: newRoute });
  },

  _initializeFromUrl: () => {
    const parsed = hrefToRoute(window.location.href);
    set({ route: parsed || { type: "home" } });
  },
}));

// Initialize on page load and listen for back button
if (typeof window !== "undefined") {
  useRouter.getState()._initializeFromUrl();

  window.addEventListener("popstate", () => {
    useRouter.getState()._initializeFromUrl();
  });
}
