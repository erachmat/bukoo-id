import { useState, useEffect, type ComponentProps } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/COLORS';
import { FONTS } from '../../../constants/FONTS';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { notificationService, AppNotification, ReminderSettings } from '../../../services/notificationService';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  onNotificationsChanged?: () => void;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type TabType = 'semua' | 'unread' | 'settings';

const TIME_PRESETS = ['19:00', '20:00', '21:00', '22:00'];

function formatTimestamp(ts: string): string {
  // Seed notifications use human strings ('Baru saja'); real ones use ISO.
  if (!/^\d{4}-/.test(ts)) return ts;
  const diffMs = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} mnt lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return new Date(ts).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export function NotificationModal({ visible, onClose, onNotificationsChanged }: NotificationModalProps) {
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<TabType>('semua');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
    enabled: false,
    timeStr: '20:00',
  });
  const [reminderMessage, setReminderMessage] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  const loadData = async () => {
    const list = await notificationService.getNotifications();
    setNotifications(list);
    const settings = await notificationService.getReminderSettings();
    setReminderSettings(settings);
    setReminderMessage(null);
  };

  const handleMarkAllRead = async () => {
    const updated = await notificationService.markAllAsRead();
    setNotifications(updated);
    if (onNotificationsChanged) onNotificationsChanged();
  };

  const handleItemPress = async (notif: AppNotification) => {
    if (!notif.isRead) {
      const updated = await notificationService.markAsRead(notif.id);
      setNotifications(updated);
      if (onNotificationsChanged) onNotificationsChanged();
    }
    // Deep-link to the tagged book when present.
    if (notif.targetBookId) {
      onClose();
      navigation.navigate('ReadingStack', {
        screen: 'BookDetail',
        params: { bookId: notif.targetBookId },
      });
    }
  };

  const handleToggleReminder = async (enabled: boolean) => {
    const updated = { ...reminderSettings, enabled };
    setReminderSettings(updated);
    setReminderMessage(null);
    try {
      const saved = await notificationService.saveReminderSettings(updated);
      setReminderSettings(saved);
      setReminderMessage(
        enabled
          ? 'Pengingat harian aktif. Izin notifikasi mungkin diminta.'
          : 'Pengingat harian dinonaktifkan.',
      );
    } catch (e) {
      console.error('[NotificationModal] failed to save reminder:', e);
      setReminderMessage('Gagal menyimpan pengaturan. Coba lagi.');
      setReminderSettings((prev) => ({ ...prev, enabled: !enabled }));
    }
  };

  const handleSelectTime = async (timeStr: string) => {
    const updated = { ...reminderSettings, timeStr };
    setReminderSettings(updated);
    setReminderMessage(null);
    try {
      await notificationService.saveReminderSettings(updated);
      setReminderMessage(`Pengingat harian dijadwalkan pukul ${timeStr}.`);
    } catch (e) {
      console.error('[NotificationModal] failed to save reminder time:', e);
      setReminderMessage('Gagal mengubah waktu pengingat. Coba lagi.');
    }
  };

  const displayedList = activeTab === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getTypeIcon = (type: AppNotification['type']): { name: ComponentProps<typeof Ionicons>['name']; color: string } => {
    switch (type) {
      case 'streak':
        return { name: 'flame', color: '#EF4444' };
      case 'book':
        return { name: 'book', color: COLORS.gold };
      case 'community':
        return { name: 'chatbubbles', color: '#3B82F6' };
      default:
        return { name: 'notifications', color: '#10B981' };
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="notifications" size={20} color={COLORS.gold} />
              <Text style={styles.title}>Pemberitahuan</Text>
              {unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={handleMarkAllRead}>
                  <Text style={styles.markReadText}>Tandai Dibaca</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={22} color={COLORS.creamLight} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sub Navigation Tabs */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'semua' && styles.tabButtonActive]}
              onPress={() => setActiveTab('semua')}
            >
              <Text style={[styles.tabText, activeTab === 'semua' && styles.tabTextActive]}>Semua</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'unread' && styles.tabButtonActive]}
              onPress={() => setActiveTab('unread')}
            >
              <Text style={[styles.tabText, activeTab === 'unread' && styles.tabTextActive]}>
                Belum Dibaca ({unreadCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'settings' && styles.tabButtonActive]}
              onPress={() => setActiveTab('settings')}
            >
              <Ionicons
                name="alarm-outline"
                size={14}
                color={activeTab === 'settings' ? COLORS.gold : COLORS.creamLight}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive]}>Pengingat</Text>
            </TouchableOpacity>
          </View>

          {/* Tab Contents */}
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {activeTab !== 'settings' ? (
              displayedList.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="notifications-off-outline" size={36} color={COLORS.muted} />
                  <Text style={styles.emptyText}>Tidak ada pemberitahuan.</Text>
                </View>
              ) : (
                displayedList.map((notif) => {
                  const iconInfo = getTypeIcon(notif.type);
                  return (
                    <TouchableOpacity
                      key={notif.id}
                      style={[styles.notifCard, !notif.isRead && styles.notifCardUnread]}
                      onPress={() => handleItemPress(notif)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.iconCircle, { backgroundColor: iconInfo.color + '20' }]}>
                        <Ionicons name={iconInfo.name} size={18} color={iconInfo.color} />
                      </View>
                      <View style={styles.notifContent}>
                        <View style={styles.notifHeaderRow}>
                          <Text style={styles.notifTitle} numberOfLines={1}>
                            {notif.title}
                          </Text>
                          <Text style={styles.notifTime}>{formatTimestamp(notif.timestamp)}</Text>
                        </View>
                        <Text style={styles.notifBody}>{notif.body}</Text>
                      </View>
                      {!notif.isRead && <View style={styles.redDot} />}
                    </TouchableOpacity>
                  );
                })
              )
            ) : (
              /* Reminder Settings Tab */
              <View style={styles.settingsSection}>
                <View style={styles.toggleRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.settingTitle}>Pengingat Membaca Harian</Text>
                    <Text style={styles.settingSubtitle}>
                      Dapatkan notifikasi harian untuk membangun kebiasaan membaca rutin
                    </Text>
                  </View>
                  <Switch
                    value={reminderSettings.enabled}
                    onValueChange={handleToggleReminder}
                    trackColor={{ false: '#1E4D40', true: COLORS.gold }}
                    thumbColor={reminderSettings.enabled ? '#0A1A15' : COLORS.muted}
                  />
                </View>

                {reminderSettings.enabled && (
                  <View style={styles.timeSection}>
                    <Text style={styles.timeLabel}>Pilih Waktu Pengingat:</Text>
                    <View style={styles.timePresetsRow}>
                      {TIME_PRESETS.map((t) => {
                        const isSelected = reminderSettings.timeStr === t;
                        return (
                          <TouchableOpacity
                            key={t}
                            style={[styles.timePill, isSelected && styles.timePillActive]}
                            onPress={() => handleSelectTime(t)}
                          >
                            <Text style={[styles.timePillText, isSelected && styles.timePillTextActive]}>
                              {t}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    {reminderMessage && <Text style={styles.reminderMessage}>{reminderMessage}</Text>}
                  </View>
                )}
                {!reminderSettings.enabled && reminderMessage && (
                  <Text style={styles.reminderMessage}>{reminderMessage}</Text>
                )}
              </View>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#0F2922',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 24,
    borderWidth: 1,
    borderColor: '#173E33',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#173E33',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  markReadText: {
    color: COLORS.gold,
    fontSize: 12,
    fontFamily: FONTS.sansMedium,
  },
  closeButton: {
    padding: 4,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 8,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#0A1A15',
    borderWidth: 1,
    borderColor: '#1E4D40',
  },
  tabButtonActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  tabText: {
    fontSize: 12,
    color: COLORS.creamLight,
    fontFamily: FONTS.sansMedium,
  },
  tabTextActive: {
    color: '#0A1A15',
    fontWeight: 'bold',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.muted,
    fontFamily: FONTS.sansRegular,
    marginTop: 8,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#0A1A15',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1E4D40',
    gap: 12,
    position: 'relative',
  },
  notifCardUnread: {
    borderColor: COLORS.gold + '60',
    backgroundColor: '#0E241E',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifContent: {
    flex: 1,
  },
  notifHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
    color: COLORS.cream,
    flex: 1,
    marginRight: 6,
  },
  notifTime: {
    fontSize: 10,
    color: COLORS.muted,
  },
  notifBody: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.creamLight,
    fontFamily: FONTS.sansRegular,
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    position: 'absolute',
    top: 12,
    right: 12,
  },
  settingsSection: {
    paddingVertical: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0A1A15',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E4D40',
    marginBottom: 16,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
    color: COLORS.cream,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: COLORS.muted,
    fontFamily: FONTS.sansRegular,
    paddingRight: 10,
  },
  timeSection: {
    backgroundColor: '#0A1A15',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E4D40',
  },
  timeLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.cream,
    marginBottom: 10,
  },
  timePresetsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  timePill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#0F2922',
    borderWidth: 1,
    borderColor: '#1E4D40',
    alignItems: 'center',
  },
  timePillActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  timePillText: {
    fontSize: 13,
    color: COLORS.creamLight,
    fontFamily: FONTS.sansMedium,
  },
  timePillTextActive: {
    color: '#0A1A15',
    fontWeight: 'bold',
  },
  reminderMessage: {
    marginTop: 10,
    fontSize: 12,
    color: COLORS.gold,
    fontFamily: FONTS.sansRegular,
    lineHeight: 17,
  },
});
