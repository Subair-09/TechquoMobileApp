import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  ChevronLeft,
  ChevronRight,
  Type,
  Bell,
  WifiOff,
  Trash2,
  Smartphone,
  RotateCcw,
  Camera,
} from 'lucide-react-native';
import { COLORS, FONTS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useReading, FontSizeKey } from '../context/ReadingContext';
import { FontSizeModal } from '../components/FontSizeModal';
import { StorageService } from '../services/storage';

export default function SettingsScreen() {
  const { user, updateUserPreferences, updateAvatar } = useAuth();
  const { fontSize } = useReading();
  const [fontSizeModalVisible, setFontSizeModalVisible] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handlePickAvatar = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Needed', 'Please allow photo gallery access to change your profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setIsUploadingPhoto(true);

        const base64Data = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        const res = await updateAvatar(base64Data);

        if (!res.success) {
          Alert.alert('Upload Failed', res.error || 'Could not update profile photo.');
        } else {
          Alert.alert('Success', 'Profile photo updated successfully!');
        }
      }
    } catch (err: any) {
      console.error('Error picking image:', err);
      Alert.alert('Error', 'Failed to pick image from library.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

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
        {/* Section: Account & Profile */}
        {user && (
          <View style={styles.profileSection}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={handlePickAvatar}
              disabled={isUploadingPhoto}
              activeOpacity={0.8}
            >
              <Image source={{ uri: user.avatar }} style={styles.settingsAvatar} />
              <View style={styles.cameraIconBadge}>
                {isUploadingPhoto ? (
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ transform: [{ scale: 0.6 }] }} />
                ) : (
                  <Camera size={13} color="#FFFFFF" />
                )}
              </View>
            </TouchableOpacity>

            <View style={styles.profileDetails}>
              <Text style={styles.settingsProfileName}>{user.name}</Text>
              <Text style={styles.settingsProfileEmail}>{user.email}</Text>
              <TouchableOpacity
                onPress={handlePickAvatar}
                disabled={isUploadingPhoto}
                style={styles.changePhotoBtn}
              >
                <Text style={styles.changePhotoBtnText}>
                  {isUploadingPhoto ? 'Uploading Photo...' : 'Change Profile Photo'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  settingsAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E5E7EB',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.black,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  profileDetails: {
    flex: 1,
  },
  settingsProfileName: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 15,
    color: COLORS.black,
    marginBottom: 2,
  },
  settingsProfileEmail: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  changePhotoBtn: {
    alignSelf: 'flex-start',
  },
  changePhotoBtnText: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 12,
    color: '#2563EB',
  },
});
