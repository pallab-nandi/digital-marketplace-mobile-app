import { X } from 'lucide-react-native';
import { Modal as RNModal, Pressable, ScrollView, Text, View, type ViewStyle } from 'react-native';

export type ModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  style?: ViewStyle;
};

export function Modal({ visible, onClose, title, children, footer }: ModalProps) {
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-center px-4 py-10">
        <View className="bg-surface dark:bg-surface-dark rounded-lg overflow-hidden">
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-border dark:border-border-dark">
            {title ? (
              <Text className="text-h3 font-semibold text-primary-text dark:text-primary-text-dark">
                {title}
              </Text>
            ) : (
              <View />
            )}
            <Pressable onPress={onClose} accessibilityRole="button" hitSlop={8}>
              <X size={20} className="text-secondary-text dark:text-secondary-text-dark" />
            </Pressable>
          </View>
          <ScrollView className="p-4">{children}</ScrollView>
          {footer && <View className="px-4 py-3 border-t border-border dark:border-border-dark">{footer}</View>}
        </View>
      </View>
    </RNModal>
  );
}