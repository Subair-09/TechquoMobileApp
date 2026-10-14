import React, { useState, useEffect } from 'react';
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
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { COLORS, FONTS } from '../../constants/theme';
import { BrandLogo } from '../../components/BrandLogo';
import { useAuth } from '../../context/AuthContext';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signUp, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const onBackPress = () => {
      router.replace('/auth/signin');
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, []);

  const handleSignUp = async () => {
    setError(null);
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const res = await signUp(name.trim(), email.trim(), password);
      if (res.success) {
        router.replace('/(tabs)');
      } else {
        setError(res.error || 'Failed to create account');
      }
    } catch {
      setError('Unexpected error during registration');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.replace('/auth/signin');
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

        <View style={styles.brandContainer}>
          <BrandLogo size="lg" />
          <Text style={styles.headline}>Create Your Account</Text>
          <Text style={styles.subtitle}>
            Join the conversation shaping Africa’s technology and innovation frontier.
          </Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>FULL NAME</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Nurudeen Adewale"
              placeholderTextColor={COLORS.textMuted}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="editor@techquo.news"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••••••"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry
              style={styles.input}
            />
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSignUp}
            disabled={loading}
            activeOpacity={0.88}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.submitBtnText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/auth/signin')}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
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
    padding: 4,
  },
  brandContainer: {
    marginBottom: 28,
  },
  headline: {
    fontFamily: FONTS.serif,
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.black,
    marginTop: 18,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 19,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#F87171',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.danger,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: COLORS.textMuted,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: FONTS.sansRegular,
    fontSize: 14,
    color: COLORS.black,
  },
  submitBtn: {
    backgroundColor: COLORS.black,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 15,
    color: COLORS.white,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
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
