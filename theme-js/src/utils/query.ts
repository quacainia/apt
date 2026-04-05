export interface PiwigoRoute {
  category?: string | null;
  photoId?: string | null;
  section?: "category" | "tags" | "search" | "admin" | null;
  sectionId?: string | null;
  page?: string | null;
}

export function parseRoute(search: string): PiwigoRoute {
  // Remove leading /index.php if present
  let path = search.split("?")[1];
  const route: PiwigoRoute = {};

  if (!path) {
    return route; // Root path
  }

  // Remove leading slash
  if (path.startsWith("/")) {
    path = path.slice(1);
  }

  // Split by forward slash to get segments
  const segments = path.split("/").filter(Boolean);

  if (segments.length === 0) {
    return route;
  }

  let currentIndex = 0;

  // Check if first segment is a number (photo ID)
  if (/^\d+$/.test(segments[0])) {
    route.photoId = segments[0];
    currentIndex = 1;
  }

  for (let i = currentIndex; i < segments.length; i++) {
    const segment = segments[i];
    if (segment === "category") {
      route.category = segments[++i];
    }
  }

  // Next segment should be the section (category, tags, search, etc.)
  if (currentIndex < segments.length) {
    const section = segments[currentIndex];
    if (["category", "tags", "search", "admin"].includes(section)) {
      route.section = section as PiwigoRoute["section"];
      currentIndex++;
    }
  }

  // Next segment should be the section ID
  if (currentIndex < segments.length) {
    route.sectionId = segments[currentIndex];
    currentIndex++;
  }

  // Check for page parameter in query string
  const url = new URL(window.location.href);
  const pageParam = url.searchParams.get("page");
  if (pageParam) {
    route.page = pageParam;
  }

  return route;
}

export function buildRoute(route: PiwigoRoute): string {
  let path = "/index.php";
  const segments: string[] = [];

  // Add photo ID if present
  if (route.photoId) {
    segments.push(route.photoId);
  }

  // Add section and section ID
  if (route.section && route.sectionId) {
    segments.push(route.section);
    segments.push(route.sectionId);
  } else if (route.section) {
    segments.push(route.section);
  }

  // Build the path
  if (segments.length > 0) {
    path += "?" + segments.join("/");
  }

  // Add page parameter if present
  if (route.page) {
    const separator = segments.length > 0 ? "&" : "?";
    path += separator + "page=" + encodeURIComponent(route.page);
  }

  return path;
}

export function updateRoute(updates: Partial<PiwigoRoute>): string {
  const current = parseRoute(window.location.pathname);
  const merged = { ...current, ...updates };

  // Remove undefined/null values
  Object.keys(merged).forEach((key) => {
    if (
      merged[key as keyof PiwigoRoute] === undefined ||
      merged[key as keyof PiwigoRoute] === null ||
      merged[key as keyof PiwigoRoute] === ""
    ) {
      delete merged[key as keyof PiwigoRoute];
    }
  });

  return buildRoute(merged);
}

export function navigateTo(updates: Partial<PiwigoRoute>): void {
  const route = updateRoute(updates);
  window.history.pushState({}, "", route);
}
