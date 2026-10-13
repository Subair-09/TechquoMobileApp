import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { X, Check, Sparkles } from 'lucide-react-native';
import { COLORS, FONTS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const BENEFITS = [
  'Unlimited access to exclusive investigative reports',
  'Weekly TechQuo Executive Briefs and data teardowns',
  'Offline synchronization for entire publication archive',
  'Ad-free editorial reading experience across all devices',
  'Direct author Q&A discussions and invite-only briefings',
];

export default function PremiumScreen() {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [upgraded, setUpgraded] = useState(false);
  const { upgradeToPremium } = useAuth();

  const handleUpgrade = async () => {
    await upgradeToPremium();
    setUpgraded(true);
    Alert.alert(
      'Welcome to TechQuo Premium',
      'Your account now has full access to all exclusive briefings and offline features.',
      [{ text: 'Continue Reading', onPress: () => router.back() }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <Text style={styles.headerTitle}>TechQuo Premium</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.closeBtn}
        >
          <X size={22} color={COLORS.black} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroBox}>
          <View style={styles.iconCircle}>
            <Sparkles size={28} color={COLORS.white} />
          </View>
          <Text style={styles.heroTitle}>Sovereign African Intelligence</Text>
          <Text style={styles.heroSubtitle}>
            {"Direct access to the continent's most rigorous technology journalism, venture analysis, and market data."}
          </Text>
        </View>

        {/* Benefits list */}
        <View style={styles.benefitsList}>
          {BENEFITS.map((benefit, index) => (
            <View key={index} style={styles.benefitRow}>
              <View style={styles.checkCircle}>
                <Check size={14} color={COLORS.black} />
              </View>
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        {/* Pricing Tiers */}
        <View style={styles.plansContainer}>
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'annual' && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPlan('annual')}
            activeOpacity={0.8}
          >
            <View style={styles.planHeader}>
              <View>
                <Text style={styles.planName}>Annual Membership</Text>
                <Text style={styles.planBilling}>Billed annually at $60/yr</Text>
              </View>
              <View style={styles.badgeSavings}>
                <Text style={styles.badgeSavingsText}>Save 28%</Text>
              </View>
            </View>
            <Text style={styles.planPrice}>$5.00 <Text style={styles.perMonth}>/ month</Text></Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'monthly' && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPlan('monthly')}
            activeOpacity={0.8}
          >
            <View style={styles.planHeader}>
              <View>
                <Text style={styles.planName}>Monthly Membership</Text>
                <Text style={styles.planBilling}>Flexible monthly billing</Text>
              </View>
            </View>
            <Text style={styles.planPrice}>$7.00 <Text style={styles.perMonth}>/ month</Text></Text>
          </TouchableOpacity>
        </View>

        {/* Upgrade Button */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleUpgrade}
          activeOpacity={0.88}
        >
          <Text style={styles.actionBtnText}>
            {upgraded ? 'Membership Active' : 'Start 7-Day Free Trial'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.guaranteeText}>
          Cancel anytime with a single tap. Zero commitments.
        </Text>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontFamily: FONTS.serif,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.black,
  },
  closeBtn: {
    padding: 2,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  heroBox: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontFamily: FONTS.serif,
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontFamily: FONTS.sansRegular,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  benefitsList: {
    marginVertical: 18,
    gap: 14,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
    color: COLORS.textPrimary,
    flex: 1,
  },
  plansContainer: {
    marginVertical: 20,
    gap: 12,
  },
  planCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planCardSelected: {
    borderColor: COLORS.black,
    backgroundColor: COLORS.white,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  planName: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 15,
    color: COLORS.black,
  },
  planBilling: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  badgeSavings: {
    backgroundColor: COLORS.black,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeSavingsText: {
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    color: COLORS.white,
  },
  planPrice: {
    fontFamily: FONTS.serif,
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.black,
  },
  perMonth: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  actionBtn: {
    backgroundColor: COLORS.black,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  actionBtnText: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 15,
    color: COLORS.white,
  },
  guaranteeText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
