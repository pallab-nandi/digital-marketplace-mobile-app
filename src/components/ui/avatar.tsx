import { Image } from 'expo-image';
import { Text, View, type ImageStyle, type StyleProp } from 'react-native';

import { cn } from '@/utils/cn';

export type AvatarProps = {
  source?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ImageStyle>;
};

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
} as const;

const textClasses = {
  sm: 'text-small',
  md: 'text-body',
  lg: 'text-h3',
} as const;

function initials(name?: string) {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function Avatar({ source, name, size = 'md', style }: AvatarProps) {
  if (source) {
    return (
      <Image
        source={source}
        className={cn('rounded-full bg-surface-muted dark:bg-surface-muted-dark', sizeClasses[size])}
        style={style}
        contentFit="cover"
      />
    );
  }

  return (
    <View
      className={cn(
        'rounded-full bg-primary/15 dark:bg-primary-dark/20 items-center justify-center',
        sizeClasses[size],
      )}
      style={style}
    >
      <Text className={cn('font-semibold text-primary dark:text-primary-dark', textClasses[size])}>
        {initials(name)}
      </Text>
    </View>
  );
}