import { CSSProperties, useEffect, useState } from 'react';
import { useAppStore } from './store/useAppStore';
import { MONETIZATION_READY } from './constants/products';
import { restorePendingOrders, restoreNonConsumables, refreshSubscription } from './sdk/iap';
import Onboarding from './screens/Onboarding';
import Home from './screens/Home';
import Report from './screens/Report';
import Collection from './screens/Collection';
import Shop from './screens/Shop';
import Settings from './screens/Settings';
import { C } from './screens/ui';

type Tab = 'home' | 'report' | 'collection' | 'shop';

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'home',       label: '숲',     emoji: '🌳' },
  { id: 'report',     label: '리포트', emoji: '📊' },
  { id: 'collection', label: '도감',   emoji: '📖' },
  ...(MONETIZATION_READY ? [{ id: 'shop' as Tab, label: '상점', emoji: '🛒' }] : []),
];

export default function App() {
  const onboarded = useAppStore(s => s.onboarded);
  const [tab, setTab] = useState<Tab>(() => {
    const t = new URLSearchParams(location.search).get('tab');
    return (TABS.some(x => x.id === t) ? t : 'home') as Tab;
  });
  const [settingsOpen, setSettingsOpen] = useState(false);

  // 앱 시작: 미지급 주문 복구 → 비소모성 복원 → 구독 상태 동기화 (기획서 4장)
  useEffect(() => {
    void (async () => {
      await restorePendingOrders();
      await restoreNonConsumables();
      await refreshSubscription();
    })();
  }, []);

  if (!onboarded) return <Onboarding />;

  return (
    <div style={shell}>
      <main style={main}>
        {tab === 'home' && (
          <Home onOpenSettings={() => setSettingsOpen(true)} onGoShop={() => setTab('shop')} />
        )}
        {tab === 'report' && <Report onGoShop={() => setTab('shop')} onGoHome={() => setTab('home')} />}
        {tab === 'collection' && <Collection />}
        {tab === 'shop' && <Shop />}
      </main>

      <nav style={tabBar}>
        {TABS.map(t => (
          <button key={t.id} style={tabBtn} onClick={() => setTab(t.id)}>
            <span style={{ fontSize: 20, filter: tab === t.id ? 'none' : 'grayscale(1) opacity(.5)' }}>
              {t.emoji}
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: tab === t.id ? C.text : C.sub2 }}>
              {t.label}
            </span>
          </button>
        ))}
      </nav>

      {settingsOpen && <Settings onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}

const shell: CSSProperties = {
  display: 'flex', flexDirection: 'column', height: '100vh', background: C.bg,
};
const main: CSSProperties = { flex: 1, overflowY: 'auto' };
const tabBar: CSSProperties = {
  display: 'flex', background: C.card, borderTop: `1px solid ${C.line}`,
  // viewport-fit=cover 필요 (index.html). env() 미지원 기기 대비 최소 10px 보장
  paddingBottom: 'max(env(safe-area-inset-bottom), 10px)',
};
const tabBtn: CSSProperties = {
  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
  background: 'none', border: 'none', padding: '10px 0 8px', cursor: 'pointer', fontFamily: 'inherit',
};
