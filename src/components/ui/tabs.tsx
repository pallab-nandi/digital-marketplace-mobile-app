import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
  type LayoutChangeEvent,
  type ViewProps,
} from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { cn } from '@/utils/cn';

export type TabItem = {
  key: string;
  label: string;
};

export type TabsProps = ViewProps & {
  items: TabItem[];
  value: string;
  onChange: (key: string) => void;
  scrollable?: boolean;
};

type Measured = { x: number; width: number };

function TabButton({
  item,
  active,
  onPress,
  onMeasure,
}: {
  item: TabItem;
  active: boolean;
  onPress: () => void;
  onMeasure: (key: string, layout: { x: number; width: number }) => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onLayout={(e: LayoutChangeEvent) => onMeasure(item.key, e.nativeEvent.layout)}
      className="px-4 py-2.5">
      <Text
        className={cn(
          'text-small',
          active
            ? 'font-semibold text-primary dark:text-primary-dark'
            : 'text-secondary-text dark:text-secondary-text-dark',
        )}>
        {item.label}
      </Text>
    </Pressable>
  );
}

export function Tabs({ items, value, onChange, scrollable = true, className, ...rest }: TabsProps) {
  const [measurements, setMeasurements] = useState<Record<string, Measured>>({});
  const seeded = useRef(false);
  const left = useSharedValue(0);
  const width = useSharedValue(32);

  const active = measurements[value];
  const activeX = active?.x;
  const activeWidth = active?.width;

  useEffect(() => {
    if (activeX === undefined || activeWidth === undefined) return;
    const config = { duration: 240, easing: Easing.out(Easing.cubic) };
    left.value = withTiming(activeX, config);
    width.value = withTiming(activeWidth, config);
  }, [value, activeX, activeWidth, left, width]);

  const underlineStyle = useAnimatedStyle(() => ({ left: left.value, width: width.value }));

  const renderTab = (item: TabItem) => (
    <TabButton
      key={item.key}
      item={item}
      active={item.key === value}
      onPress={() => onChange(item.key)}
      onMeasure={(key, l) => {
        setMeasurements((m) => {
          const prev = m[key];
          return prev && prev.x === l.x && prev.width === l.width ? m : { ...m, [key]: l };
        });
        if (!seeded.current && key === value) {
          seeded.current = true;
          left.value = l.x;
          width.value = l.width;
        }
      }}
    />
  );

  return (
    <View className={cn('relative border-b border-border dark:border-border-dark', className)} {...rest}>
      {scrollable ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row">{items.map(renderTab)}</View>
        </ScrollView>
      ) : (
        <View className="flex-row">{items.map(renderTab)}</View>
      )}
      {activeX !== undefined && (
        <Animated.View
          pointerEvents="none"
          className="absolute bottom-0 h-0.5 rounded-full bg-primary dark:bg-primary-dark"
          style={underlineStyle}
        />
      )}
    </View>
  );
}