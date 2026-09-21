import type { PropsWithChildren } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

type FadeInViewProps = PropsWithChildren<{
  delay?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}>;

/** Subtle one-shot entrance for chart blocks and section groups. */
export function FadeInView({ children, delay = 0, duration = 340, style }: FadeInViewProps) {
  return (
    <Animated.View entering={FadeIn.duration(duration).delay(delay)} style={style}>
      {children}
    </Animated.View>
  );
}