export const GROWTH = {
  waterPerKrw: 1 / 1000,        // 1,000원당 물방울 1
  minWaterPerRecord: 1,
  maxWaterPerRecord: 20,        // 허위 고액 기록 방지 캡
  checkinWater: 2,              // 무지출 체크인
  rewardedAdWater: 3,
  rewardedAdDailyLimit: 2,
  fertilizerWater: 15,          // IAP 비료
  stages: [
    { key: 'seed',    label: '씨앗',  at: 0 },
    { key: 'sprout',  label: '새싹',  at: 10 },
    { key: 'sapling', label: '묘목',  at: 30 },
    { key: 'tree',    label: '나무',  at: 70 },
    { key: 'bloom',   label: '만개',  at: 120 },  // 완성
  ],
  completeAt: 120,
} as const;

export function stageOf(water: number) {
  const s = [...GROWTH.stages].reverse().find(st => water >= st.at);
  return s ?? GROWTH.stages[0];
}

export function waterFromAmount(amountKrw: number): number {
  const w = Math.floor(amountKrw * GROWTH.waterPerKrw);
  return Math.min(Math.max(w, GROWTH.minWaterPerRecord), GROWTH.maxWaterPerRecord);
}

// 테마별 나무 모습 (tree_pack_season 구매 시 season 테마 해금)
// bloom(만개)은 도감 숲에 영구히 남는 모습이므로 테마끼리 절대 겹치지 않게 유지할 것
export const THEMES: { id: string; label: string; stageEmoji: Record<string, string> }[] = [
  { id: 'basic',   label: '초록나무', stageEmoji: { seed: '🌰', sprout: '🌱', sapling: '🪴', tree: '🌲', bloom: '🌳' } },
  { id: 'season1a', label: '벚나무',   stageEmoji: { seed: '🌰', sprout: '🌱', sapling: '🪴', tree: '🌳', bloom: '🌸' } },
  { id: 'season1b', label: '단풍나무', stageEmoji: { seed: '🌰', sprout: '🌱', sapling: '🪴', tree: '🌳', bloom: '🍁' } },
  { id: 'season1c', label: '솔나무',   stageEmoji: { seed: '🌰', sprout: '🌱', sapling: '🪴', tree: '🌲', bloom: '🎄' } },
];

export function themeOf(themeId: string) {
  return THEMES.find(t => t.id === themeId) ?? THEMES[0];
}
