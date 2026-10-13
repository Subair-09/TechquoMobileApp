import { Platform } from 'react-native';

export const COLORS = {
  background: '#FFFFFF',
  surface: '#F5F6F7',
  surfaceDark: '#0D0E12',
  cardDark: '#17191E',
  borderDark: '#262931',
  textDarkMuted: '#8E95A2',
  textPrimary: '#000000',
  textSecondary: '#4A5059',
  textMuted: '#77808C',
  border: '#E5E7EB',
  borderLight: '#F0F1F3',
  accentBlue: '#2563EB',
  white: '#FFFFFF',
  black: '#000000',
  success: '#10B981',
  danger: '#EF4444',
};

export const FONTS = {
  serif: Platform.select({
    ios: 'DMSerifDisplay_400Regular',
    android: 'DMSerifDisplay_400Regular',
    default: 'DMSerifDisplay_400Regular, Georgia, serif',
  }),
  sansRegular: Platform.select({
    ios: 'Inter_400Regular',
    android: 'Inter_400Regular',
    default: 'Inter_400Regular, system-ui, sans-serif',
  }),
  sansMedium: Platform.select({
    ios: 'Inter_500Medium',
    android: 'Inter_500Medium',
    default: 'Inter_500Medium, system-ui, sans-serif',
  }),
  sansSemiBold: Platform.select({
    ios: 'Inter_600SemiBold',
    android: 'Inter_600SemiBold',
    default: 'Inter_600SemiBold, system-ui, sans-serif',
  }),
  sansBold: Platform.select({
    ios: 'Inter_700Bold',
    android: 'Inter_700Bold',
    default: 'Inter_700Bold, system-ui, sans-serif',
  }),
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const FONT_SIZES = {
  caption: 11,
  metadata: 12,
  bodySm: 14,
  body: 16,
  bodyLg: 18,
  titleSm: 18,
  titleMd: 22,
  titleLg: 26,
  headline: 32,
  display: 40,
};
