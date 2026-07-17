import { useEffect, useRef } from 'react';
import { Animated, ViewStyle, DimensionValue } from 'react-native';

interface ShimmerPlaceholderProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  color1?: string;
  color2?: string;
  style?: ViewStyle;
}

export function ShimmerPlaceholder({
  width = '100%',
  height = 20,
  borderRadius = 4,
  color1 = '#0E221D', // Default Dark Forest Card color
  color2 = '#1B3E34', // Default Dark Forest Border color
  style,
}: ShimmerPlaceholderProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false, // Animated.interpolate on colors requires useNativeDriver: false
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [shimmerAnim]);

  const backgroundColor = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [color1, color2],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
}
