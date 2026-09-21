import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { AuthScaffold } from '@/features/auth/auth-scaffold';
import { BrandMark } from '@/features/auth/brand-mark';
import { Button } from '@/components/ui';

export default function WelcomeScreen() {
  return (
    <AuthScaffold>
      <View className="gap-8">
        <BrandMark />

        <View className="gap-3 items-center">
          <Text className="text-h1 font-bold text-primary-text dark:text-primary-text-dark text-center">
            Marketing, simplified.
          </Text>
          <Text className="text-body text-secondary-text dark:text-secondary-text-dark text-center leading-6">
            Plan campaigns, understand performance, and find creative talent from one place.
          </Text>
        </View>

        <View className="gap-3 mt-4">
          <Button label="Get Started" size="lg" fullWidth onPress={() => router.push('/(auth)/login')} />
          <Button
            label="Browse demo accounts"
            size="lg"
            variant="outline"
            fullWidth
            onPress={() => router.push('/(auth)/demo-users')}
          />
        </View>
      </View>
    </AuthScaffold>
  );
}