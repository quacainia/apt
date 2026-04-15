import { useImageInfo } from "../api/hooks";
import type { Image, ImageDerivatives } from "../api/types";
import type { PiwigoRoute } from "../utils/routes";
import PhotoGridItem from "./PhotoGridItem";

interface PhotoGridItemByIdProps {
  imageId: number;
  isSelected?: boolean;
  to?: PiwigoRoute;
  size?: keyof ImageDerivatives;
  hideOverlay?: boolean;
}

export default function PhotoGridItemById({
  imageId,
  isSelected,
  to,
  size,
  hideOverlay,
}: PhotoGridItemByIdProps) {
  const { data: imageData, isLoading, error } = useImageInfo(imageId);

  const image: Image | null =
    imageData?.stat === "ok" && imageData.result ? imageData.result : null;

  if (error) {
    // @todo: BEN FIX IT
    return "Error!";
  }

  if (image === null || isLoading) {
    return <div className="size-full animate-pulse bg-white"></div>;
  }
  return (
    <PhotoGridItem
      image={image}
      isSelected={isSelected}
      to={to}
      size={size}
      hideOverlay={hideOverlay}
    />
  );
}
