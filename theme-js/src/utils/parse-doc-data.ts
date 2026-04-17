import type { PiwigoResponse } from "../store/entities";

export const DEFAULT_JSON_SCRIPT_ID = "apt-theme-json";

/**
 * Parse Piwigo data from a DOM data island element
 * Returns the full response structure with all entity types
 */
export const parseDocData = <T extends object = PiwigoResponse, P = undefined>(
  doc: Document,
  elementId: string = DEFAULT_JSON_SCRIPT_ID,
  fallback: P = undefined as P,
): T | P => {
  const dataIsland = doc.getElementById(elementId);
  if (!dataIsland) return fallback;

  try {
    const json: T = JSON.parse(dataIsland.textContent || "");
    return json;
  } catch (e) {
    console.error("Failed to parse Piwigo JSON data island:", e);
    return fallback;
  }
};

/**
 * Parse and extract a specific entity type from a DOM data island
 */
export const parseDocEntityData = <T>(
  doc: Document,
  entityType: string,
  elementId: string = DEFAULT_JSON_SCRIPT_ID,
): { [key: string]: T } | undefined => {
  const data = parseDocData(doc, elementId);
  if (!data) return;

  const entities = data[entityType as keyof PiwigoResponse];
  if (!entities || typeof entities !== "object") return;

  return entities as { [key: string]: T };
};

/**
 * Parse Piwigo data from a DOM data island element in HTML text
 * Returns the full response structure with all entity types
 */
export const parseDocDataFromString = (
  html: string,
  elementId: string = DEFAULT_JSON_SCRIPT_ID,
) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  return parseDocData(doc, elementId);
};

/**
 * Parse and extract a specific entity type from a DOM data island in HTML text
 */
export const parseDocEntityDataFromString = (
  html: string,
  entityType: string,
  elementId: string = DEFAULT_JSON_SCRIPT_ID,
) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  return parseDocEntityData(doc, entityType, elementId);
};
