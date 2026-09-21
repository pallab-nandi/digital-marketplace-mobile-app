import { useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Polygon, Stop } from 'react-native-svg';

export type TrendChartProps = {
  data: number[];
  labels?: string[];
  color?: string;
  height?: number;
  formatValue?: (value: number) => string;
};

const GRID_ROWS = 3;

export function TrendChart({
  data,
  labels = [],
  color = '#5B5CE2',
  height = 180,
  formatValue = (v) => String(Math.round(v)),
}: TrendChartProps) {
  const [width, setWidth] = useState(0);

  if (data.length === 0) return null;

  const maxValue = Math.max(...data, 1);
  const minValue = Math.min(...data, 0);
  const domain = maxValue - minValue === 0 ? 1 : maxValue - minValue;

  const padding = { top: 8, right: 8, bottom: 20, left: 8 };
  const chartWidth = Math.max(width - padding.left - padding.right, 1);
  const chartHeight = height - padding.top - padding.bottom;

  const xFor = (i: number) => {
    if (data.length === 1) return chartWidth / 2;
    return padding.left + (i / (data.length - 1)) * chartWidth;
  };
  const yFor = (v: number) => padding.top + (1 - (v - minValue) / domain) * chartHeight;

  const points = data.map((v, i) => `${xFor(i)},${yFor(v)}`).join(' ');
  const linePath = `M ${points.replace(/,/g, ' ').split(' ').map((p, i) => (i % 2 === 0 ? (i === 0 ? '' : 'L ') + p : p)).join(' ')}`;
  const areaPoints = `${padding.left},${chartHeight + padding.top} ${points} ${padding.left + chartWidth},${chartHeight + padding.top}`;
  const lastX = xFor(data.length - 1);
  const lastY = yFor(data[data.length - 1]);

  const gridLines = Array.from({ length: GRID_ROWS + 1 }, (_, i) => {
    const v = minValue + (domain * i) / GRID_ROWS;
    return { y: padding.top + chartHeight - (chartHeight * i) / GRID_ROWS, value: v };
  });

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={color} stopOpacity={0.28} />
              <Stop offset="1" stopColor={color} stopOpacity={0} />
            </LinearGradient>
          </Defs>

          {gridLines.map((g) => (
            <Line
              key={g.y}
              x1={padding.left}
              x2={width - padding.right}
              y1={g.y}
              y2={g.y}
              stroke="#E5E7EB"
              strokeWidth={1}
            />
          ))}

          <Polygon points={areaPoints} fill="url(#trendFill)" />
          <Path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          <Circle cx={lastX} cy={lastY} r={4} fill={color} />
        </Svg>
      )}

      {labels.length > 0 && chartWidth > 0 && (
        <View className="flex-row justify-between px-2">
          {[0, Math.floor((labels.length - 1) / 2), labels.length - 1].map((i, idx) => (
            <Text key={idx} className="text-caption text-secondary-text dark:text-secondary-text-dark">
              {labels[i]}
            </Text>
          ))}
        </View>
      )}

      <View className="mt-2 flex-row justify-between -mx-1">
        <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">{formatValue(0)}</Text>
        <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">{formatValue(maxValue)}</Text>
      </View>
    </View>
  );
}