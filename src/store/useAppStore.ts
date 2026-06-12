import { create } from 'zustand';
import { SavingRecord, Tree, CategoryId } from '../types';
import { GROWTH, waterFromAmount } from '../constants/growth';
import { storage } from './storage';
import { track } from '../sdk/analytics';
import { maybeRequestReview } from '../sdk/review';

interface PourResult { water: number; completed: boolean }

interface AppState {
  onboarded: boolean;
  records: SavingRecord[];
  trees: Tree[];                 // [0]이 현재 키우는 나무
  streak: number;
  lastActiveDate: string | null; // 'YYYY-MM-DD'
  weeklyGoalKrw: number;         // 주간 목표 (온보딩 월 목표 / 4.345)
  isPremium: boolean;
  adsRemoved: boolean;
  ownedThemes: string[];
  fertilizers: number;
  rewardedAdCountToday: number;
  rewardedAdDate: string | null;
  installedAt: number;
  notif: { weeklyReport: boolean; treeDone: boolean; streakGuard: boolean };

  completeOnboarding(monthlyGoalKrw: number, notif: { weeklyReport: boolean; treeDone: boolean }): void;
  addRecord(category: CategoryId, amount: number, memo?: string): PourResult;
  checkin(): PourResult | null;
  useFertilizer(): PourResult | null;
  grantWater(n: number): PourResult;
  countRewardedAd(): void;
  setTheme(themeId: string): void;
  setWeeklyGoal(krw: number): void;
  setNotif(patch: Partial<AppState['notif']>): void;
  setPremium(v: boolean): void;
  setAdsRemoved(v: boolean): void;
  addFertilizers(n: number): void;
  addTheme(id: string): void;
  resetAll(): void;
}

const todayStr = () => new Date().toISOString().slice(0, 10);
const newTree = (themeId = 'basic'): Tree =>
  ({ id: String(Date.now()), themeId, water: 0, startedAt: Date.now(), savedAmount: 0 });

const PERSIST_KEYS = [
  'onboarded', 'records', 'trees', 'streak', 'lastActiveDate', 'weeklyGoalKrw', 'isPremium',
  'adsRemoved', 'ownedThemes', 'fertilizers', 'rewardedAdCountToday', 'rewardedAdDate',
  'installedAt', 'notif',
] as const;

const DEFAULTS = {
  onboarded: false,
  records: [] as SavingRecord[], trees: [newTree()], streak: 0,
  lastActiveDate: null as string | null,
  weeklyGoalKrw: 50000, isPremium: false, adsRemoved: false,
  ownedThemes: ['basic'], fertilizers: 0,
  rewardedAdCountToday: 0, rewardedAdDate: null as string | null,
  installedAt: Date.now(),
  notif: { weeklyReport: true, treeDone: true, streakGuard: false },
};

function loadInitial() {
  const saved = storage.get<Partial<typeof DEFAULTS>>('app', {});
  const merged = { ...DEFAULTS, ...saved };
  if (!merged.trees || merged.trees.length === 0) merged.trees = [newTree()];
  return merged;
}

export const useAppStore = create<AppState>((set, get) => {
  const persist = () => {
    const s = get();
    storage.set('app', Object.fromEntries(PERSIST_KEYS.map(k => [k, s[k]])));
  };

  const touchStreak = () => {
    const today = todayStr();
    const { lastActiveDate, streak } = get();
    if (lastActiveDate === today) return;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    set({ streak: lastActiveDate === yesterday ? streak + 1 : 1, lastActiveDate: today });
  };

  const pour = (water: number, savedAmount = 0): boolean => {
    const trees = [...get().trees];
    const cur = { ...trees[0] };
    cur.water += water;
    cur.savedAmount += savedAmount;
    let completed = false;
    if (cur.water >= GROWTH.completeAt && !cur.completedAt) {
      cur.completedAt = Date.now();
      completed = true;
      trees[0] = cur;
      trees.unshift(newTree(cur.themeId));
      track('tree_complete');
      maybeRequestReview('tree_complete');
    } else {
      trees[0] = cur;
    }
    set({ trees });
    persist();
    return completed;
  };

  return {
    ...loadInitial(),

    completeOnboarding(monthlyGoalKrw, notif) {
      set({
        onboarded: true,
        weeklyGoalKrw: Math.round(monthlyGoalKrw / 4.345 / 1000) * 1000,
        installedAt: Date.now(),
        notif: { ...get().notif, ...notif },
      });
      persist();
      track('onboard_done', { monthlyGoalKrw });
    },

    addRecord(category, amount, memo) {
      const rec: SavingRecord = {
        id: String(Date.now()), category, amount, memo, createdAt: Date.now(),
      };
      set({ records: [rec, ...get().records] });
      touchStreak();
      const water = waterFromAmount(amount);
      const completed = pour(water, amount);
      track('record_save', { category, amount });
      return { water, completed };
    },

    checkin() {
      const today = todayStr();
      if (get().lastActiveDate === today) return null;   // 오늘 이미 활동함
      touchStreak();
      const completed = pour(GROWTH.checkinWater);
      track('checkin');
      return { water: GROWTH.checkinWater, completed };
    },

    useFertilizer() {
      if (get().fertilizers <= 0) return null;
      set({ fertilizers: get().fertilizers - 1 });
      const completed = pour(GROWTH.fertilizerWater);
      return { water: GROWTH.fertilizerWater, completed };
    },

    grantWater(n) {
      const completed = pour(n);
      track('water', { n });
      return { water: n, completed };
    },

    countRewardedAd() {
      const today = todayStr();
      const sameDay = get().rewardedAdDate === today;
      set({
        rewardedAdDate: today,
        rewardedAdCountToday: sameDay ? get().rewardedAdCountToday + 1 : 1,
      });
      persist();
    },

    setTheme(themeId) {
      if (!get().ownedThemes.includes(themeId)) return;
      const trees = [...get().trees];
      trees[0] = { ...trees[0], themeId };
      set({ trees });
      persist();
    },

    setWeeklyGoal(krw) { set({ weeklyGoalKrw: krw }); persist(); },
    setNotif(patch) { set({ notif: { ...get().notif, ...patch } }); persist(); },
    setPremium(v) { set({ isPremium: v }); persist(); },
    setAdsRemoved(v) { set({ adsRemoved: v }); persist(); },
    addFertilizers(n) { set({ fertilizers: get().fertilizers + n }); persist(); },
    addTheme(id) { set({ ownedThemes: [...new Set([...get().ownedThemes, id])] }); persist(); },

    resetAll() {
      storage.remove('app');
      set({ ...DEFAULTS, trees: [newTree()], installedAt: Date.now(), onboarded: false });
    },
  };
});

// 오늘 리워드 광고 시청 가능 횟수 (날짜 바뀌면 리셋)
export function rewardedAdRemaining(s: Pick<AppState, 'rewardedAdCountToday' | 'rewardedAdDate'>): number {
  const used = s.rewardedAdDate === todayStr() ? s.rewardedAdCountToday : 0;
  return Math.max(GROWTH.rewardedAdDailyLimit - used, 0);
}

// 표시용 유효 스트릭: 마지막 활동이 오늘/어제가 아니면 이미 끊긴 것 (저장값은 기록 시점에 갱신됨)
export function effectiveStreak(s: Pick<AppState, 'streak' | 'lastActiveDate'>): number {
  if (!s.lastActiveDate) return 0;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  return s.lastActiveDate === todayStr() || s.lastActiveDate === yesterday ? s.streak : 0;
}
