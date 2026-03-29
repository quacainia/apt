/**
 * Locate the proper insertion point for a new item `searchValue` if it were
 * inserted into `sortedArray`.
 *
 * @param sortedArray Sorted array of values
 * @param searchValue Value you are searching for
 * @param options
 * @param options.direction {"left" | "right"} If the searchValue exactly equals
 * a value in the array then `right` (default) means the function will return
 * the index one after the found existing item. For direction `left` the
 * function will return the index of the found value.
 * @param options.key Function that accesses the appropriate value if the array
 * is made up of items. Example `(item) => item.value` where the array is made
 * up like `{value: number}[]` will access the number `value` within each item.
 * @returns {number} Index of insertion.
 */
export const bisect = <T, P extends number | string>(
  sortedArray: T[],
  searchValue: P,
  {
    direction = "right",
    key,
  }: { direction?: "left" | "right"; key?: (item: T) => P } = {},
) => {
  let start = 0;
  let end = sortedArray.length - 1;

  while (start <= end) {
    const middle = Math.floor((start + end) / 2);
    const currentItem = sortedArray[middle];
    const currentKey = key ? key(currentItem) : (currentItem as unknown as P);

    if (currentKey === searchValue) {
      return direction === "left" ? middle : middle + 1;
    } else if (currentKey < searchValue) {
      // continue searching to the right

      // Necessarily the end because we use `Math.floor`
      if (middle === start) {
        return end;
      }

      start = middle;
    } else {
      // search searching to the left

      // Necessarily the end because we use `Math.floor`
      if (middle === start) {
        return start;
      }

      end = middle;
    }
  }
  // This should be impossible...
  return -1;
};

export const bisect_right = <T, P extends number | string>(
  sortedArray: T[],
  searchValue: P,
  key?: (item: T) => P,
) => bisect(sortedArray, searchValue, { direction: "right", key });

export const bisect_left = <T, P extends number | string>(
  sortedArray: T[],
  searchValue: P,
  key?: (item: T) => P,
) => bisect(sortedArray, searchValue, { direction: "left", key });
