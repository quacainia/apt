import { useImageInfo } from "../api/hooks";
import type { ImageDerivatives } from "../api/types";
import PhotoGridItem from "./PhotoGridItem";

interface PhotoGridItemByIdProps {
  imageId: number;
  isSelected?: boolean;
  onSelect?: () => void;
  size?: keyof ImageDerivatives;
  hideOverlay?: boolean;
}

export default function PhotoGridItemById({
  imageId,
  isSelected,
  onSelect,
  size,
  hideOverlay,
}: PhotoGridItemByIdProps) {
  const { data: imageData, isLoading, error } = useImageInfo(imageId);

  const image =
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
      onSelect={onSelect}
      size={size}
      hideOverlay={hideOverlay}
    />
  );
}
