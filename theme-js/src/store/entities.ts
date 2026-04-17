import { create } from "zustand";
import type { PhotoPhpImage } from "../hooks/use-photo";
import { DEFAULT_JSON_SCRIPT_ID, parseDocData } from "../utils/parse-doc-data";

/**
 * Generic entity type - all Piwigo entities (photos, categories, tags, etc)
 * should conform to at least having an id
 */
export interface Entity {
  id: string | number;
  [key: string]: unknown;
}

/**
 * Map of entities by ID
 */
export type EntityMap<T extends Entity = Entity> = {
  [key: string]: T;
};

/**
 * Piwigo API Response structure
 */
export interface PiwigoResponse {
  images: EntityMap<PhotoPhpImage>;
  categories?: EntityMap;
  tags?: EntityMap;
  themeStatus?: AptThemeStatus;
  [key: string]: EntityMap | Record<string, unknown> | undefined;
}

/**
 * Entity store that can handle multiple entity types
 */
interface EntityState {
  // Store entities organized by type: { photos: {...}, categories: {...}, tags: {...} }
  entities: PiwigoResponse;

  /**
   * Add entities of a specific type
   */
  addEntities: <T extends string>(
    entityType: T,
    newEntities: PiwigoResponse[T],
  ) => void;

  /**
   * Get all entities of a specific type
   */
  getEntities: <T extends string>(entityType: T) => PiwigoResponse[T];

  /**
   * Get a single entity by type and id
   */
  getEntity: <T extends Entity = Entity>(
    entityType: string,
    id: string | number,
  ) => T | undefined;

  /**
   * Add entities from a Piwigo API response (handles multiple entity types)
   */
  addFromResponse: (response: PiwigoResponse) => void;

  /**
   * Hydrate store from DOM data island
   */
  hydrateFromDOM: (documentElementId?: string) => void;

  /**
   * Clear entities of a specific type or all entities
   */
  clearEntities: (entityType?: string) => void;
}

type AptThemeStatus = {
  distpath?: string;
  isPluginInstalled: boolean;
};

export const useEntityStore = create<EntityState>((set, get) => ({
  entities: {
    images: {},
    themeStatus: {
      isPluginInstalled: false,
      ...(window.piwigoData?.aptThemeStatus ?? {}),
    },
  },

  addEntities: (entityType, newEntities) =>
    set((state) => ({
      entities: {
        ...state.entities,
        [entityType]: {
          ...(state.entities[entityType] || {}),
          ...newEntities,
        },
      },
    })),

  getEntities: (entityType) => {
    return get().entities[entityType] || {};
  },

  getEntity: <T extends Entity = Entity>(
    entityType: string,
    id: string | number,
  ) => {
    const entities = get().entities[entityType] || {};
    return entities[String(id)] as T;
  },

  addFromResponse: (response) => {
    const state = get();
    // Iterate through all keys in the response and add them as entity types
    Object.entries(response).forEach(([key, entityMap]) => {
      if (entityMap && typeof entityMap === "object") {
        state.addEntities(key, entityMap);
      }
    });
  },

  hydrateFromDOM: (documentElementId = DEFAULT_JSON_SCRIPT_ID) => {
    const json: PiwigoResponse | undefined = parseDocData<PiwigoResponse>(
      document,
      documentElementId,
    );

    if (json) {
      get().addFromResponse(json);
    }
  },

  clearEntities: (entityType) => {
    set((state) => {
      if (!entityType) {
        return { entities: { images: {} } };
      }
      const { [entityType]: _, ...rest } = state.entities;
      return { entities: { ...rest, [entityType]: {} } as PiwigoResponse };
    });
  },
}));

/**
 * Convenience hook for photos (backward compatible)
 */
export function usePhotos() {
  return useEntityStore((state) => ({
    photos: state.getEntities("images"),
    addPhotos: (photos: EntityMap<PhotoPhpImage>) =>
      state.addEntities("images", photos),
  }));
}

/**
 * Convenience hook for categories
 */
export function useCategories() {
  return useEntityStore((state) => ({
    categories: state.getEntities("categories"),
    addCategories: (categories: EntityMap) =>
      state.addEntities("categories", categories),
  }));
}

/**
 * Convenience hook for tags
 */
export function useTags() {
  return useEntityStore((state) => ({
    tags: state.getEntities("tags"),
    addTags: (tags: EntityMap) => state.addEntities("tags", tags),
  }));
}
