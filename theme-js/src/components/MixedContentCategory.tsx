import { useMemo, useState } from "react";
import { useCategoriesImages } from "../api/hooks";
import type { Category } from "../api/types";
import {
  virtualizeCategoryList,
  type CategoryGridData,
  type CategoryRow,
} from "../utils/virtualize-category-list";
import {
  virtualizeImagesList,
  type ImageLayoutRow,
} from "../utils/virtualize-images-list";
import CategoriesHeader, {
  CATEGORY_HEADER_HEIGHT,
  type CategoryHeaderProps,
} from "./CategoriesHeader";
import CategoriesRow, { type CategoryRowProps } from "./CategoriesRow";
import type { DateTimelineProps } from "./DateTimeline";
import {
  GroupedVirtualView,
  type RowWithIndex,
  type VirtualViewGroupConfig,
} from "./GroupedVirtualView";
import {
  PHOTO_GROUP_HEADER_HEIGHT,
  PhotoGroupHeader,
  type PhotoGroupHeaderProps,
} from "./PhotoGroupHeader";
import {
  PhotoJustifiedRow,
  type PhotoJustifiedRowProps,
} from "./PhotoJustifiedRow";

export const MixedContentCategory = ({
  categoryId,
  handleTimelineContext,
  subCategories,
}: {
  categoryId: number;
  handleTimelineContext: (newCtx: Partial<DateTimelineProps>) => void;
  subCategories: Category[];
}) => {
  const [percentProgress, setPercentProgress] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [virtualizerWidth, setVirtualizerWidth] = useState<number>(0);

  // Query Images for the category, recursively to get all
  const {
    data: imagesData,
    isLoading: imagesLoading,
    error: imagesError,
  } = useCategoriesImages(
    categoryId,
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
  const images = useMemo(
    () => (imagesData?.stat === "ok" ? (imagesData?.result?.images ?? []) : []),
    [imagesData],
  );

  /**
   * Generate the section of the page with the sub-Categories
   */
  const categoriesViewGroup: VirtualViewGroupConfig<
    CategoryHeaderProps,
    CategoryRowProps,
    CategoryRow
  > = useMemo(() => {
    // Convert subcategories into a grid
    const categoryGridData: CategoryGridData = virtualizeCategoryList(
      subCategories,
      isExpanded,
      virtualizerWidth,
      {
        gap: 0,
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
        component: CategoriesHeader,
        props: headerProps,
        sticky: true,
      },
      rows: {
        data: categoryGridData.rows,
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
        component: CategoriesRow,
      },
    };
    return categoriesConfig;
  }, [subCategories, isExpanded, virtualizerWidth]);

  /**
   * Generate the sections of the page for each month of the images.
   *
   * @todo - make the grouping better. Sometimes day or year is better,
   *         sometimes it'd be better to search for clusters in a day.
   */
  const imagesViewGroups = useMemo(() => {
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
          getProps: (rowWithIndex: RowWithIndex<ImageLayoutRow>) => {
            return { row: rowWithIndex.data };
          },
          getRowHeight: (imageLayout: ImageLayoutRow) =>
            imageLayout.height + imageLayout.boxSpacing,
          component: PhotoJustifiedRow,
        },
        header: {
          height: PHOTO_GROUP_HEADER_HEIGHT,
          component: PhotoGroupHeader,
          props: { label: group.header },
          // @configurable
          sticky: true,
        },
        id: `${index}-${group.header}`,
      }),
    );
  }, [images, virtualizerWidth]);

  // Combine albums and images
  const groups: VirtualViewGroupConfig[] = useMemo(
    () => [
      categoriesViewGroup as VirtualViewGroupConfig,
      ...(imagesViewGroups as VirtualViewGroupConfig[]),
    ],
    [categoriesViewGroup, imagesViewGroups],
  );

  return (
    <GroupedVirtualView
      groups={groups}
      enabled={virtualizerWidth > 0}
      onWidthUpdate={(width) => {
        setVirtualizerWidth(width);
      }}
    />
  );
};
