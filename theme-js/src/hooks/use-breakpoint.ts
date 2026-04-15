import { useEffect, useState } from "react";

// Default Tailwind breakpoints in pixels
const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

type BreakpointKey = keyof typeof BREAKPOINTS;

/**
 * Hook that returns a value based on the current window width and Tailwind breakpoints.
 * Values inherit from lower breakpoints if not explicitly defined.
 *
 * @example
 * const columns = useBreakpoint({
 *   xs: 1,
 *   sm: 2,
 *   md: 3,
 *   lg: 4,
 * });
 */
export function useBreakpoint<T>(config: Partial<Record<BreakpointKey, T>>): T {
  const [currentValue, setCurrentValue] = useState<T>(() => {
    // Initialize with the value for the current window width
    return getValueForWidth(window.innerWidth, config);
  });

  useEffect(() => {
    const handleResize = () => {
      setCurrentValue(getValueForWidth(window.innerWidth, config));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [config]);

  return currentValue;
}

/**
 * Get the appropriate value for a given width, based on Tailwind breakpoints.
 * Uses the highest breakpoint that is <= the given width.
 */
function getValueForWidth<T>(
  width: number,
  config: Partial<Record<BreakpointKey, T>>,
): T {
  // Get all defined breakpoints and sort them by pixel value (descending)
  const sortedBreakpoints = (
    Object.entries(BREAKPOINTS) as [BreakpointKey, number][]
  )
    .filter(([key]) => key in config)
    .sort((a, b) => b[1] - a[1]);

  // Find the highest breakpoint that fits the current width
  for (const [key, pixels] of sortedBreakpoints) {
    if (width >= pixels) {
      return config[key]!;
    }
  }

  // Fallback - this shouldn't happen if config is properly defined
  const firstDefined = Object.entries(config)[0];
  if (!firstDefined) {
    throw new Error(
      "useBreakpoint requires at least one breakpoint to be defined",
    );
  }
  return firstDefined[1];
}
