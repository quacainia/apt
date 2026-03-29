import type { Image } from "../api/types";
import { shouldSwapDimensions } from "./should-swap-dimensions";

export type LayoutRowImage = {
  type: "IMAGES";
  images: Image[];
  height: number;
  offset: number;
};
export type LayoutRowHeader = {
  type: "HEADER";
  content: string;
  height: number;
  offset: number;
  year: number;
  month: number;
  imageRows: LayoutRowImage[];
  sectionHeight: number;
};
export type LayoutRow = LayoutRowHeader | LayoutRowImage;

export const HEADER_HEIGHT = 42;

/**
 * Since VariableSizeList uses absolute positioning, this calculates the size of
 * each row, both of the images and of the headers.
 *
 * @param groups         - Images already split by group.
 * @param containerWidth - Computed width of the container the rows of images
 *                         go into.
 * @param targetHeight   - The goal height of the images in a row. We target
 *                         that height and then roll over if needed.
 * @param gap            - Both vertical and horizontal gap between images
 * @returns
 */
export const calculateLayout = (
  groups: { header: string; year: number; month: number; images: Image[] }[],
  containerWidth: number,
  targetHeight: number,
  gap: number,
): LayoutRowHeader[] => {
  const layout: LayoutRowHeader[] = [];
  let totalOffset = 0;

  groups.forEach((group) => {
    // 1. Add the Header Row
    const header: LayoutRowHeader = {
      type: "HEADER",
      content: group.header,
      height: HEADER_HEIGHT,
      offset: totalOffset,
      year: group.year,
      month: group.month,
      imageRows: [],
      sectionHeight: HEADER_HEIGHT,
    };
    totalOffset += HEADER_HEIGHT;

    let currentRow: Image[] = [];
    let currentRowWidth = 0;

    group.images.forEach((img) => {
      let aspectRatio = img.width / img.height;
      if (shouldSwapDimensions(img)) {
        aspectRatio = 1 / aspectRatio;
      }
      const projectedWidth = targetHeight * aspectRatio;

      // Check if adding this image exceeds the width
      if (
        currentRowWidth + projectedWidth + currentRow.length * gap >
        containerWidth
      ) {
        // Calculate the scale factor to make the row flush
        const totalPadding = (currentRow.length - 1) * gap;
        const availableWidth = containerWidth - totalPadding;
        const scale = availableWidth / currentRowWidth;
        const height = targetHeight * scale + gap;
        header.imageRows.push({
          type: "IMAGES",
          images: currentRow,
          height,
          offset: totalOffset,
        });
        header.sectionHeight += height;
        totalOffset += height;

        currentRow = [];
        currentRowWidth = 0;
      }

      currentRow.push(img);
      currentRowWidth += projectedWidth;
    });

    // Handle the "leftover" images in the last row of a group
    // We usually DON'T justify the last row (keep it at targetHeight)
    if (currentRow.length > 0) {
      header.imageRows.push({
        type: "IMAGES",
        images: currentRow,
        height: targetHeight,
        offset: totalOffset,
      });
      header.sectionHeight += targetHeight;
      totalOffset += targetHeight;
    }
    layout.push(header);
  });

  return layout;
};
