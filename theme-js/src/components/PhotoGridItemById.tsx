import { useImageInfo } from "../api/hooks";
import type { Image, ImageDerivatives } from "../api/types";
import type { PiwigoRoute } from "../utils/routes";
import PhotoGridItem from "./PhotoGridItem";

interface PhotoGridItemByIdProps {
  height?: number;
  hideOverlay?: boolean;
  imageId: number;
  isScrolling: boolean;
  isSelected?: boolean;
  size?: keyof ImageDerivatives;
  to?: PiwigoRoute;
}

export default function PhotoGridItemById({
  height,
  hideOverlay,
  imageId,
  isScrolling,
  isSelected,
  size,
  to,
}: PhotoGridItemByIdProps) {
  const { data: imageData, isLoading, error } = useImageInfo(imageId);

  const image: Image | null =
    imageData?.stat === "ok" && imageData.result ? imageData.result : null;

  return (
    <PhotoGridItem
      isScrolling={isScrolling}
      image={image}
      error={error}
      isLoading={image ? false : isLoading}
      isSelected={isSelected}
      to={to}
      size={size}
      hideOverlay={hideOverlay}
      height={height}
    />
  );
}
