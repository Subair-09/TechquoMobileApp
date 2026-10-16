import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Redirect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import {
  Bookmark,
  History,
  Bell,
  Settings,
  Sparkles,
  LogOut,
  ChevronRight,
  Camera,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react-native';
import { COLORS, FONTS } from '../../constants/theme';
import { BrandLogo } from '../../components/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useBookmarks } from '../../context/BookmarkContext';
import { useReading } from '../../context/ReadingContext';

export default function ProfileScreen() {
  const { user, isAuthenticated, signOut, updateAvatar } = useAuth();
  const { unreadCount } = useNotifications();
  const { bookmarks } = useBookmarks();
  const { readingHistory } = useReading();
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // If not authenticated, instantly redirect to the sign-in page
  if (!isAuthenticated || !user) {
    return <Redirect href="/auth/signin" />;
  }

  const handlePickAvatar = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
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
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
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

  const handleSignOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your TechQuo News account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              router.replace('/auth/signin');
              await signOut();
            } catch (err) {
              console.warn('Sign out error:', err);
              router.replace('/auth/signin');
            }
          },
        },
      ]
    );
  };

  const isGoogle = user?.authProvider === 'google';
  const isPremium = Boolean(user?.isPremium);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Header */}
        <View style={styles.topHeader}>
          <BrandLogo size="md" />
          <TouchableOpacity
            style={styles.settingsHeaderBtn}
            onPress={() => router.push('/settings')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Settings"
          >
            <Settings size={20} color={COLORS.black} />
          </TouchableOpacity>
        </View>

        {/* Hero Profile Card */}
        <View style={styles.profileHeroCard}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity
              style={styles.avatarWrapper}
              onPress={handlePickAvatar}
              disabled={isUploadingPhoto}
              activeOpacity={0.85}
            >
              <Image
                source={{
                  uri:
                    user?.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
                }}
                style={styles.avatar}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
              />
              <View style={styles.cameraBadge}>
                {isUploadingPhoto ? (
                  <ActivityIndicator size="small" color={COLORS.white} style={{ transform: [{ scale: 0.6 }] }} />
                ) : (
                  <Camera size={13} color={COLORS.white} />
                )}
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'TechQuo Reader'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'reader@techquo.news'}</Text>
            <TouchableOpacity onPress={handlePickAvatar} style={styles.changePhotoLink}>
              <Text style={styles.changePhotoText}>Tap photo to update</Text>
            </TouchableOpacity>

            {/* Badges Row */}
            <View style={styles.badgesRow}>
              <View style={styles.verifiedBadge}>
                <CheckCircle2 size={12} color="#059669" />
                <Text style={styles.verifiedBadgeText}>Verified Reader</Text>
              </View>

              {isGoogle ? (
                <View style={styles.providerBadge}>
                  <ShieldCheck size={12} color="#2563EB" />
                  <Text style={styles.providerBadgeText}>Google Account</Text>
                </View>
              ) : (
                <View style={styles.providerBadge}>
                  <ShieldCheck size={12} color="#4B5563" />
                  <Text style={styles.providerBadgeText}>Email Verified</Text>
                </View>
              )}

              {isPremium && (
                <View style={styles.premiumBadge}>
                  <Sparkles size={11} color="#B45309" />
                  <Text style={styles.premiumBadgeText}>Premium</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Reader Stats Row */}
        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={styles.statBox}
            onPress={() => router.push('/(tabs)/saved')}
            activeOpacity={0.7}
          >
            <View style={[styles.statIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Bookmark size={18} color="#2563EB" />
            </View>
            <Text style={styles.statCount}>{bookmarks.length}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </TouchableOpacity>

          <View style={styles.statDivider} />

          <TouchableOpacity
            style={styles.statBox}
            onPress={() => router.push('/history')}
            activeOpacity={0.7}
          >
            <View style={[styles.statIconCircle, { backgroundColor: '#F0FDF4' }]}>
              <History size={18} color="#16A34A" />
            </View>
            <Text style={styles.statCount}>{readingHistory.length}</Text>
            <Text style={styles.statLabel}>Read</Text>
          </TouchableOpacity>

          <View style={styles.statDivider} />

          <TouchableOpacity
            style={styles.statBox}
            onPress={() => router.push('/notifications')}
            activeOpacity={0.7}
          >
            <View style={[styles.statIconCircle, { backgroundColor: '#FFF7ED' }]}>
              <Bell size={18} color="#EA580C" />
            </View>
            <Text style={styles.statCount}>{unreadCount}</Text>
            <Text style={styles.statLabel}>Alerts</Text>
          </TouchableOpacity>
        </View>

        {/* Library Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>LIBRARY & ACTIVITY</Text>
          <View style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => router.push('/(tabs)/saved')}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: '#EFF6FF' }]}>
                  <Bookmark size={17} color="#2563EB" />
                </View>
                <Text style={styles.menuTitle}>Saved Bookmarks</Text>
              </View>
              <View style={styles.menuRight}>
                {bookmarks.length > 0 && (
                  <View style={styles.counterBadge}>
                    <Text style={styles.counterBadgeText}>{bookmarks.length}</Text>
                  </View>
                )}
                <ChevronRight size={18} color={COLORS.textMuted} />
              </View>
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => router.push('/history')}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: '#F0FDF4' }]}>
                  <History size={17} color="#16A34A" />
                </View>
                <Text style={styles.menuTitle}>Reading History</Text>
              </View>
              <View style={styles.menuRight}>
                <ChevronRight size={18} color={COLORS.textMuted} />
              </View>
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => router.push('/notifications')}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: '#FFF7ED' }]}>
                  <Bell size={17} color="#EA580C" />
                </View>
                <Text style={styles.menuTitle}>Notifications</Text>
              </View>
              <View style={styles.menuRight}>
                {unreadCount > 0 && (
                  <View style={[styles.counterBadge, { backgroundColor: '#EF4444' }]}>
                    <Text style={[styles.counterBadgeText, { color: COLORS.white }]}>
                      {unreadCount}
                    </Text>
                  </View>
                )}
                <ChevronRight size={18} color={COLORS.textMuted} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>PREFERENCES & ACCOUNT</Text>
          <View style={styles.menuCard}>
            {!isPremium && (
              <>
                <TouchableOpacity
                  style={styles.menuRow}
                  onPress={() => router.push('/premium')}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuLeft}>
                    <View style={[styles.menuIconBox, { backgroundColor: '#FEF3C7' }]}>
                      <Sparkles size={17} color="#D97706" />
                    </View>
                    <View>
                      <Text style={styles.menuTitle}>Upgrade to Premium</Text>
                      <Text style={styles.menuSubtitle}>Ad-free reading, offline downloads & insights</Text>
                    </View>
                  </View>
                  <View style={styles.menuRight}>
                    <ChevronRight size={18} color={COLORS.textMuted} />
                  </View>
                </TouchableOpacity>
                <View style={styles.rowDivider} />
              </>
            )}

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => router.push('/settings')}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: '#F3F4F6' }]}>
                  <Settings size={17} color="#374151" />
                </View>
                <View>
                  <Text style={styles.menuTitle}>App Settings & Display</Text>
                  <Text style={styles.menuSubtitle}>Font size, notifications, and offline reading</Text>
                </View>
              </View>
              <View style={styles.menuRight}>
                <ChevronRight size={18} color={COLORS.textMuted} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Prominent Log Out Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleSignOut}
          activeOpacity={0.85}
        >
          <LogOut size={18} color="#DC2626" />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>

        {/* App Footer Info */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerVersion}>TechQuo News Mobile • v1.0.0</Text>
          <Text style={styles.footerTagline}>Independent Technology & African Innovation Journalism</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 48,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 12,
  },
  settingsHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  profileHeroCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.accentBlue,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    elevation: 3,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontFamily: FONTS.serif,
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.black,
    letterSpacing: -0.3,
    textAlign: 'center',
    marginBottom: 4,
  },
  userEmail: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  changePhotoLink: {
    marginTop: 6,
    paddingVertical: 2,
  },
  changePhotoText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.accentBlue,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  verifiedBadgeText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    color: '#059669',
  },
  providerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  providerBadgeText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    color: '#374151',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  premiumBadgeText: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 11,
    color: '#B45309',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statCount: {
    fontFamily: FONTS.sansBold,
    fontSize: 18,
    color: COLORS.black,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontFamily: FONTS.sansRegular,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.1,
    color: COLORS.textMuted,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
    marginLeft: 54,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  menuIconBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 14,
    color: COLORS.black,
  },
  menuSubtitle: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  counterBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  counterBadgeText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    color: '#374151',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.2,
    borderColor: '#FCA5A5',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 8,
    marginBottom: 24,
  },
  logoutButtonText: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 15,
    color: '#DC2626',
    letterSpacing: -0.2,
  },
  footerContainer: {
    alignItems: 'center',
    paddingTop: 8,
  },
  footerVersion: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  footerTagline: {
    fontFamily: FONTS.sansRegular,
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
});
