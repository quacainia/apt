import { useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useEffect, useMemo, useRef } from "react";

export type RowWithIndex<T extends object = object> = {
  index: number;
  height: number;
  data: T;
};

export interface VirtualViewGroupConfig<
  THeaderProps extends object = object,
  TRowProps extends object = object,
  TRowData extends object = object,
> {
  id: string;
  header: {
    height: number;
    component: React.ComponentType<THeaderProps>;
    props: THeaderProps;
    sticky?: boolean;
  };
  rows: {
    data: TRowData[]; // The raw data
    getRowHeight: (row: TRowData, index: number) => number;
    component: React.ComponentType<TRowProps>;
    getProps: (row: RowWithIndex<TRowData>) => TRowProps;
  };
}

// The "Source of Truth" for rendering
export type DisplayItem =
  | {
      type: "sticky-header" | "header";
      id: string;
      start: number;
      height: number; // Total group height (track)
      group: VirtualViewGroupConfig;
    }
  | {
      type: "row";
      id: string | number | bigint;
      start: number;
      height: number;
      data: RowWithIndex;
      group: VirtualViewGroupConfig;
    };

type GroupMetadata = {
  start: number;
  height: number;
  group: VirtualViewGroupConfig;
};

type FlatListItem = {
  height: number;
  groupIndex: number;
} & (
  | {
      type: "header";
    }
  | {
      type: "row";
      rowData: RowWithIndex;
    }
);

type OnScrollUpdateProps = {
  // Pixel scroll offset from the top of the view
  scrollOffset: number | null;
  // Height of the wrapper scrolling view
  viewportHeight: number;
  // Height of the content within the scrolling view
  totalHeight: number;
  // Group which is currently at the top of the view
  activeGroupIndex: number;
};

export const GroupedVirtualView = ({
  enabled = true,
  groups,
  onScrollUpdate,
  onWidthUpdate,
}: {
  enabled?: boolean;
  groups: VirtualViewGroupConfig[];
  onScrollUpdate?: (values: OnScrollUpdateProps) => void;
  onWidthUpdate?: (width: number) => void;
}) => {
  const parentRef = useRef<HTMLDivElement>(null);

  /**
   * Measure and emit the width of the internal container so that the parent
   * can properly compute the rows in each group.
   */
  const measureRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;

      const observer = new ResizeObserver((entries) => {
        const width = entries[0].contentRect.width;
        // Use Math.round to avoid sub-pixel jitter triggering re-renders
        onWidthUpdate?.(Math.round(width));
      });

      onWidthUpdate?.(Math.round(node.clientWidth));

      observer.observe(node);
      // Cleanup: Some modern browsers handle this, but it's good practice
      return () => observer.disconnect();
    },
    [onWidthUpdate],
  );

  /**
   * Massage the data for:
   * - `flatItems` a list of *all* the virtualized sections, including both
   *   headers and rows.
   * - `groupMetadata` reference for height and offset (`start`) values for the
   *   entirety of each group, plus the group data.
   */
  const { flatItems, groupMetadata } = useMemo(() => {
    const flat: Array<FlatListItem> = [];

    const meta: Array<GroupMetadata> = [];
    let currentOffset = 0;

    groups.forEach((group, groupIndex) => {
      const groupStart = currentOffset;

      // 1. Push Header
      flat.push({ type: "header", height: group.header.height, groupIndex });
      currentOffset += group.header.height;

      // 2. Push Rows
      group.rows.data.forEach((data, index) => {
        const height = group.rows.getRowHeight(data, index);
        flat.push({
          type: "row",
          height,
          groupIndex,
          rowData: { data, index, height },
        });
        currentOffset += height;
      });

      meta.push({
        start: groupStart,
        height: currentOffset - groupStart,
        group,
      });
    });

    return { flatItems: flat, groupMetadata: meta, totalHeight: currentOffset };
  }, [groups]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: flatItems.length,
    enabled,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      return flatItems[index].height;
    },
    overscan: 5,
    onChange: (instance) => {
      const firstItem = instance.getVirtualItems()[0];
      const activeGroupIndex = firstItem
        ? flatItems[firstItem.index].groupIndex
        : 0;

      onScrollUpdate?.({
        scrollOffset: instance.scrollOffset,
        viewportHeight: parentRef.current?.offsetHeight || 0,
        totalHeight: instance.getTotalSize(),
        activeGroupIndex,
      });
    },
  });

  useEffect(() => rowVirtualizer.measure(), [groups, rowVirtualizer]);

  const virtualRows = rowVirtualizer.getVirtualItems();

  /**
   * For displaying sticky group headers we need to know all of the groups
   * that have at least one item currently in view and displayed by the
   * virtualizer. We'll display all those headers separately.
   */
  const visibleGroupIndices = useMemo(() => {
    const indices = new Set<number>();

    virtualRows.forEach((vRow) => {
      const item = flatItems[vRow.index];
      indices.add(item.groupIndex);
    });

    return Array.from(indices);
  }, [virtualRows, flatItems]);

  /**
   * In order to make the headers sticky we display them separately, but in
   * order to have selections work properly with the mouse we want them rendered
   * in the correct order.
   *
   * `interleavedDisplayItems` has the items in the proper order so that
   * highlighting and keyboard navigation work correctly.
   */
  const interleavedDisplayItems = useMemo((): DisplayItem[] => {
    const items: (undefined | DisplayItem)[] = [
      // Add the Group Tracks (Sticky Headers)
      ...visibleGroupIndices.map((gIdx): DisplayItem | undefined => {
        const meta = groupMetadata[gIdx];
        if (meta.group.header.sticky) {
          return {
            type: "sticky-header",
            id: `group-${gIdx}`,
            start: meta.start,
            height: meta.height,
            group: meta.group,
          };
        }
        return undefined;
      }),

      // Add the Virtualized Rows
      ...virtualRows.map((vRow): DisplayItem | undefined => {
        const flatItem = flatItems[vRow.index];
        if (flatItem.type === "header") {
          const groupMeta = groupMetadata[flatItem.groupIndex];
          if (groupMeta.group.header.sticky) {
            return;
          }
          return {
            type: "header",
            id: `group-${flatItem.groupIndex}`,
            start: groupMeta.start,
            height: flatItem.height,
            group: groupMeta.group,
          };
        }

        return {
          type: "row",
          id: vRow.key,
          start: vRow.start,
          height: vRow.size,
          data: flatItem.rowData,
          group: groupMetadata[flatItem.groupIndex].group,
        };
      }),
    ];

    // Sort by vertical position so the DOM order matches the visual order
    return items
      .filter((item) => item !== undefined)
      .sort((a, b) => a.start - b.start);
  }, [visibleGroupIndices, groupMetadata, virtualRows, flatItems]);

  return (
    <div
      ref={parentRef}
      className="flex justify-center h-full w-full overflow-auto"
    >
      <div
        className="max-w-7xl w-full px-4 sm:px-6 lg:px-8"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
        }}
      >
        <div ref={measureRef} className="relative size-full">
          {interleavedDisplayItems.map((item) => {
            // Regular row
            if (item.type === "row") {
              return (
                <div
                  key={item.id}
                  className="absolute top-0 left-0 w-full"
                  style={{
                    transform: `translateY(${item.start}px)`,
                    height: `${item.height}px`,
                    zIndex: 1,
                  }}
                >
                  {/* <div className="py-2">{JSON.stringify(item.data)}</div> */}

                  <item.group.rows.component
                    {...item.group.rows.getProps(item.data)}
                  />
                </div>
              );
            }

            // Sticky header
            if (item.type === "sticky-header") {
              return (
                <div
                  key={item.id}
                  className="absolute left-0 w-full pointer-events-none select-none"
                  style={{
                    top: item.start,
                    height: item.height,
                    zIndex: 20,
                  }}
                >
                  <div className="sticky top-0 w-full pointer-events-auto select-text">
                    <item.group.header.component {...item.group.header.props} />
                  </div>
                </div>
              );
            }

            // Non-sticky header
            return (
              <div
                key={item.id}
                className="absolute top-0 left-0 w-full"
                style={{
                  transform: `translateY(${item.start}px)`,
                  height: `${item.height}px`,
                  zIndex: 1,
                }}
              >
                <item.group.header.component {...item.group.header.props} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
