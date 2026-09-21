import { Check } from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';

import { Card, PageHeader, SectionHeader } from '@/components/ui';
import { Spacing } from '@/constants/theme';

const FAQ = [
  {
    q: 'How do I launch a campaign?',
    a: 'Go to Campaigns → New and walk through the 6-step wizard. The launch is simulated locally.',
  },
  {
    q: 'What does the AI assistant do?',
    a: 'Ask it about a campaign target, budget or creative direction — it suggests updates you can apply in one tap.',
  },
  {
    q: 'How do I work with a creator?',
    a: 'Browse the marketplace, compare profiles, then send a collaboration request from a profile page.',
  },
];

const FEATURES = [
  'Dashboard with live mock analytics',
  'Campaign planner with AI recommendations',
  'Creator marketplace with comparison',
  'Advanced analytics and insights',
  'Demo data reset at any time',
];

export default function AboutScreen() {
  return (
    <ScrollView
      className="flex-1 bg-background dark:bg-background-dark"
      contentContainerStyle={{ paddingBottom: Spacing.six }}
      showsVerticalScrollIndicator={false}>
      <PageHeader title="Help & About" subtitle="Demo build · v1.0.0" />

      <View className="px-4 gap-3">
        <SectionHeader title="What you can do" />
        <Card className="gap-2">
          {FEATURES.map((feature) => (
            <View key={feature} className="flex-row items-center gap-2">
              <Check size={15} color="#16A34A" />
              <Text className="flex-1 text-small text-primary-text dark:text-primary-text-dark">{feature}</Text>
            </View>
          ))}
        </Card>

        <SectionHeader title="Frequently asked" />
        <Card className="gap-3">
          {FAQ.map((item) => (
            <View key={item.q} className="gap-0.5">
              <Text className="text-body font-semibold text-primary-text dark:text-primary-text-dark">{item.q}</Text>
              <Text className="text-small text-secondary-text dark:text-secondary-text-dark leading-5">{item.a}</Text>
            </View>
          ))}
        </Card>

        <Text className="text-caption text-secondary-text dark:text-secondary-text-dark text-center px-4">
          Everything runs locally with mock data.
        </Text>
      </View>
    </ScrollView>
  );
}