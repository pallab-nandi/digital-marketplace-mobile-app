import { View, type ViewProps } from 'react-native';

import { cn } from '@/utils/cn';

export type CardProps = ViewProps & {
  padded?: boolean;
  elevated?: boolean;
};

export function Card({ padded = true, elevated = false, className, style, ...rest }: CardProps) {
  return (
    <View
      className={cn(
        'bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl',
        padded && 'p-4',
        elevated && 'shadow-sm',
        className,
      )}
      style={style}
      {...rest}
    />
  );
}