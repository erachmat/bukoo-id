import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Detects whether the device uses Android "3-button" system navigation
 * (back/home/recent) rather than gesture navigation.
 *
 * Heuristic: react-native-safe-area-context reports a large bottom inset
 * for the system nav bar (~48dp on 3-button nav) versus a small one for the
 * gesture handle (~24dp). Legacy non-edge-to-edge devices report ~0, in which
 * case the app content already clears the system bar and we return false.
 */
export function useThreeButtonNav(): boolean {
  const insets = useSafeAreaInsets();
  return Platform.OS === 'android' && insets.bottom >= 32;
}
