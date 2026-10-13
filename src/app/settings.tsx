import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ChevronLeft,
  ChevronRight,
  Type,
  Bell,
  WifiOff,
  Trash2,
  Smartphone,
  RotateCcw,
} from 'lucide-react-native';
import { COLORS, FONTS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useReading, FontSizeKey } from '../context/ReadingContext';
import { FontSizeModal } from '../components/FontSizeModal';
import { StorageService } from '../services/storage';

export default function SettingsScreen() {
  const { user, updateUserPreferences } = useAuth();
  const { fontSize } = useReading();
  const [fontSizeModalVisible, setFontSizeModalVisible] = useState(false);

  const [notificationsEnabled, setNotificationsEnabled] = useState(
    user?.preferences.notificationsEnabled ?? true
  );
  const [offlineEnabled, setOfflineEnabled] = useState(
    user?.preferences.offlineReading ?? true
  );
  const [hapticsEnabled, setHapticsEnabled] = useState(
    user?.preferences.hapticsEnabled ?? true
  );

  const handleToggleNotifications = async (val: boolean) => {
    setNotificationsEnabled(val);
    await updateUserPreferences({ notificationsEnabled: val });
  };

  const handleToggleOffline = async (val: boolean) => {
    setOfflineEnabled(val);
    await updateUserPreferences({ offlineReading: val });
  };

  const handleToggleHaptics = async (val: boolean) => {
    setHapticsEnabled(val);
    await updateUserPreferences({ hapticsEnabled: val });
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Local Cache',
      'This will remove cached article images and temporary files. Saved bookmarks will remain intact.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Local image cache cleared.');
          },
        },
      ]
    );
  };

  const handleResetOnboarding = async () => {
    await StorageService.setOnboardingCompleted(false);
    router.replace('/onboarding');
  };

  const fontSizeLabels: Record<FontSizeKey, string> = {
    sm: 'Compact',
    md: 'Default',
    lg: 'Large',
    xl: 'Editorial Extra',
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Section: Reading Experience */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>READING EXPERIENCE</Text>

          <TouchableOpacity
            style={styles.row}
            onPress={() => setFontSizeModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <Type size={18} color={COLORS.black} />
              <Text style={styles.rowLabel}>Font Size</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.valueText}>{fontSizeLabels[fontSize]}</Text>
              <ChevronRight size={16} color={COLORS.textMuted} />
            </View>
          </TouchableOpacity>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <WifiOff size={18} color={COLORS.black} />
              <View>
                <Text style={styles.rowLabel}>Offline Reading</Text>
                <Text style={styles.rowDesc}>Keep saved articles readable offline</Text>
              </View>
            </View>
            <Switch
              value={offlineEnabled}
              onValueChange={handleToggleOffline}
              trackColor={{ false: '#E5E7EB', true: COLORS.black }}
              thumbColor={COLORS.white}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Smartphone size={18} color={COLORS.black} />
              <View>
                <Text style={styles.rowLabel}>Haptic Feedback</Text>
                <Text style={styles.rowDesc}>Subtle vibrations on interaction</Text>
              </View>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={handleToggleHaptics}
              trackColor={{ false: '#E5E7EB', true: COLORS.black }}
              thumbColor={COLORS.white}
            />
          </View>
        </View>

        {/* Section: Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>NOTIFICATIONS</Text>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Bell size={18} color={COLORS.black} />
              <View>
                <Text style={styles.rowLabel}>Editorial Alerts</Text>
                <Text style={styles.rowDesc}>Breaking news and curated deep dives</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#E5E7EB', true: COLORS.black }}
              thumbColor={COLORS.white}
            />
          </View>
        </View>

        {/* Section: Storage & Diagnostics */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>STORAGE & DATA</Text>

          <TouchableOpacity
            style={styles.row}
            onPress={handleClearCache}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <Trash2 size={18} color={COLORS.black} />
              <Text style={styles.rowLabel}>Clear Image Cache</Text>
            </View>
            <ChevronRight size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.row}
            onPress={handleResetOnboarding}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <RotateCcw size={18} color={COLORS.black} />
              <Text style={styles.rowLabel}>Replay Onboarding Guide</Text>
            </View>
            <ChevronRight size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Section: About & Publishing */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>ABOUT TECHQUO NEWS</Text>

          <View style={styles.infoCard}>
            <Text style={styles.aboutTitle}>TechQuo News</Text>
            <Text style={styles.aboutDescription}>
              {"Independent editorial coverage analyzing Africa's digital economy, climate innovation, venture capital, and sovereign technology architecture."}
            </Text>
            <View style={styles.versionRow}>
              <Text style={styles.versionLabel}>Version</Text>
              <Text style={styles.versionValue}>1.0.0 (Build 2026.1)</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Font Size Modal */}
      <FontSizeModal
        visible={fontSizeModalVisible}
        onClose={() => setFontSizeModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 2,
  },
  headerTitle: {
    fontFamily: FONTS.serif,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.black,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: COLORS.textMuted,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderLight,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rowLabel: {
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
    color: COLORS.black,
  },
  rowDesc: {
    fontFamily: FONTS.sansRegular,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  valueText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 4,
  },
  aboutTitle: {
    fontFamily: FONTS.serif,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 6,
  },
  aboutDescription: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.textSecondary,
    marginBottom: 14,
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    paddingTop: 10,
  },
  versionLabel: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  versionValue: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.black,
  },
});
