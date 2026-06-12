import { CSSProperties, useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { PRODUCTS } from '../constants/products';
import { THEME_PACKS } from '../constants/growth';
import { purchase, fetchDisplayPrices } from '../sdk/iap';
import { track } from '../sdk/analytics';
import { Product } from '../types';
import { C, Toast, card } from './ui';

export default function Shop() {
  const { isPremium, adsRemoved, ownedThemes, fertilizers } = useAppStore();
  const [prices, setPrices] = useState<Record<string, string> | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    track('shop_open');
    void fetchDisplayPrices().then(setPrices);
  }, []);

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2200); };

  const buy = async (p: Product) => {
    if (busy) return;
    setBusy(p.id);
    const ok = await purchase(p.id);
    setBusy(null);
    flash(ok ? `${p.title} 구매 완료!` : '결제가 완료되지 않았어요');
  };

  // 가격은 SDK가 내려주는 표시 가격 우선 (콘솔 가격과 불일치 방지)
  const priceOf = (p: Product) => prices?.[p.id] ?? `${p.priceKrw.toLocaleString()}원`;

  const owned = (p: Product) =>
    (p.id === 'remove_ads' && adsRemoved && !isPremium) ||
    (THEME_PACKS[p.id]?.every(t => ownedThemes.includes(t)) ?? false) ||
    (p.type === 'subscription' && isPremium);

  const section = (title: string, ids: string[]) => (
    <div style={card}>
      <p style={sectionTitle}>{title}</p>
      {PRODUCTS.filter(p => ids.includes(p.id)).map(p => (
        <div key={p.id} style={row}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0 }}>
              {p.title}
              {p.id === 'fert_s' && fertilizers > 0 && (
                <span style={{ fontSize: 12, color: C.sub, fontWeight: 400 }}> · {fertilizers}개 보유</span>
              )}
              {p.id === 'premium_y' && <span style={badge}>43% 할인</span>}
              {p.id === 'premium_m' && <span style={badge}>첫 달 50% 오퍼</span>}
            </p>
            <p style={{ fontSize: 13, color: C.sub, margin: '3px 0 0' }}>{p.description}</p>
          </div>
          <button
            style={{ ...buyBtn, ...(owned(p) ? buyBtnDone : {}) }}
            onClick={() => buy(p)}
            disabled={owned(p) || busy !== null}
          >
            {owned(p) ? '보유 중' : busy === p.id ? '결제 중…' : priceOf(p)}
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {section('부스터', ['fert_s', 'fert_m'])}
      {section('나무 테마', ['tree_pack_season', 'tree_pack_garden', 'tree_pack_exotic', 'tree_pack_lucky'])}
      {section('꾸미기', ['remove_ads'])}
      {section('프리미엄', ['premium_m', 'premium_y'])}
      <p style={notice}>
        구독은 언제든 설정 &gt; 구독 관리에서 해지할 수 있어요. 해지 시 다음 결제일부터 청구되지 않아요.
      </p>
      <Toast message={toast} />
    </div>
  );
}

const sectionTitle: CSSProperties = { fontSize: 14, color: C.sub, margin: '0 0 4px' };
const row: CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
  borderBottom: `1px solid ${C.bg}`,
};
const buyBtn: CSSProperties = {
  background: C.blueSoft, color: C.blue, border: 'none', borderRadius: 10,
  padding: '9px 14px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
  fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0,
};
const buyBtnDone: CSSProperties = { background: C.bg, color: C.sub2, cursor: 'default' };
const badge: CSSProperties = {
  marginLeft: 6, fontSize: 11, fontWeight: 700, color: C.orange,
  background: '#FFF1E7', borderRadius: 6, padding: '2px 6px', verticalAlign: 'middle',
};
const notice: CSSProperties = { fontSize: 12, color: C.sub2, lineHeight: 1.5, margin: 0, padding: '0 4px' };
