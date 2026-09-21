import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing } from '@/constants/theme';

export function AuthScaffold({
  children,
  footer,
  scroll = true,
}: {
  children: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
}) {
  const inner = (
    <SafeAreaView className="flex-1">
      <View
        className="flex-1 justify-center self-center w-full px-5"
        style={{ maxWidth: MaxContentWidth }}>
        {children}
      </View>
      {footer}
    </SafeAreaView>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-background dark:bg-background-dark">
      {scroll ? (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: Spacing.six }}
          keyboardShouldPersistTaps="handled">
          {inner}
        </ScrollView>
      ) : (
        inner
      )}
    </KeyboardAvoidingView>
  );
}