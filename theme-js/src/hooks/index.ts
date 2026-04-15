// Entity store hooks
export { useAllCategories, useCategory } from "./use-category";
export { useAllEntities, useEntity } from "./use-entity";
export { usePhoto } from "./use-photo";
export { useAllTags, useTag } from "./use-tag";

// UI hooks
export { useBreakpoint } from "./use-breakpoint";

// Re-export convenience hooks from store
export {
  useCategories,
  useEntityStore,
  usePhotos,
  useTags,
} from "../store/entities";
