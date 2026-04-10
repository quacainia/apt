export interface PhotoGroupHeaderProps {
  label: string;
}

/**
 * @todo - is there a better way to do this? it's based off an estimate for the
 *         height of `text-lg` and the other padding & margins
 */
export const PHOTO_GROUP_HEADER_HEIGHT =
  // line-height
  28 +
  // H padding
  8 +
  // container padding
  16;

export const PhotoGroupHeader = ({ label }: PhotoGroupHeaderProps) => {
  return (
    <div className="pointer-events-none flex items-center justify-center w-full p-2">
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
