import { create } from "zustand";
import { type PiwigoRoute, hrefToRoute, routeToHref } from "../utils/routes";

interface RouterStore {
  route: PiwigoRoute;
  navigate: (route: PiwigoRoute) => void;
  navigateHref: (href: string) => void;
  _initializeFromUrl: () => void;
}

export const useRouter = create<RouterStore>((set) => {
  const navigateHref = (href: string) => {
    const url = new URL(href, window.location.href);
    window.history.pushState(null, "", url.href);
  };
  return {
    route: { type: "home" },

    navigate: (newRoute: PiwigoRoute) => {
      const href = routeToHref(newRoute);
      navigateHref(href);
      set({ route: newRoute });
    },

    navigateHref: (href: string) => {
      navigateHref(href);

      try {
        const resolved = new URL(href, window.location.href);
        const parsed = hrefToRoute(resolved.href);
        set({ route: parsed || { type: "error" } });
      } catch {
        set({ route: { type: "error" } });
      }
    },

    _initializeFromUrl: () => {
      const parsed = hrefToRoute(window.location.href);
      set({ route: parsed || { type: "error" } });
    },
  };
});

// Initialize on page load and listen for back button
if (typeof window !== "undefined") {
  useRouter.getState()._initializeFromUrl();

  window.addEventListener("popstate", () => {
    useRouter.getState()._initializeFromUrl();
  });
}
