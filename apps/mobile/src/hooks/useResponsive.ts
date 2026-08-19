import { useWindowDimensions } from 'react-native';
import { TABLET_BREAKPOINT } from '../constants/LAYOUT';

/**
 * True when the current window width is at or above the tablet breakpoint.
 * Re-renders on dimension changes (portrait-locked app, but safe regardless).
 */
export function useIsTablet(): boolean {
  const { width } = useWindowDimensions();
  return width >= TABLET_BREAKPOINT;
}

export interface Responsive {
  isTablet: boolean;
  width: number;
  height: number;
}

/**
 * Convenience hook returning window dimensions plus a tablet flag.
 */
export function useResponsive(): Responsive {
  const { width, height } = useWindowDimensions();
  return { isTablet: width >= TABLET_BREAKPOINT, width, height };
}
