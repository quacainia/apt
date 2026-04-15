import { useEffect } from "react";
import { useEntityStore } from "../store/entities";

/**
 * Hook to fetch and cache a category
 */
export function useCategory(categoryId: string | number | undefined) {
  const categories = useEntityStore((state) => state.getEntities("categories"));
  const addEntities = useEntityStore((state) => state.addEntities);
  const hydrateFromDOM = useEntityStore((state) => state.hydrateFromDOM);

  const category = categoryId ? categories[String(categoryId)] : undefined;

  useEffect(() => {
    // 1. Check the DOM first if the store is totally empty
    if (Object.keys(categories).length === 0) {
      hydrateFromDOM();
    }

    // 2. Fetch if ID is provided but category isn't in lookup table
    if (categoryId && !category) {
      const fetchCategory = async () => {
        try {
          const response = await fetch(`./category.php?/${categoryId}`, {
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
            if (data.categories) {
              addEntities("categories", data.categories);
            }
          }
        } catch (error) {
          console.error(`Error fetching category ${categoryId}:`, error);
        }
      };

      fetchCategory();
    }
  }, [categoryId, category, categories, hydrateFromDOM, addEntities]);

  return category;
}

/**
 * Hook to get all cached categories
 */
export function useAllCategories() {
  const categories = useEntityStore((state) => state.getEntities("categories"));
  const hydrateFromDOM = useEntityStore((state) => state.hydrateFromDOM);

  useEffect(() => {
    if (Object.keys(categories).length === 0) {
      hydrateFromDOM();
    }
  }, [categories, hydrateFromDOM]);

  return categories;
}
