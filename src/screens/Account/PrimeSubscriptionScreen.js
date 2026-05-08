import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/config';

const PRIME_PACKAGES = [
  {
    key: 'plus',
    title: 'Prime Plus',
    subtitle: 'Goi nang cap pho bien',
    price: '79.000',
    period: '/thang',
    badge: 'Pho bien',
    colors: ['#1f2b55', '#243c79'],
    features: [
      { icon: 'happy-outline', text: 'Mo khoa comment sticker doc quyen' },
      { icon: 'film-outline', text: 'Chat luong xem cao hon va uu tien duong truyen' },
      { icon: 'people-outline', text: 'Mo khoa tao phong xem chung Watch Party' },
    ],
  },
  {
    key: 'pro',
    title: 'Prime Pro',
    subtitle: 'Danh cho nguoi dung nang cao',
    price: '149.000',
    period: '/thang',
    badge: 'Manh nhat',
    colors: ['#3c2459', '#6a2f99'],
    features: [
      { icon: 'happy-outline', text: 'Mo khoa comment sticker doc quyen' },
      { icon: 'film-outline', text: 'Chat luong xem cao hon va uu tien duong truyen' },
      { icon: 'people-outline', text: 'Mo khoa tao phong xem chung Watch Party' },
      { icon: 'ribbon-outline', text: 'Khung ho so Prime Pro noi bat' },
      { icon: 'chatbubble-ellipses-outline', text: 'Comment duoc hien thi noi bat hon' },
      { icon: 'sparkles-outline', text: 'Chat bot AI ho tro de xuat va giai dap nhanh' },
    ],
  },
];

function FeatureItem({ icon, text }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIconWrap}>
        <Ionicons name={icon} size={14} color={COLORS.primary} />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

export default function PrimeSubscriptionScreen() {
  const [selectedPackage, setSelectedPackage] = useState('plus');

  const selectedPlan = useMemo(
    () => PRIME_PACKAGES.find((plan) => plan.key === selectedPackage),
    [selectedPackage]
  );

  const handleSubscribe = () => {
    if (!selectedPlan) return;

    Alert.alert(
      'Xac nhan nang cap',
      `Ban da chon ${selectedPlan.title}. Phan xu ly thanh toan se duoc ket noi o buoc backend.`,
      [
        { text: 'De sau', style: 'cancel' },
        { text: 'Tiep tuc', onPress: () => {} },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Ionicons name="diamond-outline" size={14} color={COLORS.primary} />
            <Text style={styles.heroBadgeText}>TEZMOVIES PRIME</Text>
          </View>
          <Text style={styles.heroTitle}>Nang cap tai khoan Prime</Text>
          <Text style={styles.heroSubtitle}>
            Chon goi phu hop de mo khoa cac tinh nang cao cap cho trai nghiem xem phim tot hon.
          </Text>
        </View>

        {PRIME_PACKAGES.map((plan) => {
          const isSelected = selectedPackage === plan.key;

          return (
            <TouchableOpacity
              key={plan.key}
              activeOpacity={0.9}
              style={[styles.planCardWrapper, isSelected && styles.planCardWrapperActive]}
              onPress={() => setSelectedPackage(plan.key)}
            >
              <View
                style={[
                  styles.planCard,
                  {
                    backgroundColor: plan.colors[0],
                    borderColor: plan.colors[1],
                  },
                ]}
              >
                <View style={styles.planHeader}>
                  <View>
                    <Text style={styles.planTitle}>{plan.title}</Text>
                    <Text style={styles.planSubtitle}>{plan.subtitle}</Text>
                  </View>
                  <View style={styles.planBadge}>
                    <Text style={styles.planBadgeText}>{plan.badge}</Text>
                  </View>
                </View>

                <View style={styles.priceRow}>
                  <Text style={styles.priceValue}>{plan.price}</Text>
                  <Text style={styles.pricePeriod}>{plan.period}</Text>
                </View>

                <View style={styles.featureList}>
                  {plan.features.map((feature) => (
                    <FeatureItem key={`${plan.key}-${feature.text}`} icon={feature.icon} text={feature.text} />
                  ))}
                </View>

                <View style={styles.selectRow}>
                  <View style={[styles.checkCircle, isSelected && styles.checkCircleActive]}>
                    {isSelected && <Ionicons name="checkmark" size={12} color="#000" />}
                  </View>
                  <Text style={styles.selectText}>
                    {isSelected ? 'Dang duoc chon' : 'Nhan de chon goi nay'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
          <Ionicons name="rocket-outline" size={18} color="#000" />
          <Text style={styles.subscribeButtonText}>Dang ky {selectedPlan?.title || 'Prime'}</Text>
        </TouchableOpacity>

        <Text style={styles.footnote}>
          * Day la giao dien dang ky Prime. Ban co the ket noi thanh toan (Momo, ZaloPay, App Store,
          Google Play) o buoc backend va billing.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  heroCard: {
    backgroundColor: '#2a3360',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    marginBottom: SPACING.md,
  },
  heroBadgeText: {
    color: COLORS.primary,
    fontSize: FONTS.xs,
    fontWeight: '700',
    letterSpacing: 0.7,
  },
  heroTitle: {
    color: COLORS.text,
    fontSize: FONTS.xxl,
    fontWeight: '800',
    marginBottom: SPACING.xs,
  },
  heroSubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.md,
    lineHeight: 20,
  },
  planCardWrapper: {
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  planCardWrapperActive: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  planCard: {
    borderWidth: 1,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planTitle: {
    color: COLORS.text,
    fontSize: FONTS.xl,
    fontWeight: '800',
  },
  planSubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sm,
    marginTop: 2,
  },
  planBadge: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  planBadgeText: {
    color: COLORS.primary,
    fontSize: FONTS.xs,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  priceValue: {
    color: COLORS.text,
    fontSize: 30,
    fontWeight: '800',
  },
  pricePeriod: {
    color: COLORS.textSecondary,
    fontSize: FONTS.md,
    marginLeft: SPACING.xs,
    marginBottom: 4,
  },
  featureList: {
    gap: SPACING.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  featureText: {
    flex: 1,
    color: COLORS.text,
    fontSize: FONTS.sm,
    lineHeight: 19,
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  checkCircleActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  selectText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sm,
    fontWeight: '600',
  },
  subscribeButton: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  subscribeButtonText: {
    color: '#000',
    fontSize: FONTS.lg,
    fontWeight: '800',
  },
  footnote: {
    marginTop: SPACING.md,
    color: COLORS.textMuted,
    fontSize: FONTS.xs,
    lineHeight: 16,
    textAlign: 'center',
    paddingHorizontal: SPACING.sm,
  },
});