import { RootAlbum } from "../RootAlbum";
import type { PiwigoRoute } from "../utils/routes";
import CategoryView from "./CategoryView";

export const PageView = ({ route }: { route: PiwigoRoute }) => {
  if (route.type === "category") {
    return <CategoryView categoryId={route.id} />;
  } else if (route.type === "home") {
    return <RootAlbum />;
  }
  // @todo 404
  return "Not found";
};
