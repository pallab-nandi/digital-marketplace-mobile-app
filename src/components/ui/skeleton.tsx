import { useEffect, useState } from 'react';
import { Animated, Easing, type DimensionValue, type ViewProps } from 'react-native';

export type SkeletonProps = ViewProps & {
  width?: DimensionValue;
  height?: number | DimensionValue;
  rounded?: 'full' | 'lg' | 'md' | 'sm';
};

const radiusMap = {
  full: 999,
  lg: 16,
  md: 12,
  sm: 8,
} as const;

export function Skeleton({ width = '100%', height = 16, rounded = 'md', style, ...rest }: SkeletonProps) {
  const [opacity] = useState(() => new Animated.Value(0.4));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.8, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      className="bg-surface-muted dark:bg-surface-muted-dark"
      style={[{ width, height, borderRadius: radiusMap[rounded], opacity }, style]}
      {...rest}
    />
  );
}