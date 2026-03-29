import type { Image } from "../api/types";

/**
 * Finds whether image is rotated 90 or 270 degrees.
 *
 * Piwigo uses its own rotation codes distinct from the Exif Orientation format.
 * Instead they use:
 *       case 0: return 0;
 *       case 1: return 90;
 *       case 2: return 180;
 *       case 3: return 270;
 *
 * @param image PiwigoImage with `rotation` property
 */
export const shouldSwapDimensions = (image: Image) => {
  // 1 and 3 are 90 and 270 degress respectively. So x%2==1 will capture those.
  if (image.rotation && image.rotation % 2 === 1) {
    return true;
  }
  return false;
};
