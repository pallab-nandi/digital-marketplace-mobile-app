import { Search, X } from 'lucide-react-native';

import { Input, type InputProps } from '@/components/ui/input';

export type SearchInputProps = Omit<InputProps, 'leftIcon' | 'rightIcon'> & {
  onClear?: () => void;
  showClear?: boolean;
};

export function SearchInput({ onClear, showClear, value, ...rest }: SearchInputProps) {
  return (
    <Input
      placeholder="Search..."
      value={value}
      leftIcon={<Search size={18} className="text-secondary-text dark:text-secondary-text-dark" />}
      rightIcon={
        showClear && value ? (
          <X size={18} className="text-secondary-text dark:text-secondary-text-dark" onPress={onClear} />
        ) : undefined
      }
      {...rest}
    />
  );
}