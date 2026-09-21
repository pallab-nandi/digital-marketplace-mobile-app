import { useEffect, useState } from 'react';
import { View, type ViewProps, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { cn } from '@/utils/cn';

export type ProgressBarProps = ViewProps & {
  progress: number;
  height?: number;
  style?: ViewStyle;
};

export function ProgressBar({ progress, height = 8, className, style }: ProgressBarProps) {
  const [width, setWidth] = useState(0);
  const clamped = Math.max(0, Math.min(1, progress));
  const fill = useSharedValue(0);

  useEffect(() => {
    fill.value = withTiming(width * clamped, { duration: 520 });
  }, [width, clamped, fill]);

  const animatedStyle = useAnimatedStyle(() => ({ width: fill.value }));

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      className={cn('w-full bg-surface-muted dark:bg-surface-muted-dark rounded-full overflow-hidden', className)}
      style={[{ height }, style]}>
      <Animated.View
        className="bg-primary dark:bg-primary-dark rounded-full"
        style={[{ height }, animatedStyle]}
      />
    </View>
  );
}