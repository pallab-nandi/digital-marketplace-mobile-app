import { Pressable, Text, View } from 'react-native';

export type ComparisonBarsItem = {
  key: string;
  label: string;
  value: number;
  caption?: string;
  color?: string;
  onPress?: () => void;
};

export type ComparisonBarsProps = {
  data: ComparisonBarsItem[];
  formatValue?: (value: number) => string;
  barHeight?: number;
};

export function ComparisonBars({
  data,
  formatValue = (v) => String(Math.round(v)),
  barHeight = 8,
}: ComparisonBarsProps) {
  if (data.length === 0) return null;
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <View className="gap-3">
      {data.map((d) => {
        const pct = Math.min(100, (d.value / maxValue) * 100);
        const value = d.onPress ? (
          <Pressable onPress={d.onPress} accessibilityRole="button" hitSlop={8} className="active:opacity-80">
            <Text className="text-small font-semibold text-primary-text dark:text-primary-text-dark">
              {formatValue(d.value)}
            </Text>
          </Pressable>
        ) : (
          <Text className="text-small font-semibold text-primary-text dark:text-primary-text-dark">
            {formatValue(d.value)}
          </Text>
        );

        return (
          <Pressable key={d.key} onPress={d.onPress} disabled={!d.onPress} className={d.onPress ? 'active:opacity-70' : ''}>
            <View className="flex-row items-center justify-between gap-3 mb-1">
              <View className="flex-1">
                <Text className="text-body font-medium text-primary-text dark:text-primary-text-dark" numberOfLines={1}>
                  {d.label}
                </Text>
                {d.caption && (
                  <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">{d.caption}</Text>
                )}
              </View>
              {value}
            </View>
            <View className="w-full bg-surface-muted dark:bg-surface-muted-dark rounded-full overflow-hidden">
              <View
                className="bg-primary dark:bg-primary-dark rounded-full"
                style={{ height: barHeight, width: `${pct}%`, backgroundColor: d.color ?? undefined }}
              />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}