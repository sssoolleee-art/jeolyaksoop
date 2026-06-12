import { IAP } from '@apps-in-toss/web-framework';
import { PRODUCTS, productById } from '../constants/products';
import { THEME_PACKS } from '../constants/growth';
import { useAppStore } from '../store/useAppStore';
import { track } from './analytics';

const SUB_ORDER_KEY = 'subscription_order_id';

// 상품 지급 (구매 성공·복구 공통 경로)
export function grant(productId: string) {
  const s = useAppStore.getState();
  if (productId === 'fert_s') s.addFertilizers(1);
  if (productId === 'fert_m') s.addFertilizers(5);
  if (productId === 'remove_ads') s.setAdsRemoved(true);
  THEME_PACKS[productId]?.forEach(id => s.addTheme(id));
  if (productId.startsWith('premium')) { s.setPremium(true); s.setAdsRemoved(true); }
  track(`purchase_${productId}`);
}

function productIdBySku(sku: string): string | undefined {
  return PRODUCTS.find(p => p.sku === sku)?.id;
}

// 구매 진입점. 성공 여부를 resolve한다.
export async function purchase(productId: string): Promise<boolean> {
  const p = productById(productId);
  if (!p) return false;

  // 토스 앱 밖(로컬 브라우저)에서는 결제창이 없으므로 개발 모드에서만 지급 시뮬레이션
  if (import.meta.env.DEV && !IAP.getProductItemList) {
    grant(productId);
    return true;
  }

  return new Promise<boolean>(resolve => {
    try {
      if (p.type === 'subscription') {
        track('subscribe_start', { productId });
        const cleanup = IAP.createSubscriptionPurchaseOrder({
          options: {
            sku: p.sku,
            processProductGrant: ({ orderId }) => {
              try { localStorage.setItem(SUB_ORDER_KEY, orderId); } catch { /* 무시 */ }
              grant(productId);
              return true;
            },
          },
          onEvent: () => { cleanup(); resolve(true); },
          onError: () => { cleanup(); resolve(false); },
        });
      } else {
        const cleanup = IAP.createOneTimePurchaseOrder({
          options: {
            sku: p.sku,
            processProductGrant: () => { grant(productId); return true; },
          },
          onEvent: () => { cleanup(); resolve(true); },
          onError: () => { cleanup(); resolve(false); },
        });
      }
    } catch {
      resolve(import.meta.env.DEV ? (grant(productId), true) : false);
    }
  });
}

// 콘솔에 등록된 표시 가격(SDK 내려주는 displayAmount) 조회. 실패 시 null → 폴백 표기 사용.
export async function fetchDisplayPrices(): Promise<Record<string, string> | null> {
  try {
    const res = await IAP.getProductItemList();
    if (!res?.products) return null;
    const map: Record<string, string> = {};
    for (const item of res.products) {
      const id = productIdBySku(item.sku);
      if (id) map[id] = item.displayAmount;
    }
    return map;
  } catch { return null; }
}

// 미지급 주문 복구: getPendingOrders → 지급 → completeProductGrant (공식 복구 플로우)
export async function restorePendingOrders(): Promise<void> {
  try {
    const res = await IAP.getPendingOrders();
    if (!res?.orders?.length) return;
    for (const order of res.orders) {
      const id = productIdBySku(order.sku);
      if (!id) continue;
      grant(id);
      await IAP.completeProductGrant({ params: { orderId: order.orderId } });
    }
  } catch { /* 미지원 환경 */ }
}

// 비소모성 구매 이력 복원 (소모품 비료는 중복 지급 위험이 있어 제외)
export async function restoreNonConsumables(): Promise<void> {
  try {
    const res = await IAP.getCompletedOrRefundedOrders();
    if (!res?.orders) return;
    const s = useAppStore.getState();
    for (const order of res.orders) {
      if (order.status !== 'COMPLETED') continue;
      const id = productIdBySku(order.sku);
      if (!id) continue;
      if (id === 'remove_ads' && !s.adsRemoved) s.setAdsRemoved(true);
      THEME_PACKS[id]?.forEach(t => s.addTheme(t));
    }
  } catch { /* 미지원 환경 */ }
}

// 구독 상태 동기화: 만료·해지 시 프리미엄 해제
export async function refreshSubscription(): Promise<void> {
  let orderId: string | null = null;
  try { orderId = localStorage.getItem(SUB_ORDER_KEY); } catch { /* 무시 */ }
  if (!orderId) return;
  try {
    const res = await IAP.getSubscriptionInfo({ params: { orderId } });
    const accessible = res?.subscription?.isAccessible ?? false;
    useAppStore.getState().setPremium(accessible);
  } catch { /* 미지원 환경: 마지막 상태 유지 */ }
}
