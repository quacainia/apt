export type PiwigoRoute =
  | { type: "home" }
  | { type: "category"; id: string | number }
  | { type: "picture"; id: string; category: string };

export function routeToHref(route: PiwigoRoute): string {
  switch (route.type) {
    case "home":
      return "./index.php";
    case "category":
      return `./index.php?/category/${route.id}`;
    case "picture":
      return `./picture.php?/${route.id}/category/${route.category}`;
  }
}

export function hrefToRoute(href: string): PiwigoRoute | null {
  const url = new URL(href, window.location.origin);
  const search = url.search;

  if (!search || search === "?") {
    return { type: "home" };
  }

  // Parse category routes: ?/category/204
  const categoryMatch = search.match(/\?\/category\/(\d+)/);
  if (categoryMatch) {
    return { type: "category", id: categoryMatch[1] };
  }

  // Parse picture routes: ?/29582/category/283
  const pictureMatch = search.match(/\?\/(\d+)\/category\/(\d+)/);
  if (pictureMatch) {
    return {
      type: "picture",
      id: pictureMatch[1],
      category: pictureMatch[2],
    };
  }

  return null;
}
