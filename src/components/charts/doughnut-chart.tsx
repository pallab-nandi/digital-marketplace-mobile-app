import { Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export type DoughnutDatum = {
  label: string;
  value: number;
  color: string;
};

export type DoughnutChartProps = {
  data: DoughnutDatum[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
};

function pointOnCircle(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function DoughnutChart({
  data,
  size = 168,
  thickness = 26,
  centerLabel,
  centerValue,
}: DoughnutChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - thickness) / 2 - 2;

  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total <= 0 || data.length === 0) {
    return (
      <View style={{ width: size, height: size }} className="items-center justify-center">
        <View
          className="rounded-full bg-surface-muted dark:bg-surface-muted-dark"
          style={{ width: size, height: size }}
        />
      </View>
    );
  }

  const gapDeg = data.length > 1 ? 2 : 0;
  const cumulative: number[] = [];
  let acc = 0;
  for (const d of data) {
    acc += d.value;
    cumulative.push(acc);
  }
  const segments = data.flatMap((d, i) => {
    const frac = d.value / total;
    const sweep = frac * 360;
    if (sweep <= 0.5) return [];
    const start = -90 + (i === 0 ? 0 : (cumulative[i - 1] / total) * 360) - gapDeg / 2;
    const end = start + sweep - gapDeg;
    const p1 = pointOnCircle(cx, cy, r, start);
    const p2 = pointOnCircle(cx, cy, r, end);
    const largeArc = sweep - gapDeg > 180 ? 1 : 0;
    return [
      {
        color: d.color,
        path: `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
      },
    ];
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {segments.map((s, i) => (
          <Path key={i} d={s.path} stroke={s.color} strokeWidth={thickness} fill="none" />
        ))}
      </Svg>
      {(centerLabel || centerValue) && (
        <View className="absolute inset-0 items-center justify-center px-4">
          {centerValue !== undefined && (
            <Text className="text-h2 font-bold text-primary-text dark:text-primary-text-dark">{centerValue}</Text>
          )}
          {centerLabel && (
            <Text className="text-caption text-secondary-text dark:text-secondary-text-dark mt-0.5 text-center">
              {centerLabel}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}