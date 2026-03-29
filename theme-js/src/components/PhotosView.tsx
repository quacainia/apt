import { useCallback, useState } from "react";
import { useAppStore, type AppState } from "../store/useAppStore";
import type { LayoutRow, LayoutRowHeader } from "../utils/calculate-layout";
import { navigateTo } from "../utils/query";
import DateTimeline, { type DateTimelineProps } from "./DateTimeline";
import PhotoGridContainer from "./PhotoGridContainer";

export default function PhotosView() {
  const [layoutGroups, setLayoutGroups] = useState<LayoutRowHeader[]>([]);
  const [layoutRows, setLayoutRows] = useState<LayoutRow[]>([]);
  const [scrollOffset, setScrollOffset] = useState<number>(0);
  const [handleSetScroll, setHandleSetScroll] = useState<
    (pct: number) => void | null
  >(() => {});
  const [totalHeight, setTotalHeight] = useState<number>(0);

  const setCurrentView = useAppStore((s: AppState) => s.setCurrentView);

  const handleBackToAlbums = () => {
    setCurrentView("albums");
    navigateTo({ view: "albums", album: null });
  };

  // This NEEDS to be memoized so it doesn't cause rerender loops
  const handleTimelineContext = useCallback(
    (ctx: Partial<DateTimelineProps>) => {
      setLayoutGroups((value) => ctx.layoutGroups ?? value);
      setLayoutRows((value) => ctx.layoutRows ?? value);
      setScrollOffset((value) => ctx.scrollOffset ?? value);
      setHandleSetScroll(
        (value: (pct: number) => void | null) => ctx.setScroll ?? value,
      );
      setTotalHeight((value) => ctx.totalHeight ?? value);
    },
    [],
  );

  return (
    <div className="relative w-full flex-grow overflow-hidden">
      <div className="size-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col overflow-hidden ">
        <div className="mt-2">
          <button
            onClick={handleBackToAlbums}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium"
          >
            ← Back to Albums
          </button>
        </div>

        <div className="flex flex-row flex-grow relative overflow-hidden">
          <PhotoGridContainer onTimelineContext={handleTimelineContext} />
        </div>
      </div>
      <div className="absolute top-0 right-0 lg:block w-16 h-full">
        <DateTimeline
          layoutGroups={layoutGroups}
          layoutRows={layoutRows}
          scrollOffset={scrollOffset}
          setScroll={handleSetScroll}
          totalHeight={totalHeight}
        />
      </div>
    </div>
  );
}
