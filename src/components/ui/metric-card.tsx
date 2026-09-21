import { TrendingDown, TrendingUp } from 'lucide-react-native';
import { Text, View, type ViewProps } from 'react-native';

import { useCountUp } from '@/hooks/use-count-up';
import { cn } from '@/utils/cn';

export type MetricCardProps = ViewProps & {
  label: string;
  value: string;
  delta?: number;
  icon?: React.ReactNode;
  goodWhenDown?: boolean;
  /** When provided, the value animates up to this number instead of showing `value` statically. */
  animateTo?: number;
  formatValue?: (value: number) => string;
};

const defaultFormat = (v: number) => String(Math.round(v));

function AnimatedMetricValue({ target, format }: { target: number; format: (v: number) => string }) {
  const text = useCountUp(target, format);
  return (
    <Text className="mt-1.5 text-h2 font-semibold text-primary-text dark:text-primary-text-dark" numberOfLines={1}>
      {text}
    </Text>
  );
}

export function MetricCard({
  label,
  value,
  delta,
  icon,
  goodWhenDown = false,
  animateTo,
  formatValue,
  className,
  ...rest
}: MetricCardProps) {
  const hasDelta = delta !== undefined;
  const isNeutral = !hasDelta || delta === 0;
  const isGood = hasDelta && (goodWhenDown ? delta < 0 : delta > 0);

  return (
    <View
      className={cn(
        'bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg p-4 flex-1 min-w-0',
        className,
      )}
      {...rest}
    >
      <View className="flex-row items-center justify-between gap-2">
        <Text className="text-caption text-secondary-text dark:text-secondary-text-dark flex-1 min-w-0" numberOfLines={1}>{label}</Text>
        {icon}
      </View>
      {animateTo !== undefined ? (
        <AnimatedMetricValue target={animateTo} format={formatValue ?? defaultFormat} />
      ) : (
        <Text className="mt-2 text-h2 font-semibold text-primary-text dark:text-primary-text-dark flex-1 min-w-0" numberOfLines={1}>
          {value}
        </Text>
      )}
      <View className="mt-2 flex-row items-center gap-1" accessibilityLabel={hasDelta ? `${delta}%` : undefined}>
        {hasDelta && delta > 0 && <TrendingUp size={14} color={isGood ? '#10B981' : '#EF4444'} />}
        {hasDelta && delta < 0 && <TrendingDown size={14} color={isGood ? '#10B981' : '#EF4444'} />}
        {hasDelta && (
          <Text className={cn('text-caption font-medium', !isNeutral ? (isGood ? 'text-success dark:text-success-dark' : 'text-danger dark:text-danger-dark') : 'text-secondary-text dark:text-secondary-text-dark')}>
            {delta}%
          </Text>
        )}
        {!hasDelta && <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">—</Text>}
      </View>
    </View>
  );
}