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
    { key: 'tree',    label: '큰나무', at: 70 },
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

// 테마별 나무 모습 (테마 팩 구매 시 해금, 프리미엄은 전체 사용 가능)
// bloom(만개)은 도감 숲에 영구히 남는 모습이므로 테마끼리 절대 겹치지 않게 유지할 것
const BASE = { seed: '🌰', sprout: '🌱', sapling: '🪴' };
export const THEMES: { id: string; label: string; stageEmoji: Record<string, string> }[] = [
  { id: 'basic',    label: '초록나무',  stageEmoji: { ...BASE, tree: '🌲', bloom: '🌳' } },
  // 시즌 팩 (월 1회 교체 — 기획서 2.4)
  { id: 'season1a', label: '벚나무',    stageEmoji: { ...BASE, tree: '🌳', bloom: '🌸' } },
  { id: 'season1b', label: '단풍나무',  stageEmoji: { ...BASE, tree: '🌳', bloom: '🍁' } },
  { id: 'season1c', label: '솔나무',    stageEmoji: { ...BASE, tree: '🌲', bloom: '🎄' } },
  // 꽃 정원 팩
  { id: 'garden1',  label: '해바라기',  stageEmoji: { ...BASE, tree: '🌿', bloom: '🌻' } },
  { id: 'garden2',  label: '튤립',      stageEmoji: { ...BASE, tree: '🌿', bloom: '🌷' } },
  { id: 'garden3',  label: '장미',      stageEmoji: { ...BASE, tree: '🌿', bloom: '🌹' } },
  // 이색 나무 팩
  { id: 'exotic1',  label: '야자수',    stageEmoji: { ...BASE, tree: '🌿', bloom: '🌴' } },
  { id: 'exotic2',  label: '선인장',    stageEmoji: { ...BASE, tree: '🌵', bloom: '🪷' } },
  { id: 'exotic3',  label: '대나무',    stageEmoji: { ...BASE, tree: '🎍', bloom: '🎋' } },
  // 행운 팩
  { id: 'lucky1',   label: '클로버',    stageEmoji: { ...BASE, tree: '☘️', bloom: '🍀' } },
  { id: 'lucky2',   label: '버섯',      stageEmoji: { ...BASE, tree: '🌿', bloom: '🍄' } },
  { id: 'lucky3',   label: '황금나무',  stageEmoji: { ...BASE, tree: '🌳', bloom: '💰' } },
];

// IAP 상품 ID → 해금되는 테마 (grant/복원 공통 사용)
export const THEME_PACKS: Record<string, string[]> = {
  tree_pack_season: ['season1a', 'season1b', 'season1c'],
  tree_pack_garden: ['garden1', 'garden2', 'garden3'],
  tree_pack_exotic: ['exotic1', 'exotic2', 'exotic3'],
  tree_pack_lucky:  ['lucky1', 'lucky2', 'lucky3'],
};

export function themeOf(themeId: string) {
  return THEMES.find(t => t.id === themeId) ?? THEMES[0];
}
