import AsyncStorage from '@react-native-async-storage/async-storage';

const GOALS_STORAGE_KEY = '@bukoo_reading_goals';

function goalsStorageKey(userId: string | null): string | null {
  return userId ? `${GOALS_STORAGE_KEY}:${userId}` : null;
}

export interface DayReadingLog {
  dateStr: string; // YYYY-MM-DD
  seconds: number;
}

export interface ReadingGoalsState {
  targetMinutes: number; // default 15
  dailyLogs: Record<string, number>; // dateStr -> seconds
  streakDays: number;
  lastReadDateStr: string | null;
}

const DEFAULT_STATE: ReadingGoalsState = {
  targetMinutes: 15,
  dailyLogs: {},
  streakDays: 0,
  lastReadDateStr: null,
};

function getTodayStr(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

export const readingGoalService = {
  getGoalsState: async (userId: string | null): Promise<ReadingGoalsState> => {
    try {
      const key = goalsStorageKey(userId);
      if (!key) return { ...DEFAULT_STATE, dailyLogs: {} };
      const data = await AsyncStorage.getItem(key);
      if (!data) return DEFAULT_STATE;
      const parsed = JSON.parse(data);
      return {
        ...DEFAULT_STATE,
        ...parsed,
      };
    } catch (e) {
      console.error('[readingGoalService] Error loading goals state:', e);
      return DEFAULT_STATE;
    }
  },

  setTargetMinutes: async (userId: string | null, minutes: number): Promise<void> => {
    try {
      const state = await readingGoalService.getGoalsState(userId);
      state.targetMinutes = minutes;
      const key = goalsStorageKey(userId);
      if (key) await AsyncStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.error('[readingGoalService] Error setting target minutes:', e);
    }
  },

  getTodayReadingSeconds: async (userId: string | null): Promise<number> => {
    const state = await readingGoalService.getGoalsState(userId);
    const today = getTodayStr();
    return state.dailyLogs[today] || 0;
  },

  recordReadingTime: async (userId: string | null, additionalSeconds: number): Promise<{ isGoalAchievedNow: boolean; state: ReadingGoalsState }> => {
    if (!userId) return { isGoalAchievedNow: false, state: { ...DEFAULT_STATE, dailyLogs: {} } };
    const state = await readingGoalService.getGoalsState(userId);
    const today = getTodayStr();
    const prevTodaySeconds = state.dailyLogs[today] || 0;
    const newTodaySeconds = prevTodaySeconds + additionalSeconds;

    state.dailyLogs[today] = newTodaySeconds;

    // Check streak calculation
    if (state.lastReadDateStr !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (state.lastReadDateStr === yesterdayStr) {
        state.streakDays += 1;
      } else if (state.lastReadDateStr !== today) {
        state.streakDays = 1;
      }
      state.lastReadDateStr = today;
    }

    const targetSeconds = state.targetMinutes * 60;
    const wasAchievedBefore = prevTodaySeconds >= targetSeconds;
    const isGoalAchievedNow = !wasAchievedBefore && newTodaySeconds >= targetSeconds;

    try {
      const key = goalsStorageKey(userId);
      if (key) await AsyncStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.error('[readingGoalService] Error saving goals state:', e);
    }

    return { isGoalAchievedNow, state };
  },

  getWeekLogs: async (userId: string | null): Promise<{ dayLabel: string; dateStr: string; minutes: number; isCompleted: boolean }[]> => {
    const state = await readingGoalService.getGoalsState(userId);
    const result = [];
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = days[d.getDay()];
      const seconds = state.dailyLogs[dateStr] || 0;
      const minutes = Math.round(seconds / 60);

      result.push({
        dayLabel,
        dateStr,
        minutes,
        isCompleted: minutes >= state.targetMinutes,
      });
    }

    return result;
  },

  getMonthLogs: async (
    userId: string | null,
    year: number,
    month: number,
  ): Promise<{ dayLabel: string; dateStr: string; minutes: number; isCompleted: boolean }[]> => {
    const state = await readingGoalService.getGoalsState(userId);
    const result = [];
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dateStr = date.toISOString().split('T')[0];
      const dayLabel = days[date.getDay()];
      const seconds = state.dailyLogs[dateStr] || 0;
      const minutes = Math.round(seconds / 60);

      result.push({
        dayLabel,
        dateStr,
        minutes,
        isCompleted: minutes >= state.targetMinutes,
      });
    }

    return result;
  },
};
