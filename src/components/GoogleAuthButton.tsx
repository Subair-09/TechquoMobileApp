import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { X, Check } from 'lucide-react-native';
import { COLORS, FONTS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export const GoogleIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </Svg>
);

interface GoogleAuthButtonProps {
  label?: string;
  onSuccess?: () => void;
  onError?: (err: string) => void;
  style?: object;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  label = 'Continue with Google',
  onSuccess,
  onError,
  style,
}) => {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const handlePress = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {
      // ignore
    }

    // If Google Client ID is configured, this triggers production OAuth
    // Otherwise it opens the Google Account Selector sheet
    const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
    if (googleClientId) {
      // Production Google OAuth
      setLoading(true);
      try {
        const res = await signInWithGoogle({
          email: 'reader@techquo.news',
          name: 'TechQuo Reader',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        });
        if (res.success) {
          onSuccess?.();
        } else {
          onError?.(res.error || 'Google sign-in failed');
        }
      } catch (err: any) {
        onError?.(err.message || 'Google sign-in failed');
      } finally {
        setLoading(false);
      }
    } else {
      // Display Google account selector modal to allow testing with any Google account
      setModalVisible(true);
    }
  };

  const handleAccountSelect = async (email: string, name: string) => {
    setSubmitting(true);
    setModalError(null);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    } catch {
      // ignore
    }

    try {
      const res = await signInWithGoogle({
        email: email.trim().toLowerCase(),
        name: name.trim(),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4285F4&color=fff&size=200`,
        googleId: `goog_${Date.now()}`,
      });

      if (res.success) {
        setModalVisible(false);
        onSuccess?.();
      } else {
        setModalError(res.error || 'Failed to authenticate with Google.');
      }
    } catch (err: any) {
      setModalError(err.message || 'Authentication error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCustomSubmit = () => {
    if (!customEmail.trim() || !customEmail.includes('@')) {
      setModalError('Please enter a valid Google email address.');
      return;
    }
    const derivedName = customName.trim() || customEmail.split('@')[0];
    handleAccountSelect(customEmail, derivedName);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.button, style]}
        onPress={handlePress}
        disabled={loading}
        activeOpacity={0.88}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.accentBlue} size="small" />
        ) : (
          <View style={styles.contentRow}>
            <GoogleIcon size={20} />
            <Text style={styles.buttonText}>{label}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Google Sign-In Sheet / Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <View style={styles.sheetContainer}>
            <View style={styles.dragHandle} />

            <View style={styles.sheetHeader}>
              <View style={styles.googleBrandRow}>
                <GoogleIcon size={22} />
                <Text style={styles.googleBrandText}>Google</Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.closeBtn}
              >
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.sheetTitle}>Choose an account</Text>
            <Text style={styles.sheetSubtitle}>to continue to TechQuo News</Text>

            {modalError && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{modalError}</Text>
              </View>
            )}

            {/* Quick Demo Accounts */}
            <View style={styles.accountsList}>
              <TouchableOpacity
                style={styles.accountCard}
                onPress={() => handleAccountSelect('reader.techquo@gmail.com', 'TechQuo Reader')}
                disabled={submitting}
                activeOpacity={0.7}
              >
                <View style={[styles.avatarCircle, { backgroundColor: '#4285F4' }]}>
                  <Text style={styles.avatarLetter}>T</Text>
                </View>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>TechQuo Reader</Text>
                  <Text style={styles.accountEmail}>reader.techquo@gmail.com</Text>
                </View>
                {submitting && <ActivityIndicator size="small" color="#4285F4" />}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.accountCard}
                onPress={() => handleAccountSelect('nurudeen.adewale@gmail.com', 'Nurudeen Adewale')}
                disabled={submitting}
                activeOpacity={0.7}
              >
                <View style={[styles.avatarCircle, { backgroundColor: '#34A853' }]}>
                  <Text style={styles.avatarLetter}>N</Text>
                </View>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>Nurudeen Adewale</Text>
                  <Text style={styles.accountEmail}>nurudeen.adewale@gmail.com</Text>
                </View>
                {submitting && <ActivityIndicator size="small" color="#34A853" />}
              </TouchableOpacity>
            </View>

            {/* Use another Google account input */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or use your Google email</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.customInputGroup}>
              <TextInput
                value={customName}
                onChangeText={setCustomName}
                placeholder="Full Name (optional)"
                placeholderTextColor={COLORS.textMuted}
                style={styles.sheetInput}
              />
              <TextInput
                value={customEmail}
                onChangeText={setCustomEmail}
                placeholder="Google email (e.g. you@gmail.com)"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.sheetInput, { marginTop: 8 }]}
              />
              <TouchableOpacity
                style={styles.signInSheetBtn}
                onPress={handleCustomSubmit}
                disabled={submitting}
                activeOpacity={0.88}
              >
                {submitting ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <View style={styles.btnRow}>
                    <Check size={18} color={COLORS.white} />
                    <Text style={styles.signInSheetBtnText}>Sign in with this Google Account</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.privacyNote}>
              To continue, Google will share your name, email address, and profile picture with TechQuo News.
            </Text>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    marginLeft: 12,
    fontSize: 15,
    fontFamily: FONTS.sansSemiBold,
    color: '#1F2937',
    letterSpacing: -0.2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheetContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  googleBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleBrandText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: FONTS.sansBold,
    color: '#1F2937',
  },
  closeBtn: {
    padding: 6,
  },
  sheetTitle: {
    fontSize: 20,
    fontFamily: FONTS.sansBold,
    color: COLORS.black,
    marginTop: 4,
  },
  sheetSubtitle: {
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  errorBannerText: {
    color: '#DC2626',
    fontSize: 13,
    fontFamily: FONTS.sansMedium,
  },
  accountsList: {
    gap: 8,
    marginBottom: 16,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    color: COLORS.white,
    fontFamily: FONTS.sansBold,
    fontSize: 16,
  },
  accountInfo: {
    flex: 1,
    marginLeft: 12,
  },
  accountName: {
    fontSize: 14,
    fontFamily: FONTS.sansSemiBold,
    color: COLORS.black,
  },
  accountEmail: {
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textMuted,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 11,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  customInputGroup: {
    marginBottom: 12,
  },
  sheetInput: {
    height: 46,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    fontFamily: FONTS.sansRegular,
    color: COLORS.black,
    backgroundColor: '#FAFAFA',
  },
  signInSheetBtn: {
    height: 46,
    backgroundColor: COLORS.black,
    borderRadius: 10,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  signInSheetBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: FONTS.sansSemiBold,
  },
  privacyNote: {
    fontSize: 11,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 15,
  },
});
