export interface QueryParams {
  view?: "albums" | "photos" | "search" | "login";
  album?: string | null;
  search?: string | null;
  page?: string | null;
  tag?: string | null;
  [key: string]: string | undefined | null;
}

export function parseQuery(search: string): QueryParams {
  const params: QueryParams = {};
  const sp = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );

  sp.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}

export function stringifyQuery(params: QueryParams): string {
  const sp = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      sp.set(key, value);
    }
  });

  const str = sp.toString();
  return str ? "?" + str : "";
}

export function updateQuery(updates: Partial<QueryParams>): string {
  const current = parseQuery(window.location.search);
  const merged = { ...current, ...updates };

  // Remove undefined/null/empty values
  Object.keys(merged).forEach((key) => {
    if (
      merged[key as keyof QueryParams] === undefined ||
      merged[key as keyof QueryParams] === null ||
      merged[key as keyof QueryParams] === ""
    ) {
      delete merged[key as keyof QueryParams];
    }
  });

  return stringifyQuery(merged);
}

export function navigateTo(params: Partial<QueryParams>): void {
  const query = updateQuery(params);
  window.history.pushState({}, "", query);
}
