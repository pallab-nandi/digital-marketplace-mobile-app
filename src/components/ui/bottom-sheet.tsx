import { Modal as RNModal, Pressable, SafeAreaView, Text, View } from 'react-native';

import { cn } from '@/utils/cn';

export type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

export function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
  return (
    <RNModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <SafeAreaView className="w-full bg-surface dark:bg-surface-dark rounded-t-lg">
          <Pressable className="h-6 items-center justify-center" onPress={onClose}>
            <View className="w-12 h-1 rounded-full bg-border dark:bg-border-dark" />
          </Pressable>
          {title && (
            <Text className="px-4 pb-2 text-h3 font-semibold text-primary-text dark:text-primary-text-dark">
              {title}
            </Text>
          )}
          <View className={cn('px-4 pb-6')}>{children}</View>
        </SafeAreaView>
      </View>
    </RNModal>
  );
}