import { router } from 'expo-router';
import { Lock, Mail, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AuthScaffold } from '@/features/auth/auth-scaffold';
import { BrandMark } from '@/features/auth/brand-mark';
import { Button, Input, useToast } from '@/components/ui';
import { useStore } from '@/store';

export default function LoginScreen() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleLogin() {
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('Enter your email and password to continue.');
      return;
    }
    const found = state.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!found) {
      setError('Demo account not found. Use a demo email or continue as a demo user.');
      return;
    }
    dispatch({ type: 'LOGIN', userId: found.id });
    router.replace('/');
  }

  function handleDemoLogin() {
    dispatch({ type: 'LOGIN', userId: 'user_001' });
    router.replace('/');
  }

  return (
    <AuthScaffold
      footer={
        <View className="pb-6 items-center">
          <Text className="text-caption text-secondary-text dark:text-secondary-text-dark">
            Don&apos;t have an account?{' '}
            <Text className="text-primary dark:text-primary-dark font-semibold" onPress={() => router.push('/(auth)/signup')}>
              Sign up
            </Text>
          </Text>
        </View>
      }>
      <View className="gap-6">
        <BrandMark compact />
        <View className="gap-1.5 items-center">
          <Text className="text-h2 font-bold text-primary-text dark:text-primary-text-dark text-center">
            Welcome back
          </Text>
          <Text className="text-body text-secondary-text dark:text-secondary-text-dark text-center">
            Log in to your marketing command center.
          </Text>
        </View>

        <View className="gap-4 mt-2">
          <Input
            label="Email"
            placeholder="you@example.demo"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            leftIcon={<Mail size={18} color="#69707D" />}
          />
          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon={<Lock size={18} color="#69707D" />}
          />
          {error && <Text className="text-caption text-danger dark:text-danger-dark">{error}</Text>}

          <Button
            label="Log In"
            size="lg"
            fullWidth
            loading={submitting}
            onPress={() => {
              setSubmitting(true);
              setTimeout(() => {
                setSubmitting(false);
                handleLogin();
              }, 400);
            }}
          />

          <Button
            label="Continue as Demo User"
            size="lg"
            variant="outline"
            fullWidth
            leftIcon={<Sparkles size={18} color="#5B5CE2" />}
            onPress={handleDemoLogin}
          />

          <Pressable
            onPress={() => toast.show({ title: 'Demo mode', message: 'Password reset is disabled in the demo.' })}
            className="items-center py-1">
            <Text className="text-small text-primary dark:text-primary-dark font-medium">
              Forgot password?
            </Text>
          </Pressable>
        </View>
      </View>
    </AuthScaffold>
  );
}