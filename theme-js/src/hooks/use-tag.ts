import { useEffect } from "react";
import { useEntityStore } from "../store/entities";

/**
 * Hook to fetch and cache a tag
 */
export function useTag(tagId: string | number | undefined) {
  const tags = useEntityStore((state) => state.getEntities("tags"));
  const addEntities = useEntityStore((state) => state.addEntities);
  const hydrateFromDOM = useEntityStore((state) => state.hydrateFromDOM);

  const tag = tagId ? tags[String(tagId)] : undefined;

  useEffect(() => {
    // 1. Check the DOM first if the store is totally empty
    if (Object.keys(tags).length === 0) {
      hydrateFromDOM();
    }

    // 2. Fetch if ID is provided but tag isn't in lookup table
    if (tagId && !tag) {
      const fetchTag = async () => {
        try {
          const response = await fetch(`./tag.php?/${tagId}`, {
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
            if (data.tags) {
              addEntities("tags", data.tags);
            }
          }
        } catch (error) {
          console.error(`Error fetching tag ${tagId}:`, error);
        }
      };

      fetchTag();
    }
  }, [tagId, tag, tags, hydrateFromDOM, addEntities]);

  return tag;
}

/**
 * Hook to get all cached tags
 */
export function useAllTags() {
  const tags = useEntityStore((state) => state.getEntities("tags"));
  const hydrateFromDOM = useEntityStore((state) => state.hydrateFromDOM);

  useEffect(() => {
    if (Object.keys(tags).length === 0) {
      hydrateFromDOM();
    }
  }, [tags, hydrateFromDOM]);

  return tags;
}
