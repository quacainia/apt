import {
  defaultConfig,
  isShowMoreTile,
  type CategoryGridConfig,
  type CategoryRow,
} from "../utils/virtualize-category-list";
import AlbumCard from "./AlbumCard";

export type CategoryRowProps = {
  row: CategoryRow;
  config?: Partial<CategoryGridConfig>;
  onToggleExpanded: (isExpanded: boolean) => void;
};

/**
 * CategoryRow Component
 */
export const CategoriesRow = ({
  row,
  config = {},
  onToggleExpanded,
}: CategoryRowProps) => {
  const finalConfig = { ...defaultConfig, ...config };

  const { columns } = finalConfig;
  const { items } = row;

  // Handle View All click
  const handleViewAll = () => {
    onToggleExpanded?.(true);
  };

  // Build grid items
  const gridItems = items.map((item) => {
    if (isShowMoreTile(item)) {
      return (
        <button
          key="show-more"
          onClick={handleViewAll}
          className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-900 border-2 border-dashed border-gray-300 rounded-lg p-4 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-800 dark:hover:to-gray-900 transition-colors cursor-pointer group"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-600 dark:text-gray-400 mb-2 group-hover:scale-110 transition-transform">
              +{item.hiddenCount}
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              View all {item.totalCount}
            </div>
          </div>
        </button>
      );
    }
    return <AlbumCard album={item} key={item.id} />;
  });

  // @todo: this won't work with media point breaks
  const gridColsClass =
    {
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
    }[columns] || "grid-cols-4";

  return (
    <div className="w-full">
      <div className={`grid ${gridColsClass} gap-4 w-full`}>{gridItems}</div>
    </div>
  );
};

export default CategoriesRow;
