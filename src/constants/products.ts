import { Product } from '../types';

// 콘솔에서 IAP 상품·광고 ID·공유 moduleId 발급 후 true로 전환:
// 상점 탭, 보상형 광고, 친구 초대, 프리미엄 잠금이 함께 켜진다.
export const MONETIZATION_READY = false;

// SKU는 앱인토스 콘솔에서 상품 등록 후 발급받아 교체한다.
// ★ 배포 전 반드시: grep -rn "PENDING_" src/ → 0건 확인 (사주앱 SKU 유실 사고 재발 방지)
export const PRODUCTS: Product[] = [
  { id: 'fert_s',  type: 'consumable', sku: 'PENDING_FERT_S_SKU', priceKrw: 1100, title: '비료 1개',
    description: '물방울 +15를 바로 받아요' },
  { id: 'fert_m',  type: 'consumable', sku: 'PENDING_FERT_M_SKU', priceKrw: 3300, title: '비료 4개',
    description: '하나 더 드려요 (+1 보너스)' },
  { id: 'tree_pack_season', type: 'non_consumable', sku: 'PENDING_TREE_PACK_SKU', priceKrw: 2200, title: '시즌 나무 3종',
    description: '이번 시즌에만 만날 수 있는 나무들' },
  { id: 'remove_ads', type: 'non_consumable', sku: 'PENDING_REMOVE_ADS_SKU', priceKrw: 4400, title: '광고 제거',
    description: '배너 광고를 영구히 없애요' },
  { id: 'premium_m', type: 'subscription', sku: 'PENDING_PREMIUM_M_SKU', priceKrw: 2900, title: '프리미엄 (월)',
    description: '전체 리포트·월간 리포트·전체 테마·광고 제거' },
  { id: 'premium_y', type: 'subscription', sku: 'PENDING_PREMIUM_Y_SKU', priceKrw: 19900, title: '프리미엄 (년)',
    description: '월 구독보다 43% 저렴해요' },
];

export function productById(id: string) {
  return PRODUCTS.find(p => p.id === id);
}
