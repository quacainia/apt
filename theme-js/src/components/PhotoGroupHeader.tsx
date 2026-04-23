export interface PhotoGroupHeaderProps {
  label: string;
}

/**
 * This is based roughly off:
 *  - text-lg line height of 1.75rem = 28px
 *  - p-2 (container) 0.5rem = 8px ; times 2 for top and bottom
 *  - py-1 (header 3) 0.25rem = 4px ; times 2 for top and bottom
 *
 * There's not a good way to make this automatic, so devs will simply have to
 * ensure this matches any changes to height.
 */
export const PHOTO_GROUP_HEADER_HEIGHT = 52;

export const PhotoGroupHeader = ({ label }: PhotoGroupHeaderProps) => {
  return (
    <div
      className="pointer-events-none flex items-center justify-center w-full p-2"
      style={{ height: PHOTO_GROUP_HEADER_HEIGHT }}
    >
      <div
        className={
          "top-1.5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md transform-gpu isolate self-center rounded-full z-10 pointer-events-auto"
        }
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-white py-1 px-6">
          {label}
        </h3>
      </div>
    </div>
  );
};
