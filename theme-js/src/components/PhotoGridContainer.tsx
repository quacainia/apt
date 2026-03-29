import { Fragment, useEffect, useState } from "react";
import { useCategoriesImages } from "../api/hooks";
import { useAppStore, type AppState } from "../store/useAppStore";
import { parseQuery } from "../utils/query";
import type { DateTimelineProps } from "./DateTimeline";
import PhotoGridVirtual from "./PhotoGridVirtual";

export default function PhotoGridContainer({
  onTimelineContext,
}: {
  onTimelineContext: (newCtx: Partial<DateTimelineProps>) => void;
}) {
  const currentAlbumId = useAppStore((s: AppState) => s.currentAlbumId);
  const [percentProgress, setPercentProgress] = useState<number>(0);
  const [albumId, setAlbumId] = useState<number | null>(currentAlbumId);

  // Update albumId from URL if needed
  useEffect(() => {
    const query = parseQuery(window.location.search);
    if (query.album) {
      const id = parseInt(query.album);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAlbumId(id);
    }
  }, []);

  const {
    data: imagesData,
    isLoading: imagesLoading,
    error: imagesError,
  } = useCategoriesImages(
    albumId != undefined ? albumId : undefined,
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

  const images =
    imagesData?.stat === "ok" ? (imagesData?.result?.images ?? []) : [];

  if (imagesLoading) {
    return (
      <>
        <div className="absolute size-full z-10 flex justify-center items-center">
          <div
            className="flex flex-col gap-3 items-center h-[300px] w-[600px] justify-center"
            style={{
              background:
                "radial-gradient(ellipse,var(--gradient-color) 20%, var(--gradient-color-transparent) 60%, var(--gradient-color-transparent) 100%)",
            }}
          >
            <p className="text-xl">Loading...</p>
            <div className="h-1 w-48 bg-gray-500 rounded-full">
              <div
                className="bg-gray-800 dark:bg-gray-200 w-1 h-1 rounded-full transition-all duration-250"
                style={
                  percentProgress !== 0
                    ? { width: `${Math.round(percentProgress * 100)}%` }
                    : undefined
                }
              ></div>
            </div>
          </div>
        </div>
        <div className="flex-grow">
          {Array.from({ length: 3 }).map((_, i) => (
            <Fragment key={i}>
              <div className="flex items-center justify-center py-1.5">
                <div className="w-[150px] h-9 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-full"></div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {Array.from({ length: 11 }).map((_, ii) => (
                  <div
                    key={ii}
                    className="aspect-square bg-gray-200 dark:bg-gray-800 animate-pulse"
                  ></div>
                ))}
              </div>
            </Fragment>
          ))}
        </div>
      </>
    );
  }

  if (imagesError) {
    return (
      <div className="flex-grow text-center py-12">
        <p className="text-red-600 dark:text-red-400">
          Failed to load photos. Please try again.
        </p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          No photos in this album
        </p>
      </div>
    );
  }

  return (
    <PhotoGridVirtual images={images} onTimelineContext={onTimelineContext} />
  );
}
