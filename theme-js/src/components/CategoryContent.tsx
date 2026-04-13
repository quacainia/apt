import { useMemo, useRef, useState } from "react";
import { useCategoriesImages } from "../api/hooks";
import type { Category, Image } from "../api/types";
import { cn } from "../utils/cn";
import {
  virtualizeCategoryList,
  type CategoryGridData,
  type CategoryRow,
} from "../utils/virtualize-category-list";
import {
  virtualizeImagesList,
  type ImageLayoutRow,
} from "../utils/virtualize-images-list";
import { virtualizedLoadingImages } from "../utils/virtualized-loading-images";
import CategoriesHeader, {
  CATEGORY_HEADER_HEIGHT,
  type CategoryHeaderProps,
} from "./CategoriesHeader";
import CategoriesRow, { type CategoryRowProps } from "./CategoriesRow";
import { CategoryBreadcrumbs } from "./CategoryBreadcrumbs";
import {
  GroupedVirtualView,
  type GroupedVirtualViewHandle,
  type OnScrollUpdateProps,
  type RowWithIndex,
  type VirtualViewGroupConfig,
} from "./GroupedVirtualView";
import { horizontalRuleGroup } from "./HorizontalRule";
import LabeledScrollbar from "./LabeledScrollbar";
import {
  PHOTO_GROUP_HEADER_HEIGHT,
  PhotoGroupHeader,
  type PhotoGroupHeaderProps,
} from "./PhotoGroupHeader";
import {
  PhotoJustifiedRow,
  type PhotoJustifiedRowProps,
} from "./PhotoJustifiedRow";

export const CategoryContent = ({
  category,
  subCategories,
}: {
  category: Category;
  subCategories: Category[];
}) => {
  const groupedVirtualViewRef = useRef<GroupedVirtualViewHandle>(null);
  const [percentProgress, setPercentProgress] = useState<number>(0);
  const [scrollValues, setScrollValues] = useState<
    OnScrollUpdateProps | undefined
  >(undefined);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [virtualizerWidth, setVirtualizerWidth] = useState<number>(0);
  const [showImages, setShowImages] = useState<boolean>(category.id !== 0);

  // Query Images for the category, recursively to get all
  const {
    data: imagesData,
    isLoading: imagesLoading,
    error: imagesError,
  } = useCategoriesImages(
    showImages && category.nb_images > 0 ? category.id : undefined,
    {
      all: true,
      order: "date_available",
      image_fields: [
        "date_creation",
        "height",
        "width",
        "name",
        "rating_score",
        "rotation",
      ],
      derivatives: ["medium"],
    },
    setPercentProgress,
  );

  // Ease of use so we don't have to continuously check if result is 'ok'
  const images: Image[] | null = useMemo(
    () =>
      imagesData?.stat === "ok" ? (imagesData?.result?.images ?? null) : null,
    [imagesData],
  );

  /**
   * Generate the section of the page with the sub-Categories
   */
  const categoriesViewGroup: VirtualViewGroupConfig<
    CategoryHeaderProps,
    CategoryRowProps,
    CategoryRow
  > | null = useMemo(() => {
    if (subCategories.length === 0) {
      return null;
    }
    // Convert subcategories into a grid
    const categoryGridData: CategoryGridData = virtualizeCategoryList(
      subCategories,
      isExpanded,
      virtualizerWidth,
      {
        gap: 0,
        rows: showImages === false ? Number.MAX_VALUE : undefined,
      },
    );

    // Mostly static header props
    const headerProps: CategoryHeaderProps = {
      totalCategories: subCategories.length,
      isExpanded,
      expandable: categoryGridData.metadata.expandable,
      onToggleExpanded: setIsExpanded,
    };

    // Massage data into VirtualViewGroupConfig
    const categoriesConfig: VirtualViewGroupConfig<
      CategoryHeaderProps,
      CategoryRowProps,
      CategoryRow
    > = {
      id: "categories",
      header: {
        height: CATEGORY_HEADER_HEIGHT,
        Component: CategoriesHeader,
        label: { value: "Albums", isPrimary: true },
        props: headerProps,
        sticky: true,
      },
      rows: {
        data: categoryGridData.rows,
        getTooltip: () => "Albums",
        getRowHeight: (rowData) => {
          return rowData.height;
        },
        getProps: (rowItem) => {
          const row = categoryGridData.rows[rowItem.index];

          return {
            row,
            onToggleExpanded: setIsExpanded,
          };
        },
        Component: CategoriesRow,
      },
    };
    return categoriesConfig;
  }, [subCategories, isExpanded, showImages, virtualizerWidth]);

  const loadingRandomOrder = useMemo(() => {
    return (
      Array(13)
        .fill(1)
        // eslint-disable-next-line react-hooks/purity
        .map(() => (Math.random() > 0.5 ? 0.8 : 1.25))
    );
  }, []);

  /**
   * Generate the sections of the page for each month of the images.
   *
   * @todo - make the grouping better. Sometimes day or year is better,
   *         sometimes it'd be better to search for clusters in a day.
   */
  const imagesViewGroups = useMemo(() => {
    if (images == null) {
      if (imagesLoading) {
        return virtualizedLoadingImages(
          virtualizerWidth,
          loadingRandomOrder,
        )(percentProgress);
      } else {
        return [];
      }
    }

    // Break into monthly groups
    const groups = virtualizeImagesList(images, virtualizerWidth);

    // Massage into VirtualViewGroupConfigs
    return groups.map(
      (
        group,
        index,
      ): VirtualViewGroupConfig<
        PhotoGroupHeaderProps,
        PhotoJustifiedRowProps,
        ImageLayoutRow
      > => ({
        // title: group.header,
        // headerHeight: 3,
        // rows: group.images,
        rows: {
          data: group.rows,
          getTooltip: ({ group }) => group.header.label.value,
          getProps: (rowWithIndex: RowWithIndex<ImageLayoutRow>) => {
            return { row: rowWithIndex.data };
          },
          getRowHeight: (imageLayout: ImageLayoutRow) =>
            imageLayout.height + imageLayout.boxSpacing,
          Component: PhotoJustifiedRow,
        },
        header: {
          height: PHOTO_GROUP_HEADER_HEIGHT,
          Component: PhotoGroupHeader,
          props: { label: group.header },
          label: { value: group.header, isPrimary: group.isNewYear },
          // @configurable
          sticky: true,
        },
        id: `${index}-${group.header}`,
      }),
    );
  }, [
    images,
    imagesLoading,
    loadingRandomOrder,
    percentProgress,
    virtualizerWidth,
  ]);

  // Combine albums and images
  const groups: VirtualViewGroupConfig[] = useMemo(
    () => [
      ...[categoriesViewGroup as VirtualViewGroupConfig | null].filter(
        (g) => g !== null,
      ),
      ...(imagesViewGroups as VirtualViewGroupConfig[]),
      horizontalRuleGroup,
    ],
    [categoriesViewGroup, imagesViewGroups],
  );

  return (
    <>
      {category.id !== 0 && <CategoryBreadcrumbs category={category} />}

      <div className="flex flex-row flex-grow relative overflow-hidden pt-2 w-full">
        <div className="size-full overflow-hidden relative">
          <GroupedVirtualView
            ref={groupedVirtualViewRef}
            className={cn(
              "relative z-0",
              imagesViewGroups.length ? "no-scrollbar" : "",
            )}
            groups={groups}
            enabled={virtualizerWidth > 0}
            onWidthUpdate={(width) => {
              setVirtualizerWidth(width);
            }}
            onScrollUpdate={(values) => setScrollValues(values)}
          />
        </div>
      </div>
      {imagesViewGroups.length > 0 && (
        <div className="absolute right-0 top-0 h-full z-100">
          <LabeledScrollbar
            groups={groups}
            scrollOffset={scrollValues?.scrollOffset ?? 0}
            viewportHeight={scrollValues?.viewportHeight ?? 0}
            onChangeScrollPercent={(newScrollPercent) => {
              groupedVirtualViewRef.current?.setScrollPercent(newScrollPercent);
            }}
          />
        </div>
      )}
    </>
  );
};
