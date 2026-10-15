import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Mail, RefreshCw, CheckCircle2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS } from '../../constants/theme';
import { BrandLogo } from '../../components/BrandLogo';
import { useAuth } from '../../context/AuthContext';

const COUNTDOWN_SECONDS = 60;

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams<{ email?: string; name?: string; mode?: string }>();
  const email = (params.email || '').trim().toLowerCase();
  const name = params.name || '';
  const isLoginMode = params.mode === 'login';

  const { verifyEmailCode, sendVerificationCode } = useAuth();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const canResend = countdown <= 0;

  const inputRef = useRef<TextInput>(null);

  // Focus input automatically on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Handle hardware back press
  useEffect(() => {
    const onBackPress = () => {
      router.replace(isLoginMode ? '/auth/signin' : '/auth/signup');
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [isLoginMode]);

  // Countdown timer for Resend code
  useEffect(() => {
    if (countdown <= 0) return;

    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  const handleVerify = async (codeToVerify?: string) => {
    const finalCode = (codeToVerify || code).trim();
    if (finalCode.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    } catch {
      // ignore
    }

    try {
      const res = await verifyEmailCode(email, finalCode);
      if (res.success) {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        } catch {
          // ignore
        }
        router.replace('/(tabs)');
      } else {
        setError(res.error || 'Invalid or expired verification code.');
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        } catch {
          // ignore
        }
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 6);
    setCode(cleaned);
    setError(null);

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {
      // ignore
    }

    // Auto submit upon 6th digit
    if (cleaned.length === 6) {
      handleVerify(cleaned);
    }
  };

  const handleResend = async () => {
    if (!canResend || resending) return;

    setError(null);
    setSuccessMsg(null);
    setResending(true);

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      const res = await sendVerificationCode(email, name, isLoginMode ? 'login' : 'signup');
      if (res.success) {
        setSuccessMsg('New 6-digit code dispatched via Resend!');
        setCountdown(COUNTDOWN_SECONDS);
        setCode('');
        inputRef.current?.focus();
      } else {
        setError(res.error || 'Failed to resend code. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Could not resend code.');
    } finally {
      setResending(false);
    }
  };

  const handleBack = () => {
    router.replace(isLoginMode ? '/auth/signin' : '/auth/signup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}
      >
        <View style={styles.topNav}>
          <TouchableOpacity
            onPress={handleBack}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.backBtn}
          >
            <ChevronLeft size={24} color={COLORS.black} />
          </TouchableOpacity>
        </View>

        <View style={styles.headerContainer}>
          <View style={styles.iconCircle}>
            <Mail size={32} color={COLORS.accentBlue} />
          </View>
          <BrandLogo size="md" />
          <Text style={styles.headline}>
            {isLoginMode ? 'Confirm Sign In' : 'Verify Your Email'}
          </Text>
          <Text style={styles.subtitle}>
            {isLoginMode
              ? 'We sent a 6-digit confirmation code to\n'
              : 'We sent a 6-digit activation code to\n'}
            <Text style={styles.emailHighlight}>{email || 'your email address'}</Text>
          </Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {successMsg && (
          <View style={styles.successBox}>
            <CheckCircle2 size={16} color={COLORS.success} />
            <Text style={styles.successText}>{successMsg}</Text>
          </View>
        )}

        {/* 6-Digit OTP Cells Display */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => inputRef.current?.focus()}
          style={styles.otpWrapper}
        >
          <View style={styles.otpContainer}>
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const digit = code[index] || '';
              const isFocused = code.length === index || (code.length === 6 && index === 5);
              return (
                <View
                  key={index}
                  style={[
                    styles.otpCell,
                    isFocused && styles.otpCellFocused,
                    digit !== '' && styles.otpCellFilled,
                  ]}
                >
                  <Text style={styles.otpDigit}>{digit}</Text>
                </View>
              );
            })}
          </View>

          {/* Hidden real input for native keyboard support */}
          <TextInput
            ref={inputRef}
            value={code}
            onChangeText={handleCodeChange}
            keyboardType="number-pad"
            maxLength={6}
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            style={styles.hiddenInput}
            caretHidden
          />
        </TouchableOpacity>

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.verifyBtn, code.length !== 6 && styles.verifyBtnDisabled]}
          onPress={() => handleVerify()}
          disabled={loading || code.length !== 6}
          activeOpacity={0.88}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={styles.verifyBtnText}>
              {isLoginMode ? 'Confirm & Sign In' : 'Verify & Continue'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Resend Code Section */}
        <View style={styles.resendSection}>
          {canResend ? (
            <TouchableOpacity
              onPress={handleResend}
              disabled={resending}
              style={styles.resendButton}
              activeOpacity={0.7}
            >
              {resending ? (
                <ActivityIndicator size="small" color={COLORS.accentBlue} />
              ) : (
                <View style={styles.resendRow}>
                  <RefreshCw size={15} color={COLORS.accentBlue} />
                  <Text style={styles.resendActiveText}>Resend Code</Text>
                </View>
              )}
            </TouchableOpacity>
          ) : (
            <Text style={styles.countdownText}>
              Resend code in <Text style={styles.countdownNumber}>{countdown}s</Text>
            </Text>
          )}
        </View>

        {/* Change Email Footer */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>
            {isLoginMode ? 'Use a different account? ' : 'Wrong email address? '}
          </Text>
          <TouchableOpacity onPress={handleBack}>
            <Text style={styles.changeEmailLink}>
              {isLoginMode ? 'Sign In' : 'Change Email'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  topNav: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  backBtn: {
    padding: 6,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headline: {
    fontSize: 24,
    fontFamily: FONTS.sansBold,
    color: COLORS.black,
    marginTop: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  emailHighlight: {
    fontFamily: FONTS.sansSemiBold,
    color: COLORS.black,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    fontFamily: FONTS.sansMedium,
    textAlign: 'center',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#6EE7B7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#065F46',
    fontSize: 13,
    fontFamily: FONTS.sansMedium,
  },
  otpWrapper: {
    marginBottom: 24,
    position: 'relative',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  otpCell: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpCellFocused: {
    borderColor: COLORS.accentBlue,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.accentBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  otpCellFilled: {
    borderColor: COLORS.black,
    backgroundColor: COLORS.white,
  },
  otpDigit: {
    fontSize: 22,
    fontFamily: FONTS.sansBold,
    color: COLORS.black,
  },
  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.01,
  },
  verifyBtn: {
    height: 52,
    backgroundColor: COLORS.black,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  verifyBtnDisabled: {
    backgroundColor: '#9CA3AF',
  },
  verifyBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontFamily: FONTS.sansSemiBold,
    letterSpacing: -0.2,
  },
  resendSection: {
    alignItems: 'center',
    marginTop: 20,
    minHeight: 28,
    justifyContent: 'center',
  },
  resendButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resendActiveText: {
    color: COLORS.accentBlue,
    fontSize: 14,
    fontFamily: FONTS.sansSemiBold,
  },
  countdownText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: FONTS.sansRegular,
  },
  countdownNumber: {
    color: COLORS.black,
    fontFamily: FONTS.sansSemiBold,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
  },
  changeEmailLink: {
    color: COLORS.black,
    fontSize: 13,
    fontFamily: FONTS.sansSemiBold,
  },
});
