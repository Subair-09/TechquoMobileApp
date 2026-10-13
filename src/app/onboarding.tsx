import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { COLORS, FONTS } from '../constants/theme';
import { MonochromeIllustration } from '../components/MonochromeIllustration';
import { StorageService } from '../services/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SlideData {
  id: string;
  pageIndicator: string;
  type: 'latest' | 'categories' | 'reading';
  headline: string;
  description: string;
  buttonLabel: string;
  secondaryActionType: 'skip' | 'signin';
}

const SLIDES: SlideData[] = [
  {
    id: '1',
    pageIndicator: '1 / 3',
    type: 'latest',
    headline: 'The Latest\nTech News',
    description:
      'Get the most important stories and updates from the world of technology, innovation and Africa — all in one place.',
    buttonLabel: 'Next →',
    secondaryActionType: 'skip',
  },
  {
    id: '2',
    pageIndicator: '2 / 3',
    type: 'categories',
    headline: 'Explore\nby Category',
    description:
      'Dive into topics that matter to you. From Tech and Business to Startups and FinTech, find what interests you most.',
    buttonLabel: 'Next →',
    secondaryActionType: 'skip',
  },
  {
    id: '3',
    pageIndicator: '3 / 3',
    type: 'reading',
    headline: 'Read, Save &\nStay Updated',
    description:
      'Save your favorite articles, get personalized recommendations, and never miss the stories that matter.',
    buttonLabel: 'Get Started →',
    secondaryActionType: 'signin',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<SlideData>>(null);

  const handleFinishOnboarding = async (targetRoute: '/(tabs)' | '/auth/signin' = '/(tabs)') => {
    await StorageService.setOnboardingCompleted(true);
    router.replace(targetRoute);
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      handleFinishOnboarding();
    }
  };

  const handleSkip = () => {
    handleFinishOnboarding();
  };

  const handleSignIn = () => {
    handleFinishOnboarding('/auth/signin');
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== currentIndex && index >= 0 && index < SLIDES.length) {
      setCurrentIndex(index);
    }
  };

  const currentSlide = SLIDES[currentIndex] || SLIDES[0];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar with Page Indicator */}
      <View style={styles.topBar}>
        <View style={{ width: 40 }} />
        <Text style={styles.pageIndicator}>{currentSlide.pageIndicator}</Text>
      </View>

      {/* Swipeable Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <View style={styles.illustrationContainer}>
              <MonochromeIllustration type={item.type} />
            </View>

            <View style={styles.contentContainer}>
              <Text style={styles.headline}>{item.headline}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        )}
      />

      {/* Action Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.primaryButton}
          onPress={handleNext}
        >
          <Text style={styles.primaryButtonText}>{currentSlide.buttonLabel}</Text>
        </TouchableOpacity>

        {currentSlide.secondaryActionType === 'skip' ? (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleSkip}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.signInRow}>
            <Text style={styles.alreadyAccountText}>Already have an account? </Text>
            <TouchableOpacity onPress={handleSignIn}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 4,
  },
  pageIndicator: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  slide: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  contentContainer: {
    alignItems: 'flex-start',
    width: '100%',
  },
  headline: {
    fontFamily: FONTS.serif,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 14,
  },
  description: {
    fontFamily: FONTS.sansRegular,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textMuted,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.black,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 15,
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  secondaryButton: {
    paddingVertical: 6,
  },
  skipText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  signInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  alreadyAccountText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  signInLink: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 13,
    color: COLORS.black,
  },
});
