import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { api, getOrCreateDeviceId } from './api';

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
const REMINDER_NOTIF_ID = 'bukoo-daily-reading-reminder';
const MAX_NOTIFICATIONS = 50;

/** Initial seed — real system notifications, not fabricated social activity. */
const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-welcome',
    title: '🎉 Selamat Datang di BUKOO',
    body: 'Nikmati ribuan koleksi e-book, fitur AI Reading Assistant, dan komunitas pembaca Indonesia.',
    timestamp: 'Baru saja',
    isRead: false,
    type: 'system',
  },
];

const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: false,
  timeStr: '20:00',
};

/** Handles foreground presentation of OS notifications. */
export function setNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

function parseTime(timeStr: string): { hour: number; minute: number } {
  const [h = 20, m = 0] = timeStr.split(':').map((n) => parseInt(n, 10));
  return { hour: Number.isFinite(h) ? h : 20, minute: Number.isFinite(m) ? m : 0 };
}

async function scheduleDailyReminder(settings: ReminderSettings): Promise<void> {
  if (!settings.enabled) {
    await Notifications.cancelScheduledNotificationAsync(REMINDER_NOTIF_ID).catch(() => {});
    return;
  }

  const permission = await Notifications.getPermissionsAsync();
  let granted = permission.granted;
  if (!granted) {
    const requested = await Notifications.requestPermissionsAsync();
    granted = requested.granted;
  }
  if (!granted) return;

  const { hour, minute } = parseTime(settings.timeStr);
  // Cancel first so re-scheduling with a changed time replaces the old one.
  await Notifications.cancelScheduledNotificationAsync(REMINDER_NOTIF_ID).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_NOTIF_ID,
    content: {
      title: '⏰ Waktunya Membaca',
      body: 'Jangan lupa capai target membaca harianmu hari ini! 15 menit saja sudah cukup.',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

/** Applies the persisted reminder settings on boot (scheduling is not persisted). */
export async function initReminderScheduler(): Promise<void> {
  const settings = await notificationService.getReminderSettings();
  await scheduleDailyReminder(settings);
}

const EAS_PROJECT_ID = 'a2c42730-2fc3-4a3c-bc70-007233308be5';

/**
 * Registers this device's push token with the backend (device_tokens table).
 * Silently no-ops in Expo Go / dev builds where a push token isn't available.
 */
export async function registerDeviceToken(): Promise<void> {
  try {
    const deviceId = await getOrCreateDeviceId();
    const platform = Platform.OS === 'ios' ? 'IOS' : 'ANDROID';
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId: EAS_PROJECT_ID });
    if (!token) return;
    await api.post('/notifications/device-token', { token, platform, deviceId });
  } catch (e) {
    console.warn('[notificationService] Device token registration skipped:', e);
  }
}

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

  /** Adds a new in-app notification (prepends, capped). */
  addNotification: async (notif: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>): Promise<AppNotification[]> => {
    const list = await notificationService.getNotifications();
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    const updated = [newNotif, ...list].slice(0, MAX_NOTIFICATIONS);
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('[notificationService] Error saving notification:', e);
    }
    return updated;
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
      return { ...DEFAULT_REMINDER_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_REMINDER_SETTINGS;
    }
  },

  /** Persists settings AND (re)schedules/cancels the real OS notification. */
  saveReminderSettings: async (settings: ReminderSettings): Promise<ReminderSettings> => {
    try {
      await AsyncStorage.setItem(REMINDER_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('[notificationService] Error saving reminder settings:', e);
    }
    await scheduleDailyReminder(settings);
    return settings;
  },
};
