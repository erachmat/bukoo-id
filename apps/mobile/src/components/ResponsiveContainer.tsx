import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { MAX_CONTENT_WIDTH } from '../constants/LAYOUT';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Centers content on wide (tablet) displays and caps it at MAX_CONTENT_WIDTH.
 *
 * No default horizontal padding — tab screens already apply their own
 * per-section padding (paddingHorizontal / marginHorizontal), so on phones
 * (< MAX_CONTENT_WIDTH) this is a no-op and screens look exactly as before.
 */
export default function ResponsiveContainer({
  children,
  style,
}: ResponsiveContainerProps) {
  return <View style={[styles.container, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
  },
});
