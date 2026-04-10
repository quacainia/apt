import { TriangleAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Image, ImageDerivatives } from "../api/types";
import { cn } from "../utils/cn";
import { shouldSwapDimensions } from "../utils/should-swap-dimensions";

export type PhotoGridItemProps = {
  image: Image;
  isSelected?: boolean;
  onSelect?: () => void;
  size?: keyof ImageDerivatives;
  hideOverlay?: boolean;
} & (
  | {
      height: number;
      fullsize?: never;
    }
  | {
      height?: never;
      fullsize?: true;
    }
);

export default function PhotoGridItem({
  height,
  image,
  isSelected,
  onSelect,
  size,
  hideOverlay,
}: PhotoGridItemProps) {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isInverted, setIsInverted] = useState(false);
  const containerRef = useRef<HTMLButtonElement | HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const thumbUrl =
    image?.derivatives?.[size ?? "medium"]?.url || image?.element_url;

  useEffect(() => {
    if (!thumbUrl) return;

    const controller = new AbortController();
    let completed = false;

    async function preload() {
      try {
        // 1. This is a GUARANTEED abortable network request
        const response = await fetch(thumbUrl!, {
          signal: controller.signal,
          // Ensure it populates the standard browser cache
          cache: "force-cache",
        });
        completed = true;

        if (!response.ok) throw new Error("Failed to fetch image");

        // 2. Convert response to a Blob
        const blob = await response.blob();
        const localUrl = URL.createObjectURL(blob);
        setImageSrc(localUrl);

        // 2. If we got here, the image is in the browser cache.
        setIsLoaded(true);
      } catch (e: unknown) {
        completed = true;
        const err = e as Error;
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      }
    }

    const timeout = setTimeout(preload, 200);

    return () => {
      clearTimeout(timeout);
      if (!completed) {
        controller.abort(); // Actually kills the HTTP request on the wire
      }
    };
  }, [thumbUrl]);

  useEffect(() => {
    const checkOrientation = () => {
      const container = containerRef.current;
      const img = imgRef.current;

      if (container && img && img.naturalWidth > 0) {
        const containerIsLandscape =
          container.offsetWidth > container.offsetHeight;
        const imageIsLandscape = img.naturalWidth > img.naturalHeight;

        // If one is true and the other is false, they are inverted
        const isMismatched = containerIsLandscape !== imageIsLandscape;

        setIsInverted(isMismatched);
      }
    };

    const imageElement = imgRef.current;

    if (imageElement) {
      // If image is already cached/loaded, check immediately
      if (imageElement.complete) {
        checkOrientation();
      } else {
        imageElement.addEventListener("load", checkOrientation);
      }
    }

    return () => {
      if (imageElement)
        imageElement.removeEventListener("load", checkOrientation);
    };
  }, [imageSrc]);

  const Container = onSelect ? "button" : "div";

  const isRotated = shouldSwapDimensions(image);
  const imageWidth = !isRotated ? image.width : image.height;
  const imageHeight = !isRotated ? image.height : image.width;

  const isFullHeight =
    containerRef.current === null ||
    image.height / containerRef.current.offsetHeight <
      image.width / containerRef.current.offsetWidth;

  return (
    <Container
      onClick={onSelect}
      ref={
        containerRef as React.RefObject<HTMLButtonElement | null> &
          React.RefObject<HTMLDivElement | null>
      }
      className={cn(
        `group relative aspect-square overflow-hidden bg-transparent dark:bg-transparent transition-shadow flex justify-center items-center`,
        isSelected ? "ring-2 ring-gray-900 dark:ring-white" : "",
        onSelect ? "hover:shadow-md" : "",
        isInverted ? "ring-2 ring-red-500 dark:ring-red-700" : "",
      )}
      style={{
        ...(height
          ? {
              height,
              width: (height / imageHeight) * imageWidth,
            }
          : { height: "100%", width: "100%" }),
        objectFit: "cover",
      }}
    >
      {error ? (
        <div className="flex flex-col justify-center items-center size-full relative z-20">
          <TriangleAlert
            size={(height ?? 200) / 2}
            className="stroke-gray-500"
          />
          <p>{error}</p>
        </div>
      ) : imageSrc && isLoaded ? (
        <>
          <img
            ref={imgRef}
            src={imageSrc}
            alt={image.name}
            className={cn(
              "object-cover relative z-10",
              height || isFullHeight ? "h-full" : "w-full",
            )}
          />
        </>
      ) : (
        <>
          <div className="h-full flex items-center justify-center bg-gray-300 dark:bg-gray-700 animate-pulse"></div>
        </>
      )}
      <div className="absolute top-0 left-0 size-full bg-gray-100 dark:bg-gray-800"></div>
      {/* Hover overlay with info */}
      {!hideOverlay && (
        <div className="absolute z-20 inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
          <div className="w-full p-2 bg-gradient-to-t from-black/80 to-transparent text-white text-xs">
            <p
            // className="line-clamp-1"
            >
              {image.id} | {image.name} <br /> {imageWidth}x{imageHeight}{" "}
              {imageWidth / imageHeight}
            </p>
          </div>
        </div>
      )}

      {/* Rating badge if available */}
      {image.rating_score && (
        <div className="absolute top-1 right-1 bg-yellow-400 text-xs font-bold px-1.5 py-0.5 rounded">
          ⭐ {image.rating_score}
        </div>
      )}
    </Container>
  );
}
