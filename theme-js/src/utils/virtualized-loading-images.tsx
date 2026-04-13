import justifiedLayout from "justified-layout";
import { useEffect } from "react";
import type { VirtualViewGroupConfig } from "../components/GroupedVirtualView";
import { PHOTO_GRID_MARGIN } from "../components/PhotoGridVirtual";
import { PHOTO_GROUP_HEADER_HEIGHT } from "../components/PhotoGroupHeader";
import type {
  JustifiedLayoutOptions,
  JustifiedLayoutResult,
} from "./virtualize-images-list";

export const virtualizedLoadingImages = (
  width: number,
  items: number[],
): ((
  percentageProgress: number,
) => VirtualViewGroupConfig<
  object,
  { height: number; layout: JustifiedLayoutResult; percentProgress: number },
  object
>[]) => {
  const options: JustifiedLayoutOptions = {
    containerWidth: width,
    containerPadding: 0,
    targetRowHeight: 200,
    boxSpacing: PHOTO_GRID_MARGIN,
  };
  const layout = justifiedLayout(items, options);
  const rowsHeight = Math.max(
    300,
    (layout.boxes.at(-1)?.top ?? 0) +
      (layout.boxes.at(-1)?.height ?? 0) +
      PHOTO_GRID_MARGIN * 2,
  );

  return (percentProgress: number) => [
    {
      id: "images-loading",
      header: {
        height: PHOTO_GROUP_HEADER_HEIGHT,
        Component: HeaderComponent,
        props: {},
        label: { value: "Loading..." },
      },
      rows: {
        data: [{}],
        Component: ImagesComponent,
        getTooltip: () => "Loading...",
        getRowHeight: () => rowsHeight,
        getProps: () => ({ height: rowsHeight, layout, percentProgress }),
      },
    },
  ];
};

const HeaderComponent = () => (
  <div className="flex items-center justify-center p-2">
    <div className="h-9 w-48 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse"></div>
  </div>
);

const ImagesComponent = ({
  height,
  layout,
  percentProgress,
}: {
  height: number;
  layout: JustifiedLayoutResult;
  percentProgress: number;
}) => {
  useEffect(() => {
    console.log("ImagesComponent");
  }, []);
  return (
    <div
      className="relative"
      style={{
        height,
      }}
    >
      <div className="absolute size-full z-10 flex justify-center items-center">
        <div
          className="flex flex-col gap-3 items-center h-[300px] w-[600px] justify-center"
          style={{
            background:
              "radial-gradient(ellipse,var(--gradient-color) 20%, var(--gradient-color-transparent) 60%, var(--gradient-color-transparent) 100%)",
          }}
        >
          <p className="text-xl">Loading...</p>
          <div className="h-1 w-48 bg-gray-500 rounded-full">
            <div
              className="bg-gray-800 dark:bg-gray-200 w-1 h-1 rounded-full transition-all duration-250"
              style={
                percentProgress !== 0
                  ? { width: `${Math.round(percentProgress * 100)}%` }
                  : undefined
              }
            ></div>
          </div>
        </div>
      </div>
      {layout.boxes.map((box) => (
        <div
          className="absolute bg-gray-200 dark:bg-gray-800 animate-pulse"
          style={{
            height: box.height,
            width: box.width,
            left: box.left,
            top: box.top,
          }}
        ></div>
      ))}
    </div>
  );
};
