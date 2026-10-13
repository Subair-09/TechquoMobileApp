import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  inverted?: boolean;
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  inverted = false,
  showSubtitle = false,
}) => {
  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return 17;
      case 'md':
        return 22;
      case 'lg':
        return 32;
      case 'hero':
        return 42;
    }
  };

  const textColor = inverted ? COLORS.white : COLORS.black;
  const fontSize = getFontSize();
  const dotSize = Math.max(4, Math.round(fontSize * 0.22));

  return (
    <View style={styles.container}>
      <View style={styles.wordmarkRow}>
        <Text style={[styles.wordmark, { fontSize, color: textColor }]}>
          TECHQUO NEWS
        </Text>
        <View
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: COLORS.accentBlue,
              marginBottom: fontSize * 0.12,
            },
          ]}
        />
      </View>
      {showSubtitle && (
        <Text style={[styles.subtitle, inverted && styles.subtitleInverted]}>
          TECH  /  INNOVATION  /  AFRICA
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  wordmark: {
    fontFamily: FONTS.serif,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  dot: {
    marginLeft: 2,
  },
  subtitle: {
    fontFamily: FONTS.sansMedium,
    fontSize: 9,
    letterSpacing: 2,
    color: COLORS.textMuted,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  subtitleInverted: {
    color: '#8E95A2',
  },
});
