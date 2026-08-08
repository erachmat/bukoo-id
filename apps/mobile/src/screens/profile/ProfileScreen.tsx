import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/authStore';
import { useLogout } from '../../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, MainTabParamList } from '../../navigation/types';
import { api } from '../../services/api';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import { Ionicons } from '@expo/vector-icons';
import { LogoBukoo } from '../../assets/logo/LogoBukoo';

type NavigationProp = NativeStackNavigationProp<RootStackParamList & MainTabParamList>;

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const { mutate: logout } = useLogout();
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();

  const [activeModal, setActiveModal] = useState<'account' | 'subscription' | 'preferences' | 'support' | 'about' | null>(null);
  const [newGoalMinutes, setNewGoalMinutes] = useState('');

  const { data: goalsData } = useQuery({
    queryKey: ['reading', 'goals'],
    queryFn: async () => {
      const response = await api.get('/goals');
      return response.data;
    },
  });

  const editGoalMutation = useMutation({
    mutationFn: async (minutes: number) => {
      const response = await api.put('/goals', { dailyGoalMinutes: minutes });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading', 'goals'] });
      setActiveModal(null);
    },
  });

  const handleLogout = () => {
    Alert.alert(
      'Keluar',
      'Apakah Anda yakin ingin keluar dari akun?',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Keluar', style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  const menuItems = [
    { id: 'account', title: 'Pengaturan Akun', icon: 'person-circle-outline' as const },
    { id: 'subscription', title: 'Langganan', icon: 'card-outline' as const },
    { id: 'preferences', title: 'Preferensi Bacaan', icon: 'book-outline' as const },
    { id: 'support', title: 'Bantuan & Dukungan', icon: 'help-circle-outline' as const },
    { id: 'about', title: 'Tentang BUKOO', icon: 'information-circle-outline' as const },
  ];

  const handleMenuPress = (itemId: string) => {
    if (itemId === 'account') {
      setActiveModal('account');
    } else if (itemId === 'subscription') {
      navigation.navigate('Subscription');
    } else if (itemId === 'preferences') {
      setActiveModal('preferences');
      setNewGoalMinutes(goalsData?.goal?.dailyGoalMinutes?.toString() || '30');
    } else if (itemId === 'support') {
      setActiveModal('support');
    } else if (itemId === 'about') {
      setActiveModal('about');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Header Bar with Logo & Upgrade CTA */}
        <View style={styles.topHeaderBar}>
          <View style={styles.brandContainer}>
            <LogoBukoo size={30} />
          </View>

          <View style={styles.topHeaderActions}>
            <View style={styles.plusPill}>
              <Text style={styles.plusPillText}>PLUS</Text>
            </View>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => navigation.navigate('Subscription')}
              activeOpacity={0.8}
            >
              <Text style={styles.upgradeButtonText}>UPGRADE ↗</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Avatar & Info Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarBorderFrame}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' }}
                style={styles.avatarImage}
              />
            )}
          </View>

          <Text style={styles.profileNameText}>{user?.name || 'Rizqi Baihaqi Ahmadi'}</Text>

          {/* Quick Stats Row */}
          <View style={styles.quickStatsRow}>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatNumber}>47</Text>
              <Text style={styles.quickStatLabel}>Selesai</Text>
            </View>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatNumber}>312</Text>
              <Text style={styles.quickStatLabel}>jam baca</Text>
            </View>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatNumber}>128</Text>
              <Text style={styles.quickStatLabel}>Follower</Text>
            </View>
          </View>
        </View>

        {/* Weekly Streak Calendar Bar */}
        <View style={styles.streakSection}>
          <View style={styles.streakHeaderRow}>
            <TouchableOpacity activeOpacity={0.6}>
              <Ionicons name="chevron-back" size={20} color={COLORS.gold} />
            </TouchableOpacity>
            <Text style={styles.streakTitle}>Agustus Week 1</Text>
            <TouchableOpacity activeOpacity={0.6}>
              <Ionicons name="chevron-forward" size={20} color={COLORS.gold} />
            </TouchableOpacity>
          </View>

          {/* Days Header */}
          <View style={styles.daysHeaderRow}>
            {['S', 'S', 'R', 'K', 'J', 'S', 'M'].map((day, idx) => (
              <Text key={`day-label-${idx}`} style={styles.dayLabelText}>{day}</Text>
            ))}
          </View>

          {/* Days Pills */}
          <View style={styles.daysPillRow}>
            {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
              const isActive = dayNum <= 6;
              return (
                <View
                  key={`day-num-${dayNum}`}
                  style={[styles.dayPill, isActive ? styles.dayPillActive : styles.dayPillInactive]}
                >
                  <Text style={[styles.dayNumText, isActive ? styles.dayNumTextActive : styles.dayNumTextInactive]}>
                    {dayNum}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Streak Indicator */}
          <View style={styles.streakCountRow}>
            <Ionicons name="flame" size={22} color={COLORS.gold} />
            <Text style={styles.streakCountNumber}>21</Text>
            <Text style={styles.streakCountText}>Hari Berturut-turut</Text>
          </View>
        </View>

        {/* Pencapaian Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Pencapaian</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statTile, { backgroundColor: '#0D2721', borderColor: '#18382F' }]}>
              <Ionicons name="book-outline" size={22} color="#4ADE80" style={{ marginBottom: 6 }} />
              <Text style={[styles.statTileNumber, { color: '#4ADE80' }]}>47</Text>
              <Text style={styles.statTileLabel}>Buku selesai</Text>
            </View>
            <View style={[styles.statTile, { backgroundColor: '#0D2721', borderColor: '#18382F' }]}>
              <Ionicons name="time-outline" size={22} color="#4ADE80" style={{ marginBottom: 6 }} />
              <Text style={[styles.statTileNumber, { color: '#4ADE80' }]}>312</Text>
              <Text style={styles.statTileLabel}>Jam Membaca</Text>
            </View>
            <View style={[styles.statTile, { backgroundColor: '#0D2721', borderColor: '#18382F' }]}>
              <Ionicons name="flame-outline" size={22} color="#4ADE80" style={{ marginBottom: 6 }} />
              <Text style={[styles.statTileNumber, { color: '#4ADE80' }]}>21</Text>
              <Text style={styles.statTileLabel}>Hari Streak</Text>
            </View>
          </View>
        </View>

        {/* Aktifitas Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Aktivitas</Text>
          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuItem, index !== menuItems.length - 1 && styles.menuDivider]}
                onPress={() => handleMenuPress(item.id)}
              >
                <Ionicons name={item.icon} size={22} color={COLORS.gold} style={{ marginRight: 16 }} />
                <Text style={styles.menuText}>{item.title}</Text>
                <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Keluar</Text>
        </TouchableOpacity>
      </ScrollView>


      {/* Account Modal */}
      <Modal visible={activeModal === 'account'} transparent animationType="fade" onRequestClose={() => setActiveModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Informasi Akun</Text>
            <View style={{ alignItems: 'center', marginVertical: 20 }}>
              <View style={[styles.avatarPlaceholder, { marginRight: 0, marginBottom: 12 }]}>
                <Text style={styles.avatarPlaceholderText}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <Text style={[styles.userName, { textAlign: 'center' }]}>{user?.name || 'Pengguna BUKOO'}</Text>
              <Text style={[styles.userEmail, { textAlign: 'center' }]}>{user?.email || ''}</Text>
            </View>
            <View style={styles.detailsBlock}>
              <View style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>Tipe Akun</Text>
                <Text style={styles.detailsValue}>{user?.subscriptionTier || 'FREE'}</Text>
              </View>
              <View style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>Anggota Sejak</Text>
                <Text style={styles.detailsValue}>
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' }) : '-'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setActiveModal(null)}>
              <Text style={styles.closeModalButtonText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Subscription Modal */}
      <Modal visible={activeModal === 'subscription'} transparent animationType="fade" onRequestClose={() => setActiveModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Langganan BUKOO</Text>
            <Text style={styles.modalSubtitle}>Nikmati pengalaman membaca tanpa batasan.</Text>
            <View style={styles.subscriptionStatusCard}>
              <Text style={styles.subStatusLabel}>Status Langganan Anda:</Text>
              <Text style={styles.subStatusValue}>{user?.subscriptionTier === 'PREMIUM' ? 'VIP Premium' : 'Free Member'}</Text>
            </View>
            <View style={{ gap: 12, marginBottom: 24 }}>
              <Text style={{ color: COLORS.cream, fontWeight: 'bold', fontSize: 14, fontFamily: FONTS.sansBold }}>Keuntungan Premium:</Text>
              <View style={styles.perkRow}>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.gold} />
                <Text style={styles.perkText}>Akses 10,000+ e-book & audiobook</Text>
              </View>
              <View style={styles.perkRow}>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.gold} />
                <Text style={styles.perkText}>Sinkronisasi bacaan lintas perangkat</Text>
              </View>
              <View style={styles.perkRow}>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.gold} />
                <Text style={styles.perkText}>Unduhan luring & bacaan luring</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setActiveModal(null)}>
              <Text style={styles.closeModalButtonText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Preferences (Goals) Modal */}
      <Modal visible={activeModal === 'preferences'} transparent animationType="fade" onRequestClose={() => setActiveModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Preferensi Target Bacaan</Text>
            <Text style={styles.modalSubtitle}>Sesuaikan target membaca harian Anda (menit):</Text>

            <View style={styles.presetsRow}>
              {[10, 15, 30, 45, 60].map((mins) => (
                <TouchableOpacity
                  key={mins}
                  style={[styles.presetButton, newGoalMinutes === mins.toString() && styles.presetButtonActive]}
                  onPress={() => setNewGoalMinutes(mins.toString())}
                >
                  <Text style={[styles.presetText, newGoalMinutes === mins.toString() && styles.presetTextActive]}>{mins}m</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.customInput}
              keyboardType="numeric"
              placeholder="Menit kustom"
              placeholderTextColor={COLORS.muted}
              value={newGoalMinutes}
              onChangeText={setNewGoalMinutes}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setActiveModal(null)}>
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                disabled={editGoalMutation.isPending}
                onPress={() => {
                  const mins = parseInt(newGoalMinutes, 10);
                  if (mins > 0) {
                    editGoalMutation.mutate(mins);
                  }
                }}
              >
                <Text style={styles.saveButtonText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Help & Support Modal */}
      <Modal visible={activeModal === 'support'} transparent animationType="fade" onRequestClose={() => setActiveModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Bantuan & Dukungan</Text>
            <ScrollView style={{ maxHeight: 300, marginVertical: 12 }} showsVerticalScrollIndicator={false}>
              <View style={styles.faqBlock}>
                <Text style={styles.faqQuestion}>Bagaimana cara mengunduh buku?</Text>
                <Text style={styles.faqAnswer}>Ketuk ikon panah bawah pada halaman detail buku untuk mengunduh dan membaca tanpa koneksi internet.</Text>
              </View>
              <View style={styles.faqBlock}>
                <Text style={styles.faqQuestion}>Mengapa kemajuan bacaan saya tidak sinkron?</Text>
                <Text style={styles.faqAnswer}>BUKOO menyinkronkan data secara otomatis saat perangkat terhubung ke internet. Anda dapat memantau status sinkronisasi di beranda.</Text>
              </View>
              <View style={styles.faqBlock}>
                <Text style={styles.faqQuestion}>Bagaimana cara mengubah tema pembaca?</Text>
                <Text style={styles.faqAnswer}>Saat membuka e-book, ketuk ikon 'Aa' di bilah kontrol pembaca untuk mengganti ukuran huruf dan warna latar belakang.</Text>
              </View>
            </ScrollView>
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setActiveModal(null)}>
              <Text style={styles.closeModalButtonText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* About Modal */}
      <Modal visible={activeModal === 'about'} transparent animationType="fade" onRequestClose={() => setActiveModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Tentang BUKOO</Text>
            <View style={{ alignItems: 'center', marginVertical: 24 }}>
              <Text style={{ fontSize: 28, fontFamily: FONTS.serifBold, fontWeight: 'bold', color: COLORS.gold, marginBottom: 8 }}>BUKOO</Text>
              <Text style={{ fontSize: 14, fontFamily: FONTS.sansRegular, color: COLORS.muted, marginBottom: 16 }}>Versi 1.0.0 (Expo Core)</Text>
              <Text style={{ fontSize: 14, fontFamily: FONTS.sansRegular, color: COLORS.creamLight, textAlign: 'center', paddingHorizontal: 12 }}>
                Platform e-book dan e-reading premium untuk pembaca Indonesia modern.
              </Text>
            </View>
            <View style={{ borderTopWidth: 1, borderTopColor: COLORS.forestBorder, paddingTop: 16, alignItems: 'center' }}>
              <Text style={{ fontSize: 12, fontFamily: FONTS.sansRegular, color: COLORS.muted, marginBottom: 4 }}>Dikembangkan oleh</Text>
              <Text style={{ fontSize: 13, fontFamily: FONTS.sansBold, fontWeight: 'bold', color: COLORS.cream, marginBottom: 12 }}>PT Akkadia Sarana Intelektual</Text>
              <Text style={{ fontSize: 11, fontFamily: FONTS.sansRegular, color: COLORS.muted }}>Copyright © 2026. Hak Cipta Dilindungi.</Text>
            </View>
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setActiveModal(null)}>
              <Text style={styles.closeModalButtonText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.forestDark,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  topHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitleText: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
    letterSpacing: 1.5,
  },
  topHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  plusPill: {
    backgroundColor: '#18372C',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  plusPillText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
  },
  upgradeButton: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 24,
  },
  avatarBorderFrame: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: COLORS.gold,
    padding: 3,
    marginBottom: 12,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 42,
  },
  profileNameText: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
    marginBottom: 16,
  },
  quickStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: COLORS.forestCard,
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.forestBorder,
  },
  quickStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
    marginBottom: 2,
  },
  quickStatLabel: {
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
  },
  streakSection: {
    backgroundColor: COLORS.forestCard,
    marginHorizontal: 20,
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.forestBorder,
  },
  streakHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  streakTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
    color: COLORS.cream,
  },
  daysHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    marginBottom: 8,
  },
  dayLabelText: {
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
    width: 32,
    textAlign: 'center',
  },
  daysPillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  dayPill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayPillActive: {
    backgroundColor: COLORS.gold,
  },
  dayPillInactive: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.forestBorder,
  },
  dayNumText: {
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
  },
  dayNumTextActive: {
    color: '#FFFFFF',
  },
  dayNumTextInactive: {
    color: COLORS.muted,
  },
  streakCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.forestBorder,
  },
  streakCountNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.gold,
  },
  streakCountText: {
    fontSize: 13,
    fontFamily: FONTS.sansMedium,
    color: COLORS.cream,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statTile: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  statTileNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    marginBottom: 2,
  },
  statTileLabel: {
    fontSize: 10,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.ember,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarPlaceholderText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
    color: COLORS.creamLight,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
    marginBottom: 8,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(200, 84, 31, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
    color: COLORS.ember,
  },
  menuContainer: {
    backgroundColor: COLORS.forestCard,
    borderRadius: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: COLORS.forestBorder,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.forestBorder,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.sansMedium,
    color: COLORS.creamLight,
  },
  logoutButton: {
    marginHorizontal: 20,
    backgroundColor: COLORS.forestCard,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.forestBorder,
    marginBottom: 48,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.sansBold,
    color: '#FF453A',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.forestCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.forestBorder,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 6,
  },
  presetButton: {
    flex: 1,
    backgroundColor: COLORS.forestDark,
    borderWidth: 1,
    borderColor: COLORS.forestBorder,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  presetButtonActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  presetText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
    color: COLORS.creamLight,
  },
  presetTextActive: {
    color: COLORS.forest,
  },
  customInput: {
    backgroundColor: COLORS.forestDark,
    borderWidth: 1,
    borderColor: COLORS.forestBorder,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    color: COLORS.cream,
    fontSize: 16,
    fontFamily: FONTS.sansRegular,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.forestBorder,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
    color: COLORS.muted,
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.ember,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.sansBold,
    color: '#FFFFFF',
  },
  closeModalButton: {
    width: '100%',
    backgroundColor: COLORS.forestDark,
    borderWidth: 1,
    borderColor: COLORS.forestBorder,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  closeModalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.sansBold,
    color: COLORS.creamLight,
  },
  detailsBlock: {
    backgroundColor: COLORS.forestDark,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.forestBorder,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsLabel: {
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
  },
  detailsValue: {
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    fontWeight: 'bold',
    color: COLORS.cream,
  },
  subscriptionStatusCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gold,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  subStatusLabel: {
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
    marginBottom: 4,
  },
  subStatusValue: {
    fontSize: 18,
    fontFamily: FONTS.serifBold,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  perkText: {
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
    color: COLORS.creamLight,
  },
  faqBlock: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.forestBorder,
    paddingBottom: 12,
  },
  faqQuestion: {
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    fontWeight: 'bold',
    color: COLORS.cream,
    marginBottom: 6,
  },
  faqAnswer: {
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
    lineHeight: 18,
  },
});
