import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Appearance, useColorScheme, StatusBar } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ToastProvider } from '@/components/ui';
import { StoreProvider, useStore, type ThemePreference } from '@/store';
import '../global.css';

SplashScreen.preventAutoHideAsync();

function resolveScheme(theme: ThemePreference, system: ReturnType<typeof useColorScheme>): 'light' | 'dark' {
  if (theme === 'system') return system === 'dark' ? 'dark' : 'light';
  return theme;
}

function RootNavigator() {
  const { state } = useStore();
  const loggedIn = state.currentUser != null;
  const onboarded = loggedIn && state.onboardingCompleted;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!loggedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={loggedIn && !onboarded}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>
      <Stack.Protected guard={loggedIn && onboarded}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="ai" />
        <Stack.Screen name="analytics/[id]" />
        <Stack.Screen name="appearance" />
        <Stack.Screen name="about" />
        <Stack.Screen name="business-settings" />
        <Stack.Screen name="plan" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="campaigns/[id]" />
        <Stack.Screen name="campaigns/new" />
        <Stack.Screen name="campaigns/success" />
        <Stack.Screen name="creators/[id]" />
        <Stack.Screen name="creators/compare" />
      </Stack.Protected>
    </Stack>
  );
}

function AppShell() {
  const { state } = useStore();
  const systemScheme = useColorScheme();
  const scheme = resolveScheme(state.appearance.theme, systemScheme);

  useEffect(() => {
    Appearance.setColorScheme(
      state.appearance.theme === 'system' ? 'unspecified' : state.appearance.theme,
    );
  }, [state.appearance.theme]);

  return (
    <>
      <StatusBar
        barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={scheme === 'dark' ? '#01161E' : '#F8FAFC'}
        translucent={false}
      />
      <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
        <ToastProvider>
          <AnimatedSplashOverlay />
          <RootNavigator />
        </ToastProvider>
      </ThemeProvider>
    </>
  );
}

export default function RootLayout() {
  return (
    <StoreProvider>
      <AppShell />
    </StoreProvider>
  );
}