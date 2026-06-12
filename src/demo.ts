// 스토어 스크린샷 촬영용 데모 데이터 시딩 (?demo=1, 개발 모드 전용)
// 주의: zustand 스토어가 모듈 평가 시점에 localStorage를 읽으므로,
// 이 모듈은 main.tsx에서 App보다 먼저 import해야 한다 (사이드이펙트 실행).
function maybeSeedDemo() {
  if (!import.meta.env.DEV) return;
  if (!new URLSearchParams(location.search).has('demo')) return;

  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const at = (day: number, hour: number) =>
    new Date(monday.getTime() + day * 86400000 + hour * 3600000 + 1800000).getTime();
  const rec = (category: string, amount: number, day: number, hour: number, memo?: string) =>
    ({ id: `${day}-${hour}-${category}`, category, amount, createdAt: at(day, hour), memo });

  const doneTree = (id: number, themeId: string, daysAgo: number, savedAmount: number) => ({
    id: String(id), themeId, water: 120,
    startedAt: Date.now() - (daysAgo + 14) * 86400000,
    completedAt: Date.now() - daysAgo * 86400000,
    savedAmount,
  });

  localStorage.setItem('app', JSON.stringify({
    onboarded: true,
    records: [
      rec('delivery', 23000, 0, 23, '야식 치킨 세트… 간신히 참음'), rec('delivery', 18000, 1, 22), rec('delivery', 25000, 3, 23),
      rec('coffee', 4500, 1, 8), rec('coffee', 5500, 2, 9), rec('coffee', 4500, 4, 8),
      rec('taxi', 15000, 2, 23), rec('shopping', 35000, 3, 1), rec('snack', 4000, 4, 15),
    ],
    trees: [
      { id: 'cur', themeId: 'basic', water: 86, startedAt: Date.now() - 6 * 86400000, savedAmount: 86000 },
      doneTree(1, 'basic', 8, 131000), doneTree(2, 'season1b', 21, 124500), doneTree(3, 'season1c', 35, 152000),
    ],
    streak: 12,
    lastActiveDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    weeklyGoalKrw: 12000,
    isPremium: false, adsRemoved: false,
    ownedThemes: ['basic', 'season1a', 'season1b', 'season1c'],
    fertilizers: 2,
    rewardedAdCountToday: 0, rewardedAdDate: null,
    installedAt: Date.now() - 5 * 86400000,
    notif: { weeklyReport: true, treeDone: true, streakGuard: false },
  }));
}

maybeSeedDemo();
