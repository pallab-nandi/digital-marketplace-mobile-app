import { LucideIcon, Megaphone } from 'lucide-react-native';
import { Text, View } from 'react-native';

export function BrandMark({
  compact = false,
  icon: Icon = Megaphone,
}: {
  compact?: boolean;
  icon?: LucideIcon;
}) {
  return (
    <View className="items-center gap-3">
      <View className="items-center justify-center rounded-[20px] bg-primary dark:bg-primary-dark shadow-sm w-[72px] h-[72px]">
        <Icon size={34} color="#FFFFFF" strokeWidth={2.2} />
      </View>
      {!compact && (
        <Text className="text-h3 font-bold text-primary-text dark:text-primary-text-dark text-center">
          Digital MarketingPlace
        </Text>
      )}
    </View>
  );
}