import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';

interface CategoryPillProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

export const CategoryPill: React.FC<CategoryPillProps> = ({ label, active, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.pill,
        active ? styles.pillActive : styles.pillInactive,
      ]}
    >
      <Text
        style={[
          styles.text,
          active ? styles.textActive : styles.textInactive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: COLORS.black,
  },
  pillInactive: {
    backgroundColor: COLORS.surface,
  },
  text: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    letterSpacing: 0.2,
  },
  textActive: {
    color: COLORS.white,
    fontFamily: FONTS.sansSemiBold,
  },
  textInactive: {
    color: COLORS.black,
  },
});
