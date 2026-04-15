import { useEffect } from "react";
import { useEntityStore, type Entity } from "../store/entities";

/**
 * Generic hook to fetch and cache any entity type
 * Usage: useEntity("photos", "123") or useEntity("categories", "456")
 */
export function useEntity<T extends Entity = Entity>(
  entityType: string,
  entityId: string | number | undefined,
  fetchUrl?: (id: string | number) => string,
) {
  const entity = useEntityStore((state) =>
    entityId ? state.getEntity(entityType, entityId) : undefined,
  );
  const addEntities = useEntityStore((state) => state.addEntities);
  const getEntities = useEntityStore((state) => state.getEntities);
  const hydrateFromDOM = useEntityStore((state) => state.hydrateFromDOM);

  useEffect(() => {
    // 1. Check the DOM first if the store is totally empty
    const allEntities = getEntities(entityType);
    if (Object.keys(allEntities).length === 0) {
      hydrateFromDOM();
    }

    // 2. Fetch if ID is provided but entity isn't in lookup table
    if (entityId && !entity && fetchUrl) {
      const fetchEntity = async () => {
        try {
          const url = fetchUrl(entityId);
          const response = await fetch(url, {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          });
          const html = await response.text();

          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");
          const raw = doc.getElementById("apt-theme-json")?.textContent;

          if (raw) {
            const data = JSON.parse(raw);
            // Handle the case where the response may have the entity type
            if (data[entityType]) {
              addEntities(entityType, data[entityType]);
            }
          }
        } catch (error) {
          console.error(
            `Error fetching ${entityType} with id ${entityId}:`,
            error,
          );
        }
      };

      fetchEntity();
    }
  }, [
    entityId,
    entity,
    entityType,
    getEntities,
    hydrateFromDOM,
    addEntities,
    fetchUrl,
  ]);

  return entity as T | undefined;
}

/**
 * Generic hook to get all cached entities of a type
 */
export function useAllEntities<T extends Entity = Entity>(entityType: string) {
  const entities = useEntityStore((state) => state.getEntities(entityType));
  const hydrateFromDOM = useEntityStore((state) => state.hydrateFromDOM);

  useEffect(() => {
    if (Object.keys(entities).length === 0) {
      hydrateFromDOM();
    }
  }, [entities, hydrateFromDOM]);

  return entities as { [key: string]: T };
}
