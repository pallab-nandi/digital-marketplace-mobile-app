import { useRouter } from 'expo-router';
import { Save } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { Button, Card, Input, PageHeader } from '@/components/ui';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { getBusinessByUser } from '@/services';
import { useStore } from '@/store';

export default function BusinessSettingsScreen() {
  const router = useRouter();
  const { state, dispatch } = useStore();
  const business = state.currentUser ? getBusinessByUser(state.currentUser.id) : undefined;

  const [name, setName] = useState(business?.name ?? '');
  const [industry, setIndustry] = useState(business?.industry ?? '');
  const [location, setLocation] = useState(business?.location ?? '');
  const [website, setWebsite] = useState(business?.website ?? '');
  const [description, setDescription] = useState(business?.description ?? '');
  const [budget, setBudget] = useState(String(business?.monthlyBudget ?? 0));

  const budgetValue = Number(budget) || 0;

  const canSave = name.trim().length > 0 && budgetValue > 0;

  function handleSave() {
    if (!canSave) return;
    dispatch({
      type: 'UPDATE_BUSINESS',
      patch: {
        name: name.trim(),
        industry: industry.trim(),
        location: location.trim(),
        website: website.trim(),
        description: description.trim(),
        monthlyBudget: budgetValue,
      },
    });
    dispatch({ type: 'UPDATE_PROFILE', patch: { monthlyBudget: budgetValue, industry: industry.trim() } });
    router.back();
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-background dark:bg-background-dark">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', paddingBottom: Spacing.six }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <PageHeader title="Business settings" subtitle={business?.name} />

      <View className="px-4 gap-4">
        <Card className="gap-3">
          <Input label="Business name" value={name} onChangeText={setName} placeholder="Northstar Coffee" />
          <Input label="Industry" value={industry} onChangeText={setIndustry} placeholder="Food & Beverage" />
          <Input label="Location" value={location} onChangeText={setLocation} placeholder="Bangalore" />
          <Input label="Website" value={website} onChangeText={setWebsite} placeholder="https://example.com" keyboardType="url" />
          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="What does your business do?"
            multiline
            numberOfLines={3}
          />
          <Input
            label="Monthly budget (INR)"
            value={budget}
            onChangeText={setBudget}
            placeholder="100000"
            keyboardType="numeric"
            hint="Used as the default cap for campaign budgets."
          />
        </Card>

        <Button
          label="Save changes"
          fullWidth
          disabled={!canSave}
          leftIcon={<Save size={18} color="#FFFFFF" />}
          onPress={handleSave}
        />
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}