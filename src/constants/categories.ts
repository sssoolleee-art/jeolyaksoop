import { CategoryId } from '../types';

export const CATEGORIES: { id: CategoryId; label: string; emoji: string; presets: number[] }[] = [
  { id: 'coffee',       label: '커피',     emoji: '☕', presets: [3000, 4500, 5500, 6500] },
  { id: 'delivery',     label: '배달',     emoji: '🛵', presets: [15000, 20000, 25000, 30000] },
  { id: 'taxi',         label: '택시',     emoji: '🚕', presets: [8000, 12000, 18000, 25000] },
  { id: 'shopping',     label: '쇼핑',     emoji: '🛍️', presets: [10000, 30000, 50000, 100000] },
  { id: 'snack',        label: '간식',     emoji: '🍩', presets: [2000, 4000, 6000, 10000] },
  { id: 'subscription', label: '구독해지', emoji: '📺', presets: [9900, 14900, 17000, 25000] },
  { id: 'drink',        label: '술자리',   emoji: '🍺', presets: [20000, 40000, 60000, 100000] },
  { id: 'etc',          label: '기타',     emoji: '✨', presets: [5000, 10000, 20000, 50000] },
];
