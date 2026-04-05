import { Ellipsis, Home } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useCategoriesList } from "../api/hooks";
import type { LayoutRow, LayoutRowHeader } from "../utils/calculate-layout";
import AlbumGrid from "./AlbumGrid";
import DateTimeline, { type DateTimelineProps } from "./DateTimeline";
import { Link } from "./Link";
import { LoadingSpinner } from "./LoadingSpinner";
import PhotoGridContainer from "./PhotoGridContainer";
import { StandardErrorMessage } from "./StandardErrorMessage";

export default function CategoryView({
  categoryId: categoryId,
}: {
  categoryId: number | string | null | undefined;
}) {
  const categoryIdNumber =
    typeof categoryId === "number" ? categoryId : parseInt(categoryId ?? "");
  const [layoutGroups, setLayoutGroups] = useState<LayoutRowHeader[]>([]);
  const [layoutRows, setLayoutRows] = useState<LayoutRow[]>([]);
  const [scrollOffset, setScrollOffset] = useState<number>(0);
  const [handleSetScroll, setHandleSetScroll] = useState<
    (pct: number) => void | null
  >(() => {});
  const [totalHeight, setTotalHeight] = useState<number | undefined>(undefined);

  const {
    data: categoryData,
    isLoading: categoryLoading,
    error: categoryError,
  } = useCategoriesList({
    cat_id: isNaN(categoryIdNumber) ? undefined : categoryIdNumber,
  });

  const category =
    categoryData?.stat === "ok" ? categoryData.result?.categories?.at(0) : null;
  const subCategories =
    categoryData?.stat === "ok"
      ? categoryIdNumber === 0
        ? (categoryData.result?.categories ?? [])
        : (categoryData.result?.categories?.slice(1) ?? [])
      : [];

  const { data: uppercatData } = useCategoriesList({
    cat_id: category?.id_uppercat ? category.id_uppercat : undefined,
    limit: 1,
  });
  const uppercat =
    uppercatData?.stat === "ok" ? uppercatData.result?.categories?.at(0) : null;

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

  const { showImages, showSubCategories } = useMemo((): {
    showImages: boolean;
    showSubCategories: boolean;
  } => {
    if (categoryIdNumber === 0) {
      return { showImages: false, showSubCategories: true };
    }
    if (category?.nb_categories === 0 && (category?.nb_images ?? 0) > 0) {
      return { showImages: true, showSubCategories: false };
    }
    if (category?.nb_images === 0 && (category?.nb_categories ?? 0) > 0) {
      return { showImages: false, showSubCategories: true };
    }
    return { showImages: false, showSubCategories: false };
  }, [categoryIdNumber, category]);

  if (categoryError) {
    return <StandardErrorMessage error={categoryError} />;
  }

  if (categoryLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="relative w-full flex-grow overflow-hidden">
      <div className="size-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col overflow-hidden">
        {categoryIdNumber !== 0 && (
          <div className="flex flex-row gap-2 md:gap-4 mt-2 items-center">
            <Link
              // @todo fix breadcrumbs
              to={{ type: "home" }}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium"
            >
              <Home />
            </Link>
            <div>/</div>
            {category?.id_uppercat && (
              <>
                {!uppercat ||
                  (uppercat.id_uppercat && (
                    <>
                      <div>
                        <Ellipsis />
                      </div>
                      <div>/</div>
                    </>
                  ))}
                <Link
                  // @todo fix breadcrumbs
                  to={{ type: "category", id: category.id_uppercat }}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium text-lg"
                >
                  {uppercat?.name || <Ellipsis />}
                </Link>
                <div>/</div>
              </>
            )}
            <div className="text-lg">{category?.name}</div>
          </div>
        )}

        <div className="flex flex-row flex-grow relative overflow-hidden py-2">
          {showSubCategories && <AlbumGrid categories={subCategories} />}
          {showImages && (
            <PhotoGridContainer
              onTimelineContext={handleTimelineContext}
              categoryId={category!.id}
            />
          )}
          {!showSubCategories && !showImages && (
            <div className="flex flex-row gap-6 flex-grow h-full">
              <div className="flex-1 relative h-full overflow-hidden">
                <PhotoGridContainer
                  onTimelineContext={handleTimelineContext}
                  categoryId={category!.id}
                />
              </div>
              <div className="flex-1 h-full">
                <AlbumGrid categories={subCategories} />
              </div>
            </div>
          )}
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
