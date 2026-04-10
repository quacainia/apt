import type { ImageLayoutRow } from "../utils/virtualize-images-list";
import PhotoGridItem from "./PhotoGridItem";

export interface PhotoJustifiedRowProps {
  row: ImageLayoutRow;
}

export const PhotoJustifiedRow = ({ row }: PhotoJustifiedRowProps) => {
  return (
    <div className="flex gap-1.5">
      {row.images.map((il) => {
        return (
          <PhotoGridItem
            key={il.image.id}
            image={il.image}
            height={row.height as number}
          />
        );
      })}
    </div>
  );
};
