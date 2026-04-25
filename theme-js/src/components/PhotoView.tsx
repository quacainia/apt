import { AxiosError } from "axios";
import { ChevronLeft, ChevronRight, Info, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import urlJoin from "url-join";
import { BASE_URL } from "../api/piwigo";
import { usePhoto } from "../hooks/use-photo";
import { cn } from "../utils/cn";
import { CategoryBreadcrumbs } from "./CategoryBreadcrumbs";
import { Link } from "./Link";
import { LoadingSpinner } from "./LoadingSpinner";
import { StandardErrorMessage } from "./StandardErrorMessage";

interface PhotoViewProps {
  photoId: string;
  categoryId: string;
}

export default function PhotoView({ photoId, categoryId }: PhotoViewProps) {
  const [showInfo, setShowInfo] = useState<boolean>(true);
  const [_showOverlay, setShowOverlay] = useState<boolean>(true);
  const [isPointerOverButton, setIsPointerOverButton] =
    useState<boolean>(false);
  const overlayTimeoutRef = useRef<number | null>(null);

  const image = usePhoto(photoId.toString(), categoryId.toString());
  const showOverlay = _showOverlay || !image;

  const imageLoading = image === undefined;
  let imageError: Error | undefined = undefined;
  if (image?.info.id === "") {
    imageError = new AxiosError("arf");
  }

  const handleClose = () => {
    setShowInfo(false);
  };

  const handleOpenSidebar = () => {
    setShowInfo(true);
  };

  const handleMouseMove = useCallback(() => {
    setShowOverlay(true);

    // Clear existing timeout
    if (overlayTimeoutRef.current) {
      clearTimeout(overlayTimeoutRef.current);
    }

    // Set new timeout to hide overlay after 2 seconds, unless pointer is over a button
    overlayTimeoutRef.current = setTimeout(
      () => {
        if (!isPointerOverButton) {
          setShowOverlay(() => false);
        }
      },
      // @configurable?
      1000,
    );
  }, [isPointerOverButton]);

  useEffect(() => {
    // This one is safe
    // eslint-disable-next-line react-hooks/set-state-in-effect
    handleMouseMove();
  }, [handleMouseMove, showInfo]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (overlayTimeoutRef.current) {
        clearTimeout(overlayTimeoutRef.current);
      }
    };
  }, []);
  const displayUrl = image?.info.path && urlJoin(BASE_URL, image?.info.path);

  if (imageError) {
    if (imageError instanceof Error && "isAxiosError" in imageError) {
      return <StandardErrorMessage error={imageError as AxiosError} />;
    }
    return (
      <div className="flex items-center justify-center h-full">
        Error loading image details
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden relative">
      {/* Header with close button */}
      <div className="w-full flex flex-col items-center">
        <CategoryBreadcrumbs
          breadcrumbs={image?.breadcrumbs ?? []}
          finalIsClickable
        />
      </div>
      {/* Main content area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden lg:overflow-y-hidden flex flex-col lg:flex-row">
        {/* Image container */}
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={() => {
            if (!isPointerOverButton) {
              setShowOverlay(false);
            }
            if (overlayTimeoutRef.current) {
              clearTimeout(overlayTimeoutRef.current);
            }
          }}
          className={cn(
            "flex-1 flex items-center justify-center relative group lg:h-full transition-[max-height]",
            !showInfo ? "max-h-full" : "max-h-[50%] lg:max-h-full",
          )}
        >
          {image && displayUrl && !imageLoading ? (
            <img
              src={displayUrl}
              alt={image.info.name}
              className="max-h-full max-w-full object-contain"
            />
          ) : imageLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="text-gray-400">Image not available</div>
          )}

          {/* Navigation overlay */}
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-between opacity-100 transition-opacity pointer-events-none px-4 duration-300 lg:focus-within:opacity-100",
              showOverlay ? "lg:opacity-100" : "lg:opacity-0",
            )}
          >
            {!showInfo && (
              <button
                onClick={handleOpenSidebar}
                onMouseEnter={() => setIsPointerOverButton(true)}
                onMouseLeave={() => setIsPointerOverButton(false)}
                className="absolute top-2 right-4 flex items-center justify-center p-2 rounded-md bg-black/50 dark:bg-white/20 hover:bg-black/70 dark:hover:bg-white/50 text-white transition-colors z-10 pointer-events-auto duration-300"
                aria-label="Open sidebar info"
              >
                <Info size={24} />
              </button>
            )}
            {!image || image.prevId ? (
              <Link
                to={
                  image && {
                    type: "picture",
                    id: image.prevId,
                    category: categoryId,
                  }
                }
                onMouseEnter={() => setIsPointerOverButton(true)}
                onMouseLeave={() => setIsPointerOverButton(false)}
                className={cn(
                  "flex items-center justify-center size-8 rounded-full transition-colors duration-300 pointer-events-auto bg-black/50 hover:bg-black/70 text-white",
                )}
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </Link>
            ) : (
              <div />
            )}
            {!image || image.nextId ? (
              <Link
                to={
                  image && {
                    type: "picture",
                    id: image.nextId,
                    category: categoryId,
                  }
                }
                onMouseEnter={() => setIsPointerOverButton(true)}
                onMouseLeave={() => setIsPointerOverButton(false)}
                className={cn(
                  "flex items-center justify-center p-1 rounded-full transition-colors duration-300 pointer-events-auto bg-black/50 hover:bg-black/70 text-white",
                )}
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </Link>
            ) : (
              <div />
            )}

            <div className="absolute bottom-0 w-full flex flex-col items-center">
              <div
                onMouseEnter={() => setIsPointerOverButton(true)}
                onMouseLeave={() => setIsPointerOverButton(false)}
                className="p-4 min-w-32 h-7 py-1 text-sm text-center pointer-events-auto bg-gray-700/70 text-white m-2 rounded-full"
              >
                {image && image.categoryPosition.split("/").join(" / ")}
              </div>
            </div>
          </div>
        </div>

        {/* Metadata sidebar */}
        <div
          className={cn(
            "overflow-hidden w-full lg:w-80 lg:max-w-80 xl:w-96 xl:max-w-96 2xl:w-128 2xl:max-w-128 transition-[max-height, max-width, height] duration-300 ease-out flex-shrink",
            !showInfo
              ? "max-h-0 h-0 lg:max-w-0 xl:max-w-0 2xl:max-w-0 lg:max-h-full lg:h-full"
              : "max-h-1/2 h-1/2 lg:max-h-full lg:h-full",
          )}
        >
          <div
            className={cn(
              "relative flex flex-col h-full w-full lg:w-80 xl:w-96 2xl:w-128 dark:bg-gray-900 transform px-2",
            )}
          >
            <div
              className={cn(
                "lg:bg-gray-100 lg:dark:bg-gray-800 rounded-lg p-2 min-w-full",
                image ? "" : "min-h-[50%]",
              )}
            >
              <button
                onClick={handleClose}
                className="fixed top-2 right-4 flex items-center justify-center p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors duration-300"
                aria-label="Close sidebar info"
              >
                <X size={24} />
              </button>
              {image && (
                <>
                  <div className="grow overflow-y-auto py-1 px-2">
                    <div
                      className="flex items-start justify-between"
                      style={{ width: "calc(100% - 36px)" }}
                    >
                      <h1 className="text-lg font-semibold">
                        {image.info.name}
                      </h1>
                    </div>

                    <div className="space-y-4 text-sm pt-4">
                      {/* Dimensions */}
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 font-bold">
                          Dimensions
                        </p>
                        <p className="dark:text-white font-medium">
                          {image.info.width} × {image.info.height} px
                        </p>
                      </div>

                      {/* File */}
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 font-bold">
                          File
                        </p>
                        <p className="dark:text-white font-medium break-all">
                          {image.info.file}
                        </p>
                      </div>

                      {/* Date Available */}
                      {image.info.date_available && (
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 font-bold">
                            Uploaded
                          </p>
                          <p className="dark:text-white font-medium">
                            {new Date(
                              image.info.date_available,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      {/* Date Created */}
                      {image.info.date_creation && (
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 font-bold">
                            Created
                          </p>
                          <p className="dark:text-white font-medium">
                            {new Date(
                              image.info.date_creation,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      {/* Author */}
                      {image.info.author && (
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 font-bold">
                            Author
                          </p>
                          <p className="dark:text-white font-medium">
                            {image.info.author}
                          </p>
                        </div>
                      )}

                      {/* Rating */}
                      {image.info.rating_score !== undefined &&
                        image.info.rating_score !== null && (
                          <div>
                            <p className="text-gray-600 dark:text-gray-400 font-bold">
                              Rating
                            </p>
                            <p className="dark:text-white font-medium flex items-center gap-1">
                              <span>⭐</span>
                              {image.info.rating_score}
                            </p>
                          </div>
                        )}

                      {/* Hits */}
                      {image.info.hit !== undefined && (
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 font-bold">
                            Views
                          </p>
                          <p className="dark:text-white font-medium">
                            {image.info.hit}
                          </p>
                        </div>
                      )}

                      {/* Comment */}
                      {image.info.comment && (
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 font-bold">
                            Description
                          </p>
                          <p className="dark:text-white text-xs leading-relaxed whitespace-pre-wrap">
                            {image.info.comment}
                          </p>
                        </div>
                      )}

                      {/* Tags */}
                      {image.related_tags && image.related_tags.length > 0 && (
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 font-bold">
                            Tags
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {image.related_tags.map((tag) => (
                              <span
                                key={tag.id}
                                className="inline-block bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1 rounded text-xs"
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="px-3 py-1 text-sm w-full text-center">
                    {image.categoryPosition.split("/").join(" / ")}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
