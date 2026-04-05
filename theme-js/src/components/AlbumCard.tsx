import { Folder } from "lucide-react";
import { type Category } from "../api/types";
import { formatMonth } from "../utils/format";
import PhotoGridItemById from "./PhotoGridItemById";

interface AlbumCardProps {
  album: Category;
}

export default function AlbumCard({ album }: AlbumCardProps) {
  return (
    <a
      href={`${window.location.origin}${window.location.pathname}?/category/${album.id}`}
      className="group relative aspect-square rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Representative image if available */}
      {album.representative_picture_id ? (
        <div className="absolute inset-0">
          <PhotoGridItemById
            imageId={album.representative_picture_id}
            size="medium"
            hideOverlay
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
          <span className="text-6xl">
            <Folder size={100} />
          </span>
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity z-30"></div>

      {/* Text content */}
      <div className="absolute inset-0 p-4 flex flex-col justify-end text-left  opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity z-40">
        <h3 className="text-white font-medium line-clamp-2">{album.name}</h3>
        <p className="text-gray-200 text-sm mt-1">
          {album.nb_images} {album.nb_images === 1 ? "photo" : "photos"}
        </p>
        {album.date_last && (
          <p className="text-gray-300 text-xs mt-1">
            {formatMonth(album.date_last)}
          </p>
        )}
      </div>

      {/* Counter badge - always visible */}
      <div className="absolute top-3 right-3 flex flex-row gap-2 z-30">
        {album.nb_images > 0 && (
          <div className="flex flex-row gap-2 bg-black/50 text-white text-xs font-medium px-2 py-1 rounded-full">
            <span>{album.nb_images}</span>
            <span>🏞️</span>
          </div>
        )}
        {album.nb_categories > 0 && (
          <div className="flex flex-row gap-2 bg-black/50 text-white text-xs font-medium px-2 py-1 rounded-full">
            <span>{album.nb_categories}</span>
            <span>📗</span>
          </div>
        )}
      </div>
    </a>
  );
}
