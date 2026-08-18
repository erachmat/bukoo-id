import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  type: 'book' | 'community' | 'streak' | 'system';
  targetBookId?: string;
}

export interface ReminderSettings {
  enabled: boolean;
  timeStr: string; // e.g. "20:00"
}

const NOTIFICATIONS_KEY = '@bukoo_notifications';
const REMINDER_KEY = '@bukoo_reminder_settings';

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: '🔥 Pertahankan Streak Membaca!',
    body: 'Kamu sudah membaca 3 hari berturut-turut. Luangkan 15 menit malam ini untuk mencapai target 4 hari!',
    timestamp: '2 jam lalu',
    isRead: false,
    type: 'streak',
  },
  {
    id: 'notif-2',
    title: '📖 Rilis Baru: Laut Bercerita (Edisi Spesial)',
    body: 'Buku karya Leila S. Chudori telah tersedia di BUKOO. Mulai baca sampel sekarang!',
    timestamp: 'Hari ini 09:00',
    isRead: false,
    type: 'book',
    targetBookId: 'book_laut_bercerita',
  },
  {
    id: 'notif-3',
    title: '💬 Tanggapan Baru di Komunitas',
    body: 'Siti Rahma mengomentari postinganmu di diskusi Laut Bercerita: "Sangat setuju!..."',
    timestamp: 'Kemarin 21:15',
    isRead: true,
    type: 'community',
  },
  {
    id: 'notif-4',
    title: '🎉 Selamat Datang di BUKOO Premium',
    body: 'Nikmati akses tanpa batas ke ribuan koleksi e-book dan fitur AI Reading Assistant.',
    timestamp: '3 hari lalu',
    isRead: true,
    type: 'system',
  },
];

const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: true,
  timeStr: '20:00',
};

export const notificationService = {
  getNotifications: async (): Promise<AppNotification[]> => {
    try {
      const data = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (!data) return DEFAULT_NOTIFICATIONS;
      return JSON.parse(data);
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  },

  getUnreadCount: async (): Promise<number> => {
    const list = await notificationService.getNotifications();
    return list.filter((n) => !n.isRead).length;
  },

  markAsRead: async (notifId: string): Promise<AppNotification[]> => {
    const list = await notificationService.getNotifications();
    const updated = list.map((n) => (n.id === notifId ? { ...n, isRead: true } : n));
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    return updated;
  },

  markAllAsRead: async (): Promise<AppNotification[]> => {
    const list = await notificationService.getNotifications();
    const updated = list.map((n) => ({ ...n, isRead: true }));
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    return updated;
  },

  getReminderSettings: async (): Promise<ReminderSettings> => {
    try {
      const data = await AsyncStorage.getItem(REMINDER_KEY);
      if (!data) return DEFAULT_REMINDER_SETTINGS;
      return JSON.parse(data);
    } catch {
      return DEFAULT_REMINDER_SETTINGS;
    }
  },

  saveReminderSettings: async (settings: ReminderSettings): Promise<void> => {
    try {
      await AsyncStorage.setItem(REMINDER_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('[notificationService] Error saving reminder settings:', e);
    }
  },
};
