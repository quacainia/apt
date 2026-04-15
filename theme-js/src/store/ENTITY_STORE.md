# Entity Store Documentation

The entity store is a unified caching system for all Piwigo data types: photos, categories, tags, and custom entity types.

## Core Store

### `useEntityStore` - The Generic Store

The main store that handles all entity types:

```tsx
import { useEntityStore } from "@/store/entities";

// Get all photos
const photos = useEntityStore((state) => state.getEntities("images"));

// Get a single entity
const photo = useEntityStore((state) => state.getEntity("images", "123"));

// Add entities
const addEntities = useEntityStore((state) => state.addEntities);
addEntities("images", { "123": { id: "123", title: "My Photo" } });

// Hydrate from DOM data island
const hydrateFromDOM = useEntityStore((state) => state.hydrateFromDOM);
hydrateFromDOM();
```

## Convenience Hooks

### Photos

```tsx
import { usePhotos, usePhoto } from "@/hooks";

// Get all photos
const { photos, addPhotos } = usePhotos();

// Get a single photo and fetch if needed
const photo = usePhoto("123", categoryId);
```

### Categories

```tsx
import { useCategory, useAllCategories } from "@/hooks";

// Get a single category (fetches if needed)
const category = useCategory("456");

// Get all cached categories
const categories = useAllCategories();
```

### Tags

```tsx
import { useTag, useAllTags } from "@/hooks";

// Get a single tag (fetches if needed)
const tag = useTag("789");

// Get all cached tags
const tags = useAllTags();
```

## Generic Hooks

For custom entity types or to add new ones:

```tsx
import { useEntity, useAllEntities } from "@/hooks";

// Get a single custom entity
const author = useEntity("authors", "123", (id) => `./author.php?/${id}`);

// Get all custom entities
const authors = useAllEntities("authors");
```

## Data Island Format

The DOM data island (`#apt-theme-json`) should contain JSON like:

```json
{
  "images": { "1": { "id": "1", "title": "Photo 1" }, ... },
  "categories": { "1": { "id": "1", "name": "Category 1" }, ... },
  "tags": { "1": { "id": "1", "name": "Tag 1" }, ... }
}
```

## Advanced Usage

### Hydrating from Custom Element

```tsx
const hydrateFromDOM = useEntityStore((state) => state.hydrateFromDOM);
hydrateFromDOM("custom-data-element-id");
```

### Adding from API Response

```tsx
const addFromResponse = useEntityStore((state) => state.addFromResponse);
const response = await fetch("./api/data.json").then((r) => r.json());
addFromResponse(response);
```

### Clearing Entities

```tsx
const clearEntities = useEntityStore((state) => state.clearEntities);

// Clear photos only
clearEntities("images");

// Clear all entities
clearEntities();
```

## Extending for Custom Types

To add a new entity type, simply use the generic store:

```tsx
// In a component
const addEntities = useEntityStore((state) => state.addEntities);
addEntities("authors", {
  "1": { id: "1", name: "John Doe" },
  "2": { id: "2", name: "Jane Smith" },
});

// Retrieve them
const authors = useEntityStore((state) => state.getEntities("authors"));
```

Or create a custom hook:

```tsx
// hooks/use-author.ts
export function useAuthor(authorId) {
  const author = useEntityStore((state) =>
    state.getEntity("authors", authorId),
  );
  // ... fetch logic
  return author;
}
```

## Type Safety

Define types for your entities:

```tsx
interface Photo extends Entity {
  id: string;
  title: string;
  image_url: string;
}

interface Category extends Entity {
  id: number;
  name: string;
  nb_images: number;
}

// Use with hooks
const photo = useEntity<Photo>("images", photoId);
const category = useCategory(catId); // Already typed as Category
```
