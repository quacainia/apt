import { Diamond } from "lucide-react";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { AutoSizer } from "react-virtualized-auto-sizer";
import { bisect_left } from "../utils/bisect";
import type { LayoutRow, LayoutRowHeader } from "../utils/calculate-layout";
import { cn } from "../utils/cn";
import { formatMonth } from "../utils/format";

export interface DateTimelineProps {
  layoutGroups: LayoutRowHeader[];
  layoutRows: LayoutRow[];
  scrollOffset: number;
  setScroll: (pct: number) => void;
  totalHeight: number | undefined;
}

const TIMELINE_TOP_PADDING = 10;
const TIMELINE_BOTTOM_PADDING = 20;
const MARKER_SIZE = 8;
const MARKER_SPACE = MARKER_SIZE * 1.5;

function getMonthName(monthNumber: number) {
  const userLocale =
    navigator.languages && navigator.languages.length
      ? navigator.languages[0]
      : navigator.language;
  const date = new Date();
  date.setMonth(monthNumber - 1);

  return date.toLocaleString(userLocale, {
    month: "long",
  });
}

export default function DateTimeline({
  layoutGroups,
  layoutRows,
  scrollOffset,
  setScroll: _setScroll,
  totalHeight,
}: DateTimelineProps) {
  const awaitingUpdate = useRef<boolean>(false);
  const [mousePos, setMousePos] = useState<number | null>(null);
  const [mousePosDate, setMousePosDate] = useState<string | null>(null);

  const setScroll: DateTimelineProps["setScroll"] = (...args) => {
    awaitingUpdate.current = true;
    _setScroll(...args);
  };

  const rowsByPct = useMemo(() => {
    if (!layoutRows) {
      return [];
    }

    const sizeSum = layoutRows.reduce((total, row) => total + row.height, 0);
    const pctRows: { pct: number; row: LayoutRow }[] = [];

    let prevSum = 0;
    for (const row of layoutRows) {
      pctRows.push({ pct: prevSum / sizeSum, row });
      prevSum += row.height;
    }
    return pctRows;
  }, [layoutRows]);

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const barHeight =
      rect.bottom - rect.top - TIMELINE_BOTTOM_PADDING - TIMELINE_TOP_PADDING;
    const relativeY = e.clientY - rect.top - TIMELINE_TOP_PADDING;
    const clippedY = Math.max(Math.min(relativeY, barHeight), 0);
    const pct = clippedY / barHeight;

    setScroll(pct);
    awaitingUpdate.current = true;
  };

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    // getBoundingClientRect ensures the position is relative to the div,
    // not the entire viewport/page.
    const rect = e.currentTarget.getBoundingClientRect();
    const barHeight =
      rect.bottom - rect.top - TIMELINE_BOTTOM_PADDING - TIMELINE_TOP_PADDING;
    const relativeY = e.clientY - rect.top;
    const clippedY = Math.max(
      Math.min(relativeY, barHeight + TIMELINE_TOP_PADDING),
      TIMELINE_TOP_PADDING,
    );

    setMousePos(clippedY);
    const mPos = clippedY - TIMELINE_TOP_PADDING;

    const bisectIndex = bisect_left(
      rowsByPct,
      mPos / barHeight,
      (item) => item.pct,
    );

    const item = rowsByPct[bisectIndex];

    if (item) {
      const row = item.row;
      if (row.type === "HEADER") {
        setMousePosDate(formatMonth(row.content));
      } else {
        setMousePosDate(formatMonth(row.images[0]!.date_creation!));
      }
    } else {
      setMousePosDate(null);
    }
  };

  const handleMouseLeave: React.MouseEventHandler<HTMLDivElement> = () => {
    setMousePos(null);
  };

  const ticks = useMemo(() => {
    const ticks: {
      height: number;
      index: number;
      label: string;
      month: number;
      offset: number;
      sectionHeight: number;
      year: number;
    }[] = [];
    layoutGroups.forEach((header, index) => {
      const prevItem: LayoutRowHeader | undefined = layoutGroups[index - 1];

      // Label if it's the first item or the month changed
      if (
        !prevItem ||
        header.month !== prevItem.month ||
        header.year !== prevItem.year
      ) {
        ticks.push({
          index,
          height: header.height,
          label: `${getMonthName(header.month)} ${header.year}`,
          month: header.month,
          offset: header.offset,
          sectionHeight: header.sectionHeight,
          year: header.year,
        });
      }
    });
    ticks.reverse();
    return ticks;
  }, [layoutGroups]);

  useEffect(() => {
    if (!awaitingUpdate.current) {
      // This one is safe
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMousePos(null);
    } else {
      awaitingUpdate.current = false;
    }
  }, [scrollOffset]);

  if (!totalHeight) {
    return null;
  }

  return (
    <div
      className="relative h-full w-16 text-xs text-gray-500 z-10"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <AutoSizer
        className="flex flex-row"
        renderProp={({ height }: { height?: number; width?: number }) => {
          const scrollMarkerRatio = scrollOffset / totalHeight;
          const scrollMarkerTop =
            ((height ?? 0) - TIMELINE_TOP_PADDING - TIMELINE_BOTTOM_PADDING) *
              scrollMarkerRatio +
            TIMELINE_TOP_PADDING;

          let prevTick: (typeof ticks)[0];
          let prevTopHeight: number | undefined;

          return (
            <>
              <div
                className={cn(
                  "absolute -translate-y-1/2 h-0 w-full border-bottom-2 border border-black dark:border-gray-200 z-10",
                  mousePos !== null ? "opacity-30" : "",
                )}
                style={{ top: `${scrollMarkerTop}px` }}
              />
              {mousePos !== null && (
                <>
                  <div
                    className="absolute -translate-y-1/2 h-0 w-[60%] right-0 border-bottom-2 border border-black dark:border-gray-200  z-20"
                    style={{ top: `${mousePos}px` }}
                  />
                  <div
                    className="absolute -translate-y-1/2 whitespace-nowrap bg-white/70 dark:bg-black/70 right-[70%] px-4 py-2 rounded-full select-none text-black dark:text-gray-200 z-20"
                    style={{ top: `${mousePos}px` }}
                  >
                    {mousePosDate}
                  </div>
                </>
              )}
              {ticks.map((tick, idx) => {
                const topRatio =
                  (tick.offset + tick.sectionHeight) / totalHeight;
                const topHeight =
                  ((height ?? 0) -
                    TIMELINE_TOP_PADDING -
                    TIMELINE_BOTTOM_PADDING) *
                    topRatio +
                  TIMELINE_TOP_PADDING;
                const isNewYear = prevTick?.year !== tick.year;
                const nextNewYear = ticks
                  .slice(idx)
                  .find((t) => t.year !== tick.year);

                if (
                  !isNewYear &&
                  prevTopHeight &&
                  prevTopHeight - topHeight < MARKER_SPACE
                ) {
                  prevTick = tick;
                  return null;
                }

                if (nextNewYear) {
                  const nextTopRatio = nextNewYear.offset / totalHeight;
                  const nextTopHeight =
                    ((height ?? 0) -
                      TIMELINE_TOP_PADDING -
                      TIMELINE_BOTTOM_PADDING) *
                      nextTopRatio +
                    TIMELINE_TOP_PADDING;
                  if (topHeight - nextTopHeight < MARKER_SPACE) {
                    return null;
                  }
                }

                const tickUi = (
                  <Fragment key={tick.index}>
                    <div
                      className="absolute right-2 flex items-center gap-2 -translate-y-1/2 z-10"
                      style={{ top: `${topHeight}px` }}
                    >
                      {isNewYear ? (
                        tick.year
                      ) : (
                        <Diamond size={MARKER_SIZE} className="fill-gray-500" />
                      )}
                    </div>
                    {isNewYear ? (
                      <div
                        className="absolute right-2 flex items-center gap-2 -translate-y-1/2 z-0 bg-white/90 dark:bg-gray-900 rounded-full w-10 h-7"
                        style={{ top: `${topHeight}px` }}
                      ></div>
                    ) : null}
                  </Fragment>
                );
                prevTick = tick;
                prevTopHeight = topHeight;
                return tickUi;
              })}
            </>
          );
        }}
      ></AutoSizer>
    </div>
  );
}
