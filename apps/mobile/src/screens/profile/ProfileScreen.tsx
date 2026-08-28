import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { readingSync } from '../../services/readingSync';
import { readingGoalService } from '../../services/readingGoalService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList & MainTabParamList>;

import { ReadingAnalyticsModal } from './components/ReadingAnalyticsModal';
import { EditProfileModal } from './components/EditProfileModal';
import ResponsiveContainer from '../../components/ResponsiveContainer';
import { useIsTablet } from '../../hooks/useResponsive';
import { useThreeButtonNav } from '../../hooks/useSystemNav';
import { AVATAR_PRESETS } from '../../services/userProfileService';
import { ShareSheetModal, ShareSheetOption } from '../../components/share/ShareSheetModal';
import { appShareLink } from '../../services/shareService';

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const { mutate: logout } = useLogout();
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  const isTablet = useIsTablet();
  const insets = useSafeAreaInsets();
  const isThreeButton = useThreeButtonNav();

  const [activeModal, setActiveModal] = useState<'account' | 'subscription' | 'preferences' | 'support' | 'about' | null>(null);
  const [newGoalMinutes, setNewGoalMinutes] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const [stats, setStats] = useState({ finishedBooks: 0, totalMinutes: 0, streakDays: 0 });
  const [weekLogs, setWeekLogs] = useState<{ dayLabel: string; dateStr: string; minutes: number; isCompleted: boolean }[]>([]);
  const [calendarView, setCalendarView] = useState<'week' | 'month'>('week');
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [monthLogs, setMonthLogs] = useState<{ dayLabel: string; dateStr: string; minutes: number; isCompleted: boolean }[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [finishedBooks, totalMinutes, goals, week] = await Promise.all([
        readingSync.getFinishedBooksCount(),
        readingSync.getTotalReadingMinutes(),
        readingGoalService.getGoalsState(),
        readingGoalService.getWeekLogs(),
      ]);
      if (!mounted) return;
      setStats({ finishedBooks, totalMinutes, streakDays: goals.streakDays ?? 0 });
      setWeekLogs(week);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    readingGoalService.getMonthLogs(viewYear, viewMonth).then((logs) => {
      if (mounted) setMonthLogs(logs);
    });
    return () => {
      mounted = false;
    };
  }, [viewYear, viewMonth]);

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
    setShowLogoutModal(true);
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
      setNewGoalMinutes(goalsData?.dailyGoalMinutes?.toString() || '30');
    } else if (itemId === 'support') {
      setActiveModal('support');
    } else if (itemId === 'about') {
      setActiveModal('about');
    }
  };

  const activeTier = user?.subscription?.active ? user.subscription.tier : 'FREE';

  const statsShareOptions: ShareSheetOption[] = [
    {
      key: 'stats',
      label: 'Kartu Statistik',
      data: {
        variant: 'stats',
        userName: user?.name || 'Pembaca BUKOO',
        finishedBooks: stats.finishedBooks,
        readingHours: Math.round(stats.totalMinutes / 60),
        streakDays: stats.streakDays,
      },
    },
  ];

  // Week calendar: month/year label for the header, and today's dateStr for the highlight.
  const todayStr = new Date().toISOString().split('T')[0];
  const weekMonthLabel =
    weekLogs.length > 0
      ? new Date(weekLogs[0].dateStr + 'T00:00:00').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
      : '';

  // Month calendar view.
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const firstWeekdayOfMonth = new Date(viewYear, viewMonth, 1).getDay();

  const goPrevMonth = () => {
    const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    setViewMonth(prevMonth);
    if (viewMonth === 0) setViewYear(viewYear - 1);
  };
  const goNextMonth = () => {
    const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    setViewMonth(nextMonth);
    if (viewMonth === 11) setViewYear(viewYear + 1);
  };

  // Profile header (avatar / name / Edit Profil) — reused by both phone and tablet layouts.
  const profileSection = (
    <View style={[styles.profileSection, isTablet && styles.profileSectionTablet]}>
      <TouchableOpacity
        style={[styles.avatarBorderFrame, isTablet && styles.avatarBorderFrameTablet]}
        onPress={() => setActiveModal('account')}
        activeOpacity={0.8}
      >
        {user?.avatarUrl?.startsWith('http://') || user?.avatarUrl?.startsWith('https://') ? (
          <Image source={{ uri: user.avatarUrl }} style={[styles.avatarImage, isTablet && styles.avatarImageTablet]} />
        ) : (() => {
          const presetObj = AVATAR_PRESETS.find((p) => p.id === user?.avatarUrl) || AVATAR_PRESETS[0];
          return (
            <View style={[styles.avatarImage, isTablet && styles.avatarImageTablet, { backgroundColor: presetObj.bgColor, alignItems: 'center', justifyContent: 'center' }]}>
              <Text style={{ fontSize: 36 }}>{presetObj.emoji}</Text>
            </View>
          );
        })()}
      </TouchableOpacity>

      <Text style={styles.profileNameText}>{user?.name || 'Pengguna BUKOO'}</Text>

      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          backgroundColor: 'rgba(217, 119, 6, 0.15)',
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 14,
          marginBottom: 14,
          borderWidth: 1,
          borderColor: 'rgba(217, 119, 6, 0.3)',
        }}
        onPress={() => setActiveModal('account')}
      >
        <Ionicons name="create-outline" size={14} color={COLORS.gold} />
        <Text style={{ color: COLORS.gold, fontSize: 12, fontWeight: 'bold', fontFamily: FONTS.sansBold }}>Edit Profil</Text>
      </TouchableOpacity>

      {/* Quick Stats Row */}
      {/* <View style={styles.quickStatsRow}>
        <View style={styles.quickStatItem}>
          <Text style={styles.quickStatNumber}>{stats.finishedBooks}</Text>
          <Text style={styles.quickStatLabel}>Selesai</Text>
        </View>
        <View style={styles.quickStatItem}>
          <Text style={styles.quickStatNumber}>{Math.round(stats.totalMinutes / 60)}</Text>
          <Text style={styles.quickStatLabel}>jam baca</Text>
        </View>
      </View> */}
    </View>
  );

  // "Pencapaian" achievements stats — always a full-width section.
  const pencapaianSection = (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Pencapaian</Text>
        <TouchableOpacity
          style={styles.shareIconBtn}
          onPress={() => setShareVisible(true)}
          hitSlop={8}
          accessibilityLabel="Bagikan pencapaian"
        >
          <Ionicons name="share-outline" size={20} color={COLORS.gold} />
        </TouchableOpacity>
      </View>
      <View style={styles.statsGrid}>
        <View style={[styles.statTile, { backgroundColor: '#0D2721', borderColor: '#18382F' }]}>
          <Ionicons name="book-outline" size={22} color="#4ADE80" style={{ marginBottom: 6 }} />
          <Text style={[styles.statTileNumber, { color: '#4ADE80' }]}>{stats.finishedBooks}</Text>
          <Text style={styles.statTileLabel}>Buku selesai</Text>
        </View>
        <View style={[styles.statTile, { backgroundColor: '#0D2721', borderColor: '#18382F' }]}>
          <Ionicons name="time-outline" size={22} color="#4ADE80" style={{ marginBottom: 6 }} />
          <Text style={[styles.statTileNumber, { color: '#4ADE80' }]}>{Math.round(stats.totalMinutes / 60)}</Text>
          <Text style={styles.statTileLabel}>Jam Membaca</Text>
        </View>
        <View style={[styles.statTile, { backgroundColor: '#0D2721', borderColor: '#18382F' }]}>
          <Ionicons name="flame-outline" size={22} color="#4ADE80" style={{ marginBottom: 6 }} />
          <Text style={[styles.statTileNumber, { color: '#4ADE80' }]}>{stats.streakDays}</Text>
          <Text style={styles.statTileLabel}>Hari Streak</Text>
        </View>
      </View>
    </View>
  );

  // Reading-streak calendar (Week / Month) — side-by-side with the profile on tablet,
  // below Pencapaian on phone.
  const streakSection = (
    <View style={[styles.streakSection, isTablet && styles.streakSectionTablet]}>
      <View style={styles.streakHeaderRow}>
        <View style={styles.streakTitleRow}>
          <Text style={styles.streakTitle}>{calendarView === 'month' ? 'Bulan Ini' : ''}</Text>
          {calendarView === 'week' && weekMonthLabel !== '' && (
            <Text style={styles.streakMonthLabel}>{weekMonthLabel}</Text>
          )}
        </View>
        <View style={styles.calendarToggle}>
          <TouchableOpacity
            style={[styles.calendarToggleChip, calendarView === 'week' && styles.calendarToggleChipActive]}
            onPress={() => setCalendarView('week')}
          >
            <Text style={[styles.calendarToggleText, calendarView === 'week' && styles.calendarToggleTextActive]}>
              Minggu
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.calendarToggleChip, calendarView === 'month' && styles.calendarToggleChipActive]}
            onPress={() => setCalendarView('month')}
          >
            <Text style={[styles.calendarToggleText, calendarView === 'month' && styles.calendarToggleTextActive]}>
              Bulan
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {calendarView === 'week' ? (
        /* Days — label + pill + minutes per day */
        <View style={styles.daysRow}>
          {weekLogs.map((day) => {
            const isToday = day.dateStr === todayStr;
            const dayNum = new Date(day.dateStr).getDate();
            return (
              <View key={`day-${day.dateStr}`} style={styles.dayCol}>
                <Text style={[styles.dayLabelText, isToday && styles.dayLabelTextToday]}>
                  {day.dayLabel}
                </Text>
                <View
                  style={[
                    styles.dayPill,
                    day.isCompleted ? styles.dayPillActive : styles.dayPillInactive,
                    isToday && styles.dayPillToday,
                  ]}
                >
                  <Text style={[styles.dayNumText, day.isCompleted ? styles.dayNumTextActive : styles.dayNumTextInactive]}>
                    {dayNum}
                  </Text>
                </View>
                <Text style={styles.dayMinutesText}>{day.minutes > 0 ? `${day.minutes}m` : '·'}</Text>
              </View>
            );
          })}
        </View>
      ) : (
        /* Month — prev/next nav + 7-column grid with leading blanks */
        <>
          <View style={styles.monthNavRow}>
            <TouchableOpacity style={styles.monthNavButton} onPress={goPrevMonth} hitSlop={8}>
              <Ionicons name="chevron-back" size={20} color={COLORS.gold} />
            </TouchableOpacity>
            <Text style={styles.monthLabel}>{monthLabel}</Text>
            <TouchableOpacity style={styles.monthNavButton} onPress={goNextMonth} hitSlop={8}>
              <Ionicons name="chevron-forward" size={20} color={COLORS.gold} />
            </TouchableOpacity>
          </View>
          <View style={styles.daysRow}>
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
              <Text key={d} style={styles.monthWeekdayLabel}>{d}</Text>
            ))}
          </View>
          <View style={styles.monthGrid}>
            {Array.from({ length: firstWeekdayOfMonth }).map((_, i) => (
              <View key={`blank-${i}`} style={styles.monthCell} />
            ))}
            {monthLogs.map((day) => {
              const isToday = day.dateStr === todayStr;
              const dayNum = new Date(day.dateStr).getDate();
              return (
                <View key={day.dateStr} style={styles.monthCell}>
                  <View
                    style={[
                      styles.dayPill,
                      day.isCompleted ? styles.dayPillActive : styles.dayPillInactive,
                      isToday && styles.dayPillToday,
                    ]}
                  >
                    <Text style={[styles.dayNumText, day.isCompleted ? styles.dayNumTextActive : styles.dayNumTextInactive]}>
                      {dayNum}
                    </Text>
                  </View>
                  <Text style={styles.dayMinutesText}>{day.minutes > 0 ? `${day.minutes}m` : '·'}</Text>
                </View>
              );
            })}
          </View>
        </>
      )}

      {/* Streak Indicator */}
      <TouchableOpacity style={styles.streakCountRow} onPress={() => setShowAnalyticsModal(true)}>
        <Ionicons name="flame" size={22} color={COLORS.gold} />
        <Text style={styles.streakCountNumber}>{stats.streakDays}</Text>
        <Text style={styles.streakCountText}>Hari Berturut-turut (Lihat Analitik)</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isThreeButton && { paddingBottom: 40 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ResponsiveContainer>
        {/* Top Header Bar with Logo & Subscription Status */}
        <View style={styles.topHeaderBar}>
          <View style={styles.brandContainer}>
            <LogoBukoo size={30} />
          </View>

          <View style={styles.topHeaderActions}>
            <View style={styles.plusPill}>
              <Text style={styles.plusPillText}>{activeTier === 'FREE' ? 'GRATIS' : activeTier}</Text>
            </View>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => navigation.navigate('Subscription')}
              activeOpacity={0.8}
            >
              <Text style={styles.upgradeButtonText}>Langganan</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile header + streak — side-by-side on tablets, stacked on phones.
            Tablet: row = profile + streak only; Pencapaian renders full-width below. */}
        {isTablet ? (
          <>
            <View style={styles.profileTopRow}>
              {profileSection}
              {streakSection}
            </View>
            {pencapaianSection}
          </>
        ) : (
          <>
            {profileSection}
            {pencapaianSection}
            {streakSection}
          </>
        )}

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
        </ResponsiveContainer>
      </ScrollView>


      {/* Edit Profile Modal */}
      <EditProfileModal visible={activeModal === 'account'} onClose={() => setActiveModal(null)} />

      {/* Preferences (Goals) Modal */}
      <Modal visible={activeModal === 'preferences'} transparent animationType="fade" onRequestClose={() => setActiveModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, isTablet && styles.modalCardTablet]}>
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
          <View style={[styles.modalCard, isTablet && styles.modalCardTablet]}>
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
          <View style={[styles.modalCard, isTablet && styles.modalCardTablet]}>
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
              <Text style={{ fontSize: 13, fontFamily: FONTS.sansBold, fontWeight: 'bold', color: COLORS.cream, marginBottom: 12 }}>PT BUKOO Digital Indonesia</Text>
              <Text style={{ fontSize: 11, fontFamily: FONTS.sansRegular, color: COLORS.muted }}>Copyright © 2026. Hak Cipta Dilindungi.</Text>
            </View>
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setActiveModal(null)}>
              <Text style={styles.closeModalButtonText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Custom Logout Modal */}
      <Modal visible={showLogoutModal} transparent animationType="fade" onRequestClose={() => setShowLogoutModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.logoutModalCard, isTablet && styles.logoutModalCardTablet]}>
            <View style={styles.logoutIconBadge}>
              <Ionicons name="log-out-outline" size={32} color="#EF4444" />
            </View>

            <Text style={styles.logoutModalTitle}>Keluar dari BUKOO?</Text>
            <Text style={styles.logoutModalSubtitle}>
              Apakah Anda yakin ingin keluar dari akun Anda? Sesi membaca dan progress Anda tersimpan dengan aman.
            </Text>

            <View style={styles.logoutModalActions}>
              <TouchableOpacity style={styles.logoutCancelButton} onPress={() => setShowLogoutModal(false)}>
                <Text style={styles.logoutCancelText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.logoutConfirmButton}
                onPress={() => {
                  setShowLogoutModal(false);
                  logout();
                }}
              >
                <Text style={styles.logoutConfirmText}>Ya, Keluar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reading Analytics Modal */}
      <ReadingAnalyticsModal
        visible={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
      />

      {/* Share to social media */}
      <ShareSheetModal
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        options={statsShareOptions}
        link={appShareLink}
      />
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
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  profileSectionTablet: {
    flex: 1,
    paddingHorizontal: 0,
    marginTop: 0,
    marginBottom: 0,
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
  avatarBorderFrameTablet: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 42,
  },
  avatarImageTablet: {
    borderRadius: 52,
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
  streakSectionTablet: {
    // Calendar needs >=294px for the 7 day-cols; profile stays flex:1 (~238px).
    flex: 1.3,
    marginHorizontal: 0,
    marginBottom: 0,
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
  streakMonthLabel: {
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
  },
  streakTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calendarToggle: {
    flexDirection: 'row',
    backgroundColor: '#0A1A15',
    borderRadius: 12,
    padding: 3,
    gap: 2,
  },
  calendarToggleChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9,
  },
  calendarToggleChipActive: {
    backgroundColor: COLORS.gold,
  },
  calendarToggleText: {
    fontSize: 11,
    fontFamily: FONTS.sansMedium,
    color: COLORS.muted,
  },
  calendarToggleTextActive: {
    color: '#0A1A15',
    fontWeight: 'bold',
  },
  monthNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 12,
  },
  monthNavButton: {
    padding: 6,
  },
  monthLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
    color: COLORS.cream,
    minWidth: 140,
    textAlign: 'center',
  },
  monthWeekdayLabel: {
    fontSize: 11,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
    width: 36,
    textAlign: 'center',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  monthCell: {
    width: '14.28%',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  dayCol: {
    alignItems: 'center',
    gap: 6,
  },
  dayLabelText: {
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
    width: 36,
    textAlign: 'center',
  },
  dayLabelTextToday: {
    color: COLORS.gold,
    fontWeight: 'bold',
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
  dayPillToday: {
    borderWidth: 2,
    borderColor: COLORS.gold,
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
  dayMinutesText: {
    fontSize: 10,
    fontFamily: FONTS.sansRegular,
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
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shareIconBtn: {
    width: 22,
    height: 22,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: COLORS.gold,
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
  modalCardTablet: {
    maxWidth: 440,
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
  logoutModalCard: {
    width: '88%',
    backgroundColor: '#122B23',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1D4437',
    padding: 24,
    alignItems: 'center',
  },
  logoutModalCardTablet: {
    maxWidth: 440,
  },
  logoutIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
    marginBottom: 8,
    textAlign: 'center',
  },
  logoutModalSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  logoutModalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  logoutCancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1D4437',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 25, 20, 0.5)',
  },
  logoutCancelText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
    color: COLORS.creamLight,
  },
  logoutConfirmButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutConfirmText: {
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
    color: '#FFFFFF',
  },
});
