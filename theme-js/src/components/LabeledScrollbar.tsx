import type { VirtualViewGroupConfig } from "./GroupedVirtualView";

import { Diamond } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AutoSizer } from "react-virtualized-auto-sizer";
import { bisect_left } from "../utils/bisect";
import { cn } from "../utils/cn";

export interface LabeledScrollbarProps<
  THeader extends object = object,
  TRowProps extends object = object,
  TRowData extends object = object,
> {
  // We use your config type to derive the positions
  groups: VirtualViewGroupConfig<THeader, TRowProps, TRowData>[];
  scrollOffset: number;
  onChangeScrollPercent: (pct: number) => void;
  viewportHeight: number;
}

type RowByPct<
  THeader extends object = object,
  TRowProps extends object = object,
  TRowData extends object = object,
> = {
  pct: number;
  group: VirtualViewGroupConfig<THeader, TRowProps, TRowData>;
} & (
  | {
      type: "row";
      index: number;
      data: TRowData;
    }
  | { type: "header" }
);

interface Tick {
  id: string;
  offset: number;
  label: string;
  isPrimary: boolean | undefined;
  height: number;
}

const SCROLLBAR_TOP_PADDING = 10;
const SCROLLBAR_BOTTOM_PADDING = 20;
const MARKER_SIZE = 8;
const MARKER_SPACE = MARKER_SIZE * 2.5; // Slightly more breathing room

export default function LabeledScrollbar<
  THeader extends object = object,
  TRowProps extends object = object,
  TRowData extends object = object,
>({
  groups,
  scrollOffset,
  onChangeScrollPercent,
  viewportHeight,
}: LabeledScrollbarProps<THeader, TRowProps, TRowData>) {
  const awaitingUpdate = useRef<boolean>(false);
  const [mousePos, setMousePos] = useState<number | null>(null);
  const [hoverLabel, setHoverLabel] = useState<string | null>(null);

  const totalHeight = useMemo(() => {
    return groups.reduce((value, group) => {
      return (
        value +
        group.header.height +
        group.rows.data.reduce(
          (v, row, index) => v + group.rows.getRowHeight(row, index),
          0,
        )
      );
    }, 0);
  }, [groups]);

  // 1. Calculate cumulative offsets for every row to enable bisection (hover lookup)
  const rowsByPct = useMemo(() => {
    if (!totalHeight) return [];
    const result: RowByPct<THeader, TRowProps, TRowData>[] = [];
    let currentOffset = 0;

    groups.forEach((group) => {
      // Account for header height
      currentOffset += group.header.height;
      result.push({
        type: "header",
        pct: currentOffset / totalHeight,
        group,
      });

      group.rows.data.forEach((row, idx) => {
        currentOffset += group.rows.getRowHeight(row, idx);
        result.push({
          type: "row",
          pct: currentOffset / totalHeight,
          group,
          index: idx,
          data: row,
        });
      });
    });
    return result;
  }, [groups, totalHeight]);

  // 2. Calculate "Ticks" (the visual markers on the bar)
  const ticks = useMemo(() => {
    // eslint didn't like a normal variable for some reason
    const value = { currentOffset: 0 };
    const ticks = groups.map((group) => {
      const labelData = group.header.label;
      const groupHeight =
        group.header.height +
        group.rows.data.reduce(
          (sum, r, i) => sum + group.rows.getRowHeight(r, i),
          0,
        );

      const tick = {
        id: group.id,
        offset: value.currentOffset,
        label: labelData.value,
        isPrimary: labelData.isPrimary,
        height: groupHeight,
      };

      value.currentOffset += groupHeight;
      return tick;
    });
    return ticks;
  }, [groups]);

  const setScroll = (pct: number) => {
    awaitingUpdate.current = true;
    onChangeScrollPercent(pct);
  };

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const trackHeight =
      rect.height - SCROLLBAR_BOTTOM_PADDING - SCROLLBAR_TOP_PADDING;
    const relativeY = e.clientY - rect.top;
    const clippedY = Math.max(
      Math.min(relativeY, rect.height - SCROLLBAR_BOTTOM_PADDING),
      SCROLLBAR_TOP_PADDING,
    );

    setMousePos(clippedY);

    const scrollPct = (clippedY - SCROLLBAR_TOP_PADDING) / trackHeight;
    const bisectIndex = bisect_left(rowsByPct, scrollPct, (item) => item.pct);
    const item = rowsByPct[bisectIndex];

    if (item) {
      if (item.type === "header") {
        setHoverLabel(item.group.header.label.value);
      } else {
        setHoverLabel(
          item.group.rows.getTooltip({
            row: item.data,
            group: item.group,
            index: item.index,
          }),
        );
      }
    }
  };

  // Set line for scoll position
  useEffect(() => {
    // Don't get caught in a loop if the user clicks the position
    if (!awaitingUpdate.current) {
      // This one is safe
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMousePos(null);
    } else {
      awaitingUpdate.current = false;
    }
  }, [scrollOffset]);

  if (!totalHeight || totalHeight <= 0) return null;

  return (
    <div
      className="relative h-full w-16 text-xs text-gray-500 z-10 cursor-ns-resize select-none overflow-visible"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos(null)}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const pct =
          (e.clientY - rect.top - SCROLLBAR_TOP_PADDING) /
          (rect.height - SCROLLBAR_TOP_PADDING - SCROLLBAR_BOTTOM_PADDING);
        setScroll(Math.max(0, Math.min(1, pct)));
      }}
    >
      <AutoSizer
        renderProp={({ height }) => {
          if (!height) return null;
          const trackHeight =
            height - SCROLLBAR_TOP_PADDING - SCROLLBAR_BOTTOM_PADDING;
          const scrollMarkerTop =
            (scrollOffset / (totalHeight - viewportHeight)) * trackHeight +
            SCROLLBAR_TOP_PADDING;

          return (
            <>
              {/* The Actual Scroll Position Indicator */}
              <div
                className={cn(
                  "absolute right-0 h-[2px] w-full bg-black dark:bg-white transition-opacity",
                  mousePos !== null ? "opacity-20" : "opacity-100",
                )}
                style={{ top: `${scrollMarkerTop}px` }}
              />

              {/* Hover Indicator & Tooltip */}
              {mousePos !== null && (
                <>
                  <div
                    className="absolute right-0 h-[1px] w-8 bg-blue-500 z-20"
                    style={{ top: `${mousePos}px` }}
                  />
                  <div
                    className="absolute right-10 -translate-y-1/2 whitespace-nowrap bg-gray-800 text-white px-3 py-1.5 rounded shadow-lg text-sm z-30"
                    style={{ top: `${Math.max(16, mousePos)}px` }}
                  >
                    {hoverLabel}
                  </div>
                </>
              )}

              <ScrollbarTicks
                ticks={ticks}
                totalHeight={totalHeight}
                trackHeight={trackHeight}
              />
            </>
          );
        }}
      />
    </div>
  );
}

type TickWithMeta = { tick: Tick; top: number; shouldShow: boolean };

const ScrollbarTicks = ({
  // Ticks sorted in order from top to bottom
  ticks,
  totalHeight,
  trackHeight,
}: {
  ticks: Tick[];
  totalHeight: number;
  trackHeight: number;
}) => {
  // Memoize position on screen and whether to show tick
  const ticksWithTopOffset: TickWithMeta[] = useMemo(() => {
    let lastPrimaryTick: TickWithMeta | undefined;
    const ticksWithMeta: TickWithMeta[] = [];

    /**
     * First check if there's primaries that overlap.
     * If so, choose the one closer to the top.
     */
    for (const tick of ticks) {
      let shouldShow = false;
      const top =
        (tick.offset / totalHeight) * trackHeight + SCROLLBAR_TOP_PADDING;

      // Show if first primary or if gap is large enough
      if (
        tick.isPrimary &&
        (lastPrimaryTick === undefined ||
          top - lastPrimaryTick.top > MARKER_SPACE)
      ) {
        shouldShow = true;
      }
      const newTick: TickWithMeta = {
        tick,
        top,
        shouldShow,
      };

      if (shouldShow) {
        lastPrimaryTick = newTick;
      }
      ticksWithMeta.push(newTick);
    }

    /**
     * Next for the secondary ticks, show them only if they fit in the gaps left
     * by the primary ticks, AND they're not too close to existing ticks.
     */
    let lastSecondaryTick: TickWithMeta | undefined;
    const primaries = ticksWithMeta.filter((t) => t.tick.isPrimary);
    for (const tickWithMeta of ticksWithMeta) {
      let shouldShow = false;
      if (tickWithMeta.tick.isPrimary) {
        continue;
      }
      if (
        lastSecondaryTick === undefined ||
        (tickWithMeta.top - lastSecondaryTick.top > MARKER_SPACE &&
          primaries.filter(
            (t) =>
              t.top > tickWithMeta.top - MARKER_SPACE &&
              t.top < tickWithMeta.top + MARKER_SPACE,
          ).length === 0)
      ) {
        shouldShow = true;
      }
      tickWithMeta.shouldShow = shouldShow;

      if (tickWithMeta.shouldShow) {
        lastSecondaryTick = tickWithMeta;
      }
    }

    return ticksWithMeta;
  }, [ticks, totalHeight, trackHeight]);
  // let previousTick: TickWithMeta | undefined;

  return ticksWithTopOffset.map((tickWithTop) => {
    const { tick, top, shouldShow } = tickWithTop;

    if (!shouldShow) {
      return null;
    }

    return (
      <div
        key={tick.id}
        className="absolute right-2 flex items-center gap-2 -translate-y-1/2"
        style={{ top: `${top}px` }}
      >
        {tick.isPrimary ? (
          <span className="text-black dark:text-gray-200 bg-white/80 dark:bg-black/50 px-1 rounded whitespace-nowrap">
            {tick.label}
          </span>
        ) : (
          <Diamond size={MARKER_SIZE} className="fill-gray-400 text-gray-400" />
        )}
      </div>
    );
  });
};
