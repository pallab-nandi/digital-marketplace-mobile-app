/**
 * Design tokens per agent_docs/DESIGN.md.
 * Keep backward-compatible keys (text/background/backgroundElement/...) used by
 * template components while exposing the full product palette.
 */

import { Platform } from 'react-native';

export const lightPalette = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F5F9',
  text: '#01161E',
  textSecondary: '#475569',
  border: '#E2E8F0',
  primary: '#00F6EF',
  primaryMuted: '#CCFBFE',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#00F6EF',
} as const;

export const darkPalette = {
  background: '#01161E',
  surface: '#0A1F2E',
  surfaceMuted: '#112B3A',
  text: '#F0FDFF',
  textSecondary: '#7DD3D9',
  border: '#1E3A4A',
  primary: '#00F6EF',
  primaryMuted: '#005A5E',
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',
  info: '#00F6EF',
} as const;

/** Backward-compatible aliases used by template components. */
export const Colors = {
  light: {
    ...lightPalette,
    backgroundElement: lightPalette.surfaceMuted,
    backgroundSelected: '#E2E8F0',
  },
  dark: {
    ...darkPalette,
    backgroundElement: darkPalette.surfaceMuted,
    backgroundSelected: '#1E3A4A',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export type PaletteColor = keyof typeof lightPalette;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

/** 8-point spacing system. */
export const Spacing = {
  half: 2,
  one: 4,
  oneHalf: 6,
  two: 8,
  twoHalf: 10,
  three: 12,
  threeHalf: 14,
  four: 16,
  five: 20,
  six: 24,
  seven: 28,
  eight: 32,
  nine: 36,
  ten: 40,
  eleven: 44,
  twelve: 48,
  fourteen: 56,
  sixteen: 64,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
} as const;

export const Typography = {
  display: { fontSize: 32, lineHeight: 40 },
  h1: { fontSize: 28, lineHeight: 36 },
  h2: { fontSize: 24, lineHeight: 32 },
  h3: { fontSize: 20, lineHeight: 28 },
  body: { fontSize: 16, lineHeight: 24 },
  small: { fontSize: 14, lineHeight: 20 },
  caption: { fontSize: 12, lineHeight: 16 },
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;