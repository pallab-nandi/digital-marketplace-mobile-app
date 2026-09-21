import { router } from 'expo-router';
import { Lock, Mail, User } from 'lucide-react-native';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { AuthScaffold } from '@/features/auth/auth-scaffold';
import { BrandMark } from '@/features/auth/brand-mark';
import { Button, Input } from '@/components/ui';
import { useStore } from '@/store';

export default function SignupScreen() {
  const { dispatch } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleSignup() {
    setError(null);
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    dispatch({ type: 'SIGNUP', name: name.trim(), email: email.trim().toLowerCase() });
    router.replace('/(onboarding)');
  }

  return (
    <AuthScaffold
      footer={
        <View className="pb-6 items-center">
          <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
            Already have an account?{' '}
            <Text className="text-primary dark:text-primary-dark font-semibold" onPress={() => router.back()}>
              Log in
            </Text>
          </Text>
        </View>
      }>
      <View className="gap-6">
        <BrandMark compact />
        <View className="gap-1.5 items-center">
          <Text className="text-h2 font-bold text-primary-text dark:text-primary-text-dark text-center">
            Create your account
          </Text>
          <Text className="text-body text-secondary-text dark:text-secondary-text-dark text-center">
            Set up your business in under a minute.
          </Text>
        </View>

        <View className="gap-4 mt-2">
          <Input
            label="Full name"
            placeholder="Alex Morgan"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            leftIcon={<User size={18} color="#69707D" />}
          />
          <Input
            label="Business email"
            placeholder="you@example.demo"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            leftIcon={<Mail size={18} color="#69707D" />}
          />
          <Input
            label="Password"
            placeholder="At least 6 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon={<Lock size={18} color="#69707D" />}
          />
          {error && <Text className="text-caption text-danger dark:text-danger-dark">{error}</Text>}

          <Button
            label="Create Account"
            size="lg"
            fullWidth
            loading={submitting}
            onPress={() => {
              setSubmitting(true);
              setTimeout(() => {
                setSubmitting(false);
                handleSignup();
              }, 400);
            }}
          />
        </View>
      </View>
    </AuthScaffold>
  );
}