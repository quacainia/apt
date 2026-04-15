import { RootAlbum } from "../RootAlbum";
import type { PiwigoRoute } from "../utils/routes";
import CategoryView from "./CategoryView";
import PhotoView from "./PhotoView";

export const PageView = ({ route }: { route: PiwigoRoute }) => {
  if (route.type === "category") {
    return <CategoryView categoryId={route.id} />;
  } else if (route.type === "home") {
    return <RootAlbum />;
  } else if (route.type === "picture") {
    return <PhotoView photoId={route.id} categoryId={route.category} />;
  }
  // @todo 404
  return "Not found";
};
