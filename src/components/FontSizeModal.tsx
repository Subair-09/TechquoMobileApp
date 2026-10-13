import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';
import { FontSizeKey, useReading } from '../context/ReadingContext';
import { Check, X } from 'lucide-react-native';

interface FontSizeModalProps {
  visible: boolean;
  onClose: () => void;
}

const SIZES: { key: FontSizeKey; label: string; sampleSize: number }[] = [
  { key: 'sm', label: 'Compact', sampleSize: 14 },
  { key: 'md', label: 'Default', sampleSize: 16 },
  { key: 'lg', label: 'Large', sampleSize: 18 },
  { key: 'xl', label: 'Editorial Extra', sampleSize: 21 },
];

export const FontSizeModal: React.FC<FontSizeModalProps> = ({ visible, onClose }) => {
  const { fontSize, setFontSize } = useReading();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Typography & Text Size</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={20} color={COLORS.black} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Adjust reading typography for maximum legibility and comfort.
          </Text>

          <View style={styles.optionsList}>
            {SIZES.map((item) => {
              const isSelected = fontSize === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                  onPress={() => setFontSize(item.key)}
                >
                  <View style={styles.labelCol}>
                    <Text style={styles.optionLabel}>{item.label}</Text>
                    <Text
                      style={[
                        styles.sampleText,
                        { fontSize: item.sampleSize },
                      ]}
                      numberOfLines={1}
                    >
                      The Intelligence of Living
                    </Text>
                  </View>
                  {isSelected && <Check size={18} color={COLORS.black} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontFamily: FONTS.serif,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.black,
  },
  subtitle: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 18,
  },
  optionsList: {
    gap: 10,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionRowSelected: {
    borderColor: COLORS.black,
    backgroundColor: '#FFFFFF',
  },
  labelCol: {
    flex: 1,
    marginRight: 10,
  },
  optionLabel: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 13,
    color: COLORS.black,
    marginBottom: 4,
  },
  sampleText: {
    fontFamily: FONTS.serif,
    color: COLORS.textSecondary,
  },
});
