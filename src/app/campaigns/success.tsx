import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2, LayoutDashboard, Rocket } from 'lucide-react-native';
import { Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { Badge, Button, Card } from '@/components/ui';
import { useStore } from '@/store';

function formatINR(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`;
}

export default function CampaignSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { state } = useStore();

  const campaign = state.campaigns.find((c) => c.id === params.id);
  const rows = state.campaignPlatforms.filter((cp) => cp.campaignId === params.id);

  return (
    <View className="flex-1 bg-background dark:bg-background-dark items-center justify-center px-6">
      <Animated.View
        entering={ZoomIn.duration(420)}
        className="w-16 h-16 rounded-full items-center justify-center bg-success/10 dark:bg-success-dark/15">
        <CheckCircle2 size={34} color="#16A34A" />
      </Animated.View>
      <Animated.Text
        entering={FadeInDown.duration(400).delay(140)}
        className="text-h1 font-bold text-primary-text dark:text-primary-text-dark mt-4 text-center">
        Campaign launched
      </Animated.Text>
      <Animated.Text
        entering={FadeInDown.duration(400).delay(220)}
        className="text-body text-secondary-text dark:text-secondary-text-dark mt-1 text-center">
        Your campaign is now live and tracking in the dashboard.
      </Animated.Text>

      {campaign && (
        <Animated.View
          entering={FadeInDown.duration(400).delay(300)}
          className="w-full">
      <Card className="w-full mt-6">
          <View className="flex-row items-center justify-between">
            <Text className="text-body font-semibold text-primary-text dark:text-primary-text-dark flex-1" numberOfLines={1}>
              {campaign.name}
            </Text>
            <Badge label="Active" tone="success" dot />
          </View>
          <View className="flex-row items-center gap-2 mt-3">
            <Rocket size={14} color="#69707D" />
            <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
              {formatINR(campaign.totalBudget)} · {rows.length} platform{rows.length === 1 ? '' : 's'}
            </Text>
          </View>
          <View className="flex-row flex-wrap gap-1.5 mt-3">
            {rows.map((row) => (
              <View key={row.id} className="bg-surface-muted dark:bg-surface-muted-dark rounded-full px-2.5 py-1">
                <Text className="text-caption text-primary-text dark:text-primary-text-dark">{row.platformId}</Text>
              </View>
            ))}
          </View>
        </Card>
        </Animated.View>
      )}

      <Button
        label="View campaign"
        fullWidth
        className="mt-6"
        leftIcon={<Rocket size={18} color="#FFFFFF" />}
        onPress={() => router.replace({ pathname: '/campaigns/[id]', params: { id: params.id } })}
      />
      <Button
        label="Go to dashboard"
        variant="outline"
        fullWidth
        className="mt-3"
        leftIcon={<LayoutDashboard size={18} color="#69707D" />}
        onPress={() => router.replace('/(tabs)')}
      />
    </View>
  );
}