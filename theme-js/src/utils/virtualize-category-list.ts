import type { Category } from "../api/types";

/**
 * Configuration object for CategoryGrid behavior
 *
 * @configurable
 */
export interface CategoryGridConfig {
  // Number of rows of categories to show before "View All"
  rows: number;
  // Number of columns in grid
  columns: number;
  // Show a "View All" tile as the last item in grid
  showFinalTile: boolean;
  // Show "View All" link next to the header
  showHeaderLink: boolean;
  // Show expandable caret in header
  showCaretExpand: boolean;
  // If true, expands inline; if false, navigates (you'd handle this)
  expandInline: boolean;
  // Header text
  headerText: string;
  // grid gap
  gap: number;
  // gap between header and content
  headerBottomPad: number;
}
export const defaultConfig: CategoryGridConfig = {
  rows: 2,
  columns: 4,
  showFinalTile: true,
  showHeaderLink: true,
  showCaretExpand: true,
  expandInline: true,
  headerText: "Albums",
  gap: 16,
  headerBottomPad: 8,
};

/**
 * Types for the structured output
 */
export interface CategoryRow {
  id: string;
  items: (Category | ShowMoreTile)[];
  height: number;
}

interface ShowMoreTile {
  type: "view-all-tile";
  hiddenCount: number;
  totalCount: number;
}

export const isShowMoreTile = (v: Category | ShowMoreTile): v is ShowMoreTile =>
  (v as ShowMoreTile).type === "view-all-tile";

export interface CategoryGridData {
  metadata: {
    totalCount: number;
    hiddenCount: number;
    isExpanded: boolean;
    headerText: string;
    expandable: boolean;
  };
  config: {
    columns: number;
    gridColsClass: string;
  };
  rows: CategoryRow[];
}

/**
 * Logic-only function to prepare data for virtualization
 */
export const virtualizeCategoryList = (
  categories: Category[] = [],
  isExpanded: boolean,
  width: number,
  configOverrides: Partial<CategoryGridConfig> = {},
): CategoryGridData => {
  const finalConfig = { ...defaultConfig, ...configOverrides };
  const {
    rows: maxRows,
    columns,
    showFinalTile,
    headerText,
    gap,
  } = finalConfig;

  // 1. Determine which categories are actually visible
  const maxVisible = maxRows * columns;
  const expandable = categories.length > maxVisible;
  const shouldTruncate = !isExpanded && expandable;

  // Calculate how many items to actually slice
  // If showing a "View All" tile, we take up one slot
  const sliceCount = shouldTruncate
    ? showFinalTile
      ? maxVisible - 1
      : maxVisible
    : categories.length;

  const visibleCategories = categories.slice(0, sliceCount);
  const hiddenCount = categories.length - visibleCategories.length;

  // 2. Prepare the items array (Categories + Optional Tile)
  const allItems: CategoryRow["items"] = [...visibleCategories];
  if (shouldTruncate && showFinalTile) {
    allItems.push({
      type: "view-all-tile",
      hiddenCount,
      totalCount: allItems.length,
    });
  }

  // 3. Chunk items into rows for virtualization
  const chunkedRows: CategoryRow[] = [];
  const rowHeight = (width - gap * (columns - 1)) / columns + gap;

  for (let i = 0; i < allItems.length; i += columns) {
    const rowItems = allItems.slice(i, i + columns);
    chunkedRows.push({
      id: `row-${i}`,
      items: rowItems,
      height: rowHeight,
    });
  }

  return {
    metadata: {
      totalCount: categories.length,
      hiddenCount,
      isExpanded,
      headerText,
      expandable,
    },
    config: {
      columns,
      gridColsClass: `grid-cols-${columns}`,
    },
    rows: chunkedRows,
  };
};
