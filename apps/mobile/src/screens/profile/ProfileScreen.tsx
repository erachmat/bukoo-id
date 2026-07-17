import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/authStore';
import { useLogout } from '../../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const { mutate: logout } = useLogout();
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
      setActiveModal('subscription');
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
        <View style={styles.header}>
          <Text style={styles.title}>Profil</Text>
        </View>

        <View style={styles.profileCard}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Pengguna BUKOO'}</Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
            
            {user?.subscriptionTier && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{user.subscriptionTier}</Text>
              </View>
            )}
          </View>
        </View>

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
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.forestCard,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: COLORS.forestBorder,
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
    marginHorizontal: 20,
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
    marginBottom: 40,
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
