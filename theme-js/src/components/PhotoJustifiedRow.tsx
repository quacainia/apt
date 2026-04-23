import type { ImageLayoutRow } from "../utils/virtualize-images-list";
import PhotoGridItem from "./PhotoGridItem";

export interface PhotoJustifiedRowProps {
  categoryId?: number | string;
  isScrolling: boolean;
  row: ImageLayoutRow;
}

export const PhotoJustifiedRow = ({
  categoryId,
  isScrolling,
  row,
}: PhotoJustifiedRowProps) => {
  return (
    <div className="flex gap-1.5">
      {row.images.map((il) => {
        return (
          <PhotoGridItem
            isScrolling={isScrolling}
            key={il.image.id}
            image={il.image}
            height={row.height as number}
            to={
              categoryId
                ? {
                    type: "picture",
                    id: il.image.id.toString(),
                    category: categoryId.toString(),
                  }
                : undefined
            }
          />
        );
      })}
    </div>
  );
};
