import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Home,
  Compass,
  Bookmark,
  History,
  Bell,
  Settings,
  Sparkles,
  LogOut,
  LogIn,
  ChevronRight,
  UserPlus,
} from 'lucide-react-native';
import { COLORS, FONTS } from '../../constants/theme';
import { BrandLogo } from '../../components/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export default function ProfileScreen() {
  const { user, isAuthenticated, signOut } = useAuth();
  const { unreadCount } = useNotifications();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Top Logo */}
        <View style={styles.header}>
          <BrandLogo size="md" inverted />
        </View>

        {/* User Profile Card */}
        {isAuthenticated && user ? (
          <TouchableOpacity
            style={styles.profileCard}
            activeOpacity={0.8}
            onPress={() => router.push('/settings')}
          >
            <Image
              source={{ uri: user.avatar }}
              style={styles.avatar}
            />
            <View style={styles.profileTextWrapper}>
              <Text style={styles.profileName}>{user.name}</Text>
              <Text style={styles.profileHandle}>@{user.username}</Text>
            </View>
            <ChevronRight size={18} color="#8E95A2" />
          </TouchableOpacity>
        ) : (
          <View style={styles.guestCard}>
            <Text style={styles.guestTitle}>Welcome to TechQuo News</Text>
            <Text style={styles.guestSubtitle}>
              Sign in to sync your bookmarks, join discussions, and personalize your feed.
            </Text>
            <View style={styles.guestActionRow}>
              <TouchableOpacity
                style={styles.guestSignInBtn}
                onPress={() => router.push('/auth/signin')}
              >
                <LogIn size={15} color={COLORS.black} />
                <Text style={styles.guestSignInText}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.guestSignUpBtn}
                onPress={() => router.push('/auth/signup')}
              >
                <UserPlus size={15} color={COLORS.white} />
                <Text style={styles.guestSignUpText}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Navigation Menu List */}
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)')}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <Home size={19} color={COLORS.white} />
              <Text style={styles.menuLabel}>Home</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)/explore')}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <Compass size={19} color={COLORS.white} />
              <Text style={styles.menuLabel}>Explore</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)/saved')}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <Bookmark size={19} color={COLORS.white} />
              <Text style={styles.menuLabel}>Saved Articles</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/history')}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <History size={19} color={COLORS.white} />
              <Text style={styles.menuLabel}>Reading History</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/notifications')}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <Bell size={19} color={COLORS.white} />
              <Text style={styles.menuLabel}>Notifications</Text>
            </View>
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/settings')}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <Settings size={19} color={COLORS.white} />
              <Text style={styles.menuLabel}>Settings</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Go Premium Promotional Card */}
        <TouchableOpacity
          style={styles.premiumCard}
          activeOpacity={0.85}
          onPress={() => router.push('/premium')}
        >
          <View style={styles.premiumIconBox}>
            <Sparkles size={20} color={COLORS.white} />
          </View>
          <View style={styles.premiumTextContainer}>
            <Text style={styles.premiumTitle}>Go Premium</Text>
            <Text style={styles.premiumSubtitle}>
              Get unlimited access to exclusive content and features.
            </Text>
          </View>
          <ChevronRight size={18} color="#8E95A2" />
        </TouchableOpacity>

        {/* Account Action (Sign Out / Sign In) */}
        {isAuthenticated ? (
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <LogOut size={18} color="#8E95A2" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={() => router.push('/auth/signin')}
            activeOpacity={0.7}
          >
            <LogIn size={18} color="#8E95A2" />
            <Text style={styles.signOutText}>Sign In</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0E12',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    paddingVertical: 18,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#262931',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
    backgroundColor: '#1E2026',
  },
  profileTextWrapper: {
    flex: 1,
  },
  profileName: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 16,
    color: COLORS.white,
    marginBottom: 2,
  },
  profileHandle: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: '#8E95A2',
  },
  guestCard: {
    backgroundColor: '#17191E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#262931',
  },
  guestTitle: {
    fontFamily: FONTS.serif,
    fontSize: 18,
    color: COLORS.white,
    fontWeight: '700',
    marginBottom: 6,
  },
  guestSubtitle: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: '#8E95A2',
    lineHeight: 18,
    marginBottom: 14,
  },
  guestActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  guestSignInBtn: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  guestSignInText: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 13,
    color: COLORS.black,
  },
  guestSignUpBtn: {
    flex: 1,
    backgroundColor: '#262931',
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  guestSignUpText: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 13,
    color: COLORS.white,
  },
  menuSection: {
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1A1C22',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuLabel: {
    fontFamily: FONTS.sansMedium,
    fontSize: 15,
    color: COLORS.white,
  },
  notificationBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    color: COLORS.black,
  },
  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#17191E',
    borderWidth: 1,
    borderColor: '#262931',
    borderRadius: 14,
    padding: 16,
    marginBottom: 28,
  },
  premiumIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#262931',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  premiumTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  premiumTitle: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 15,
    color: COLORS.white,
    marginBottom: 2,
  },
  premiumSubtitle: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: '#8E95A2',
    lineHeight: 16,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  signOutText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
    color: '#8E95A2',
  },
});
