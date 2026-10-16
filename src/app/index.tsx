import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { COLORS, FONTS } from '../constants/theme';
import { StorageService } from '../services/storage';

export default function SplashScreen() {
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      // Allow user to see the refined splash screen for 1.8s while checking persistence
      await new Promise((resolve) => setTimeout(resolve, 1800));
      if (!isMounted) return;

      const [onboardingCompleted, savedUser, savedToken] = await Promise.all([
        StorageService.isOnboardingCompleted(),
        StorageService.getUserProfile(),
        StorageService.getAuthToken(),
      ]);

      if (!onboardingCompleted) {
        router.replace('/onboarding');
      } else if (savedUser && savedToken && savedUser.isEmailVerified) {
        router.replace('/(tabs)');
      } else {
        router.replace('/auth/signin');
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Subtle organic background wave contours */}
      <View style={styles.svgBackground}>
        <Svg width="100%" height="100%" viewBox="0 0 375 812" preserveAspectRatio="none">
          <Path
            d="M -50 200 C 120 180, 260 320, 420 280 C 460 270, 400 650, 420 850 L -50 850 Z"
            fill="#F8F9FA"
            opacity={0.8}
          />
          <Path
            d="M -50 500 C 80 480, 190 620, 420 560 L 420 850 L -50 850 Z"
            fill="#F1F3F5"
            opacity={0.5}
          />
        </Svg>
      </View>

      <View style={styles.centerContent}>
        <View style={styles.wordmarkRow}>
          <Text style={styles.wordmark}>TECHQUO</Text>
        </View>
        <View style={styles.wordmarkSecondRow}>
          <Text style={styles.wordmark}>NEWS</Text>
          <View style={styles.blueDot} />
        </View>

        <Text style={styles.subtitle}>TECH  /  INNOVATION  /  AFRICA</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.tagline}>Your daily dose of tech and innovation.</Text>
        <ActivityIndicator size="small" color={COLORS.black} style={styles.spinner} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  },
  svgBackground: {
    ...StyleSheet.absoluteFill,
    zIndex: 0,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wordmarkSecondRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: -8,
  },
  wordmark: {
    fontFamily: FONTS.serif,
    fontSize: 44,
    color: COLORS.black,
    fontWeight: '800',
    letterSpacing: -1,
  },
  blueDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: COLORS.accentBlue,
    marginLeft: 3,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: FONTS.sansMedium,
    fontSize: 10,
    letterSpacing: 3,
    color: COLORS.textMuted,
    marginTop: 18,
    textTransform: 'uppercase',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
    zIndex: 1,
  },
  tagline: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 16,
  },
  spinner: {
    transform: [{ scale: 0.8 }],
  },
});
