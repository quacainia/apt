import { ChevronDown, ChevronRight } from "lucide-react";
import {
  defaultConfig,
  type CategoryGridConfig,
} from "../utils/virtualize-category-list";

export type CategoryHeaderProps = {
  config?: Partial<CategoryGridConfig>;
  expandable?: boolean;
  isExpanded?: boolean;
  onToggleExpanded?: (isExpanded: boolean) => void;
  totalCategories: number;
};

export const CATEGORY_HEADER_HEIGHT = 36;

/**
 * CategoryHeader Component
 */
export const CategoriesHeader = ({
  config = {},
  expandable = true,
  isExpanded,
  onToggleExpanded,
  totalCategories,
}: CategoryHeaderProps) => {
  const finalConfig = { ...defaultConfig, ...config };

  const { showHeaderLink, showCaretExpand, expandInline, headerText } =
    finalConfig;

  // Handle View All click
  const handleViewAll = () => {
    onToggleExpanded?.(true);
  };

  const title = (
    <h2 className="text-xl">
      {headerText} ({totalCategories})
    </h2>
  );

  return (
    <div
      className="flex w-full items-center justify-between bg-white dark:bg-gray-900"
      style={{ height: CATEGORY_HEADER_HEIGHT }}
    >
      {expandable ? (
        <button
          onClick={() => onToggleExpanded?.(!isExpanded)}
          className="py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          aria-label={isExpanded ? "Collapse albums" : "Expand albums"}
        >
          <div className="flex items-center gap-3">
            {showCaretExpand &&
              expandInline &&
              (isExpanded ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              ))}
            {title}
          </div>
        </button>
      ) : (
        <div className="py-1 px-2">{title}</div>
      )}
      {expandable && showHeaderLink && !isExpanded && (
        <button
          onClick={handleViewAll}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm underline transition-colors"
        >
          View all {totalCategories} →
        </button>
      )}
    </div>
  );
};

export default CategoriesHeader;
