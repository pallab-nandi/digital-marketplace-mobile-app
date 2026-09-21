import { useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';

export type BarDatum = {
  label: string;
  value: number;
  color?: string;
};

export type BarChartProps = {
  data: BarDatum[];
  height?: number;
};

const GRID_ROWS = 2;

export function BarChart({ data, height = 160 }: BarChartProps) {
  const [width, setWidth] = useState(0);

  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const padding = { top: 14, right: 8, bottom: 22, left: 8 };
  const chartWidth = Math.max(width - padding.left - padding.right, 1);
  const chartHeight = height - padding.top - padding.bottom;
  const slot = chartWidth / data.length;
  const barWidth = Math.min(28, Math.max(12, slot * 0.55));

  const gridLines = Array.from({ length: GRID_ROWS + 1 }, (_, i) => {
    const v = (maxValue * i) / GRID_ROWS;
    return { y: padding.top + chartHeight - (chartHeight * i) / GRID_ROWS, value: v };
  });

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && (
        <Svg width={width} height={height}>
          {gridLines.map((g) => (
            <Line
              key={g.y}
              x1={padding.left}
              x2={width - padding.right}
              y1={g.y}
              y2={g.y}
              stroke="#E5E7EB"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          ))}

          {data.map((d, i) => {
            const barHeight = maxValue > 0 ? (d.value / maxValue) * chartHeight : 0;
            const x = padding.left + slot * i + (slot - barWidth) / 2;
            const y = padding.top + chartHeight - barHeight;
            return (
              <Rect
                key={i}
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, d.value > 0 ? 2 : 0)}
                rx={4}
                fill={d.color ?? '#5B5CE2'}
              />
            );
          })}
        </Svg>
      )}

      {data.length > 0 && width > 0 && (
        <View className="flex-row" pointerEvents="none">
          {data.map((d, i) => {
            const maxLabelLen = 6;
            const label = d.label.length > maxLabelLen ? `${d.label.slice(0, maxLabelLen)}…` : d.label;
            return (
              <View key={i} className="flex-1 items-center">
                <Text className="text-caption text-secondary-text dark:text-secondary-text-dark" numberOfLines={1}>
                  {label}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}