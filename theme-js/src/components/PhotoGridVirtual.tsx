import { useEffect, useMemo, useRef, useState } from "react";
import { AutoSizer } from "react-virtualized-auto-sizer";
import {
  VariableSizeList,
  type ListChildComponentProps,
  type ListOnScrollProps,
} from "react-window";
import { type Image } from "../api/types";
import {
  calculateLayout,
  type LayoutRow,
  type LayoutRowHeader,
} from "../utils/calculate-layout";
import { formatMonth, getMonthKey } from "../utils/format";
import type { DateTimelineProps } from "./DateTimeline";
import PhotoGridItem from "./PhotoGridItem";

interface PhotoGridVirtualProps {
  images: Image[];
  onTimelineContext: (newCtx: Partial<DateTimelineProps>) => void;
}

const PHOTO_GRID_MARGIN = 6;

export default function PhotoGridVirtual({
  images,
  onTimelineContext,
}: PhotoGridVirtualProps) {
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const listRef = useRef<VariableSizeList>(null);

  // Group images by month
  const groupedByMonth: Record<string, Image[]> = useMemo(() => {
    const groups: Record<string, Image[]> = {};
    images.forEach((img) => {
      const monthKey = getMonthKey(img.date_creation || "");
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(img);
    });
    for (const key in groups) {
      groups[key].sort((a, b) =>
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
    return groups;
  }, [images]);

  const months: string[] = useMemo(() => {
    return Object.keys(groupedByMonth).sort().reverse();
  }, [groupedByMonth]);

  const groupsSortedByMonth = useMemo(
    () =>
      months.map((m) => ({
        header: m,
        images: groupedByMonth[m],
        year: parseInt(m.split("-").at(0) ?? "0"),
        month: parseInt(m.split("-").at(1) ?? "0"),
      })),
    [groupedByMonth, months],
  );

  return (
    <div className="flex gap-2 flex-grow overflow-hidden">
      <AutoSizer
        className="flex flex-row max-w-full"
        renderProp={({
          height,
          width,
        }: {
          height?: number;
          width?: number;
        }) => (
          <InnerList
            height={height}
            width={width}
            groupsSortedByMonth={groupsSortedByMonth}
            selectedImageId={selectedImageId}
            setSelectedImageId={setSelectedImageId}
            listRef={listRef}
            onTimelineContext={onTimelineContext}
          />
        )}
      />
    </div>
  );
}

function InnerList({
  height,
  width,
  groupsSortedByMonth,
  selectedImageId,
  setSelectedImageId,
  listRef,
  onTimelineContext,
}: {
  height?: number;
  width?: number;
  groupsSortedByMonth: {
    header: string;
    images: Image[];
    year: number;
    month: number;
  }[];
  selectedImageId?: number | null;
  setSelectedImageId: (id: number) => void;
  listRef: React.RefObject<VariableSizeList | null>;
  onTimelineContext: (newCtx: Partial<DateTimelineProps>) => void;
}) {
  // const [_scrollOffset, _setScrollOffset] = useState<number>(0);
  const setScrollOffset = (value: number) => {
    onTimelineContext({ scrollOffset: value });
    // _setScrollOffset(value);
  };
  const layoutGroups: LayoutRowHeader[] = useMemo(() => {
    if (width === undefined) {
      return [];
    } else {
      const groups = calculateLayout(
        groupsSortedByMonth,
        width,
        220,
        PHOTO_GRID_MARGIN,
      );
      setTimeout(() => onTimelineContext({ layoutGroups: groups }), 0);
      return groups;
    }
  }, [width, groupsSortedByMonth, onTimelineContext]);

  const layoutRows: LayoutRow[] = useMemo(() => {
    const rows = layoutGroups.flatMap((header) => [
      header,
      ...header.imageRows,
    ]);
    setTimeout(() => onTimelineContext({ layoutRows: rows }), 0);
    return rows;
  }, [layoutGroups, onTimelineContext]);

  const totalHeight = useMemo(() => {
    const tot = layoutRows.reduce((v, row) => v + row.height, 0);
    setTimeout(() => onTimelineContext({ totalHeight: tot }), 0);
    return tot;
  }, [layoutRows, onTimelineContext]);

  useEffect(() => {
    listRef.current?.resetAfterIndex(0);
  }, [layoutRows, listRef]);

  const handleScroll = ({
    scrollOffset: newScrollOffset,
    scrollUpdateWasRequested,
  }: ListOnScrollProps) => {
    if (!scrollUpdateWasRequested) setScrollOffset(newScrollOffset);
  };
  useEffect(() => {
    const setScroll = (pct: number) => {
      // Window offset is height of content minus height of viewport, since you can't scroll past the content.
      const offset = (totalHeight - (height ?? 0)) * pct;

      if (listRef.current) {
        listRef.current.scrollTo(offset);
      }
    };
    onTimelineContext({ setScroll });
  }, [height, listRef, totalHeight, onTimelineContext]);

  if (!height || !width) {
    return null;
  }

  return (
    <VariableSizeList
      ref={listRef}
      height={height}
      width={width}
      itemCount={layoutRows.length}
      itemSize={(index) => layoutRows[index].height}
      // itemData allows the Row to access state without the Row changing its reference
      itemData={{
        layoutRows: layoutRows,
        selectedImageId,
        setSelectedImageId,
      }}
      onScroll={handleScroll}
      className="no-scrollbar"
      overscanCount={5}
    >
      {Row}
    </VariableSizeList>
  );
}

// Define the Row renderer separately as well
const Row = ({
  index,
  style,
  data,
}: ListChildComponentProps<{
  layoutRows: LayoutRow[];
  selectedImageId?: number | null;
  setSelectedImageId: (id: number) => void;
}>) => {
  const { layoutRows, selectedImageId, setSelectedImageId } = data;
  const row = layoutRows[index];
  const isHeader = row.type === "HEADER";

  return (
    <div style={style} className="flex flex-col gap-1.5 pt-1.5" key={index}>
      {isHeader ? (
        <div
          className={`ml-4 mr-4 top-1.5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md transform-gpu isolate self-center rounded-full z-10`}
          key={index}
        >
          <h3 className="text-lg font-medium text-gray-900 dark:text-white py-1 px-4">
            {formatMonth(row.content || "")}
          </h3>
        </div>
      ) : (
        <div className="flex gap-1.5" key={index}>
          {row.images.map((img) => {
            return (
              <PhotoGridItem
                key={img.id}
                image={img}
                isSelected={selectedImageId === img.id}
                onSelect={() => setSelectedImageId(img.id)}
                height={(row.height as number) - PHOTO_GRID_MARGIN}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
