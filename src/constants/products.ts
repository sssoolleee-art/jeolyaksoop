import { Product } from '../types';

// IAP 9종 SKU·광고 ID 3종·공유 moduleId 발급 완료 (2026-06-15) → 실서비스 ON
// 상점 탭, 보상형 광고, 친구 초대, 프리미엄 잠금이 모두 활성화된다.
export const MONETIZATION_READY = true;

// SKU는 앱인토스 콘솔에서 상품 등록 후 발급받아 교체한다.
// ★ 배포 전 반드시: grep -rn "PENDING_" src/ → 0건 확인 (사주앱 SKU 유실 사고 재발 방지)
export const PRODUCTS: Product[] = [
  { id: 'fert_s',  type: 'consumable', sku: 'ait.0000041619.5c9540e7.9bb4750415.1525771334', priceKrw: 990, title: '비료 1개',
    description: '물방울 +15를 바로 받아요' },
  { id: 'fert_m',  type: 'consumable', sku: 'ait.0000041619.c98a8aa8.c8fe70ba8b.1526036328', priceKrw: 3190, title: '비료 4개',
    description: '하나 더 드려요 (+1 보너스)' },
  { id: 'tree_pack_season', type: 'non_consumable', sku: 'ait.0000041619.a52d0b1d.b2b83c26c7.1526068913', priceKrw: 2090, title: '시즌 나무 3종',
    description: '벚나무·단풍나무·솔나무 — 이번 시즌 한정' },
  { id: 'tree_pack_garden', type: 'non_consumable', sku: 'ait.0000041619.85e7d74a.4503b3fa89.1526094872', priceKrw: 2090, title: '꽃 정원 3종',
    description: '해바라기·튤립·장미로 숲을 꾸며요' },
  { id: 'tree_pack_exotic', type: 'non_consumable', sku: 'ait.0000041619.fa65eb2e.fc9de0b6c3.1526123524', priceKrw: 2090, title: '이색 나무 3종',
    description: '야자수·선인장·대나무, 나만의 이국 숲' },
  { id: 'tree_pack_lucky', type: 'non_consumable', sku: 'ait.0000041619.62e840d2.879e019cc6.1526150430', priceKrw: 3190, title: '행운 나무 3종',
    description: '클로버·버섯·황금나무 — 돈이 열리는 숲' },
  { id: 'remove_ads', type: 'non_consumable', sku: 'ait.0000041619.795abd69.ac3a554e06.1526181432', priceKrw: 4290, title: '광고 제거',
    description: '배너 광고를 영구히 없애요' },
  { id: 'premium_m', type: 'subscription', sku: 'sub.w43.mqf6q36t.f2cbd2bc37', priceKrw: 3190, title: '프리미엄 (월)',
    description: '전체 리포트·월간 리포트·전체 테마·광고 제거' },
  { id: 'premium_y', type: 'subscription', sku: 'sub.w43.mqf6r8hn.25c6538aa3', priceKrw: 19800, title: '프리미엄 (년)',
    description: '월 구독보다 48% 저렴해요' },
];

export function productById(id: string) {
  return PRODUCTS.find(p => p.id === id);
}
