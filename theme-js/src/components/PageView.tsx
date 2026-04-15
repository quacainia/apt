import type { PiwigoRoute } from "../utils/routes";
import CategoryView from "./CategoryView";
import PhotoView from "./PhotoView";
import { RootAlbumView } from "./RootAlbumView";

export const PageView = ({ route }: { route: PiwigoRoute }) => {
  if (route.type === "category") {
    return <CategoryView categoryId={route.id} />;
  } else if (route.type === "home") {
    return <RootAlbumView />;
  } else if (route.type === "picture") {
    return <PhotoView photoId={route.id} categoryId={route.category} />;
  }
  // @todo 404
  return "Not found";
};
