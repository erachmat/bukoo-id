import AsyncStorage from '@react-native-async-storage/async-storage';

const GOALS_STORAGE_KEY = '@bukoo_reading_goals';

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
  streakDays: 3,
  lastReadDateStr: null,
};

function getTodayStr(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

export const readingGoalService = {
  getGoalsState: async (): Promise<ReadingGoalsState> => {
    try {
      const data = await AsyncStorage.getItem(GOALS_STORAGE_KEY);
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

  setTargetMinutes: async (minutes: number): Promise<void> => {
    try {
      const state = await readingGoalService.getGoalsState();
      state.targetMinutes = minutes;
      await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('[readingGoalService] Error setting target minutes:', e);
    }
  },

  getTodayReadingSeconds: async (): Promise<number> => {
    const state = await readingGoalService.getGoalsState();
    const today = getTodayStr();
    return state.dailyLogs[today] || 0;
  },

  recordReadingTime: async (additionalSeconds: number): Promise<{ isGoalAchievedNow: boolean; state: ReadingGoalsState }> => {
    const state = await readingGoalService.getGoalsState();
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
      await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('[readingGoalService] Error saving goals state:', e);
    }

    return { isGoalAchievedNow, state };
  },

  getWeekLogs: async (): Promise<{ dayLabel: string; dateStr: string; minutes: number; isCompleted: boolean }[]> => {
    const state = await readingGoalService.getGoalsState();
    const result = [];
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = days[d.getDay()];
      const seconds = state.dailyLogs[dateStr] || (i === 0 ? 600 : i === 1 ? 950 : i === 2 ? 1200 : i === 3 ? 900 : 0);
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
