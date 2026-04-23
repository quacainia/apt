import { TriangleAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Image, ImageDerivatives } from "../api/types";
import { cn } from "../utils/cn";
import type { PiwigoRoute } from "../utils/routes";
import { shouldSwapDimensions } from "../utils/should-swap-dimensions";
import { Link } from "./Link";

export type PhotoGridItemProps = {
  image: Image;
  isScrolling: boolean;
  isSelected?: boolean;
  to?: PiwigoRoute;
  size?: keyof ImageDerivatives;
  hideOverlay?: boolean;
  height?: number;
};

export default function PhotoGridItem({
  height,
  image,
  isScrolling,
  isSelected,
  to,
  size,
  hideOverlay,
}: PhotoGridItemProps) {
  const [shouldLoad, setShouldLoad] = useState(false);

  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we aren't scrolling, it's safe to trigger the load
    if (!isScrolling) {
      // This one is safe
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShouldLoad(true);
    }
  }, [isScrolling]);

  const containerRef = useRef<HTMLButtonElement | HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const thumbUrl = shouldLoad
    ? image?.derivatives?.[size ?? "medium"]?.url || image?.element_url
    : undefined;

  const isRotated = shouldSwapDimensions(image);
  const imageWidth = !isRotated ? image.width : image.height;
  const imageHeight = !isRotated ? image.height : image.width;

  const containerClassName = cn(
    `group relative aspect-square overflow-hidden bg-transparent dark:bg-transparent transition-shadow flex justify-center items-center`,
    isSelected ? "ring-2 ring-gray-900 dark:ring-white" : "",
    to ? "hover:shadow-md" : "",
  );

  const containerStyle = {
    ...(height
      ? {
          height,
          width: (height / imageHeight) * imageWidth,
        }
      : { height: "100%", width: "100%" }),
    objectFit: "cover",
  } as const;

  const containerContent = (
    <>
      {error ? (
        <div className="flex flex-col justify-center items-center size-full relative z-20">
          <TriangleAlert
            size={(height ?? 200) / 2}
            className="stroke-gray-500"
          />
          <p>{error}</p>
        </div>
      ) : (
        <>
          <img
            ref={imgRef}
            src={thumbUrl}
            loading="lazy"
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            onError={() => setError("Error")}
            className={cn(
              "object-cover relative z-10 size-full",
              isLoaded ? "opacity-100" : "opacity-0",
              // height || isFullHeight ? "h-full" : "w-full",
            )}
          />
          <div className="absolute z-0 h-full w-full bg-gray-300 dark:bg-gray-700 animate-pulse"></div>
        </>
      )}
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
    </>
  );

  return to ? (
    <Link
      to={to}
      className={containerClassName}
      style={containerStyle as React.CSSProperties}
    >
      {containerContent}
    </Link>
  ) : (
    <div
      ref={containerRef as React.RefObject<HTMLDivElement>}
      className={containerClassName}
      style={containerStyle as React.CSSProperties}
    >
      {containerContent}
    </div>
  );
}
