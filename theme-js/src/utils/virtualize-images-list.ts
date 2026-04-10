import justifiedLayout from "justified-layout";
import type { Image } from "../api/types";
import { PHOTO_GRID_MARGIN } from "../components/PhotoGridVirtual";
import { formatMonth, getMonthKey } from "./format";
import { shouldSwapDimensions } from "./should-swap-dimensions";

type JustifiedLayoutOptions = Parameters<typeof justifiedLayout>[1];
type JustifiedLayoutResult = ReturnType<typeof justifiedLayout>;
type LayoutBox = JustifiedLayoutResult["boxes"][number];

export type ImageLayout = {
  image: Image;
  layout: LayoutBox;
};

export type ImageLayoutRow = {
  images: ImageLayout[];
  height: number;
  boxSpacing: number;
};

export const virtualizeImagesList = (images: Image[], width: number) => {
  const groupedByMonth: Record<string, Image[]> = {};
  images.forEach((img) => {
    const monthKey = getMonthKey(img.date_creation || "");
    if (!groupedByMonth[monthKey]) {
      groupedByMonth[monthKey] = [];
    }
    groupedByMonth[monthKey].push(img);
  });
  for (const key in groupedByMonth) {
    groupedByMonth[key].sort((a, b) =>
      a.date_creation === b.date_creation
        ? 0
        : a.date_creation == undefined
          ? 1
          : b.date_creation == undefined
            ? -1
            : a.date_creation > b.date_creation
              ? -1
              : 1,
    );
  }

  const months: string[] = Object.keys(groupedByMonth).sort().reverse();

  const groupsSortedByMonth = months.map((m) => {
    const images = groupedByMonth[m];
    const options: JustifiedLayoutOptions = {
      containerWidth: width,
      containerPadding: 0,
      boxSpacing: PHOTO_GRID_MARGIN,
      // @configurable
      targetRowHeight: 200,
    };
    const layout = justifiedLayout(
      groupedByMonth[m].map((image) => {
        if (!image.width || !image.height) {
          return 1;
        }
        const ratio = image.width / image.height;
        if (shouldSwapDimensions(image)) {
          return 1 / ratio;
        }
        return ratio;
      }),
      options,
    );
    const imageLayouts: ImageLayout[] = images.map((image, index) => {
      const imageLayout = layout.boxes[index];
      return {
        layout: imageLayout,
        image,
      };
    });

    const rows: ImageLayoutRow[] = [];

    for (const imageLayout of imageLayouts) {
      if (imageLayout.layout.left === 0) {
        rows.push({
          height: imageLayout.layout.height,
          images: [],
          boxSpacing: PHOTO_GRID_MARGIN,
        });
      }
      rows.at(-1)?.images.push(imageLayout);
    }
    return {
      header: formatMonth(m),
      images,
      layout,
      year: parseInt(m.split("-").at(0) ?? "0"),
      month: parseInt(m.split("-").at(1) ?? "0"),
      rows,
    };
  });

  return groupsSortedByMonth;
};
