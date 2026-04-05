import type { Category } from "../api/types";
import AlbumCard from "./AlbumCard";

export default function AlbumGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="flex-grow h-full overflow-y-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>
    </div>
  );
}
