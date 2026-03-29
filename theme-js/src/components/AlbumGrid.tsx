import { useCategoriesList } from "../api/hooks";
import { useAppStore } from "../store/useAppStore";
import { navigateTo } from "../utils/query";
import AlbumCard from "./AlbumCard";

export default function AlbumGrid() {
  const {
    data: categoriesData,
    isLoading,
    error,
  } = useCategoriesList({
    recursive: false,
  });
  const setCurrentAlbum = useAppStore((s) => s.setCurrentAlbum);
  const setCurrentView = useAppStore((s) => s.setCurrentView);

  const categories =
    categoriesData?.stat === "ok"
      ? categoriesData?.result?.categories || []
      : [];

  const handleSelectAlbum = (albumId: number) => {
    setCurrentAlbum(albumId);
    setCurrentView("photos");
    navigateTo({ view: "photos", album: albumId.toString() });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">
          Failed to load albums. Please try again.
        </p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">No albums found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((album) => (
        <AlbumCard
          key={album.id}
          album={album}
          onClick={() => handleSelectAlbum(album.id)}
        />
      ))}
    </div>
  );
}
