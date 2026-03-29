import AlbumGrid from "./AlbumGrid";

export default function AlbumsView() {
  return (
    <div className="w-full overflow-auto flex-grow flex flex-col items-center">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="mb-8">
          <h2 className="text-3xl font-light text-gray-900 dark:text-white">
            Albums
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Select an album to view photos
          </p>
        </div>

        <AlbumGrid />
      </div>
    </div>
  );
}
