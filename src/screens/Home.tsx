import { CSSProperties, useState } from 'react';
import { useAppStore, rewardedAdRemaining } from '../store/useAppStore';
import { stageOf, themeOf, GROWTH } from '../constants/growth';
import { showRewarded } from '../sdk/ads';
import RecordSheet from './RecordSheet';
import { C, Sheet, Toast, btn } from './ui';

export default function Home({ onOpenSettings, onGoShop }: {
  onOpenSettings: () => void; onGoShop: () => void;
}) {
  const store = useAppStore();
  const { trees, streak, records, fertilizers } = store;
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [adBusy, setAdBusy] = useState(false);

  const tree = trees[0];
  const stage = stageOf(tree.water);
  const theme = themeOf(tree.themeId);
  const totalSaved = records.reduce((a, r) => a + r.amount, 0);
  const progress = Math.min(tree.water / GROWTH.completeAt, 1);
  const remainWater = GROWTH.completeAt - tree.water;
  const adsLeft = rewardedAdRemaining(store);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };
  const afterPour = (water: number, completed: boolean, label: string) => {
    if (completed) setCelebrate(true);
    else flash(`${label} 물방울 +${water}`);
  };

  const onCheckin = () => {
    const res = store.checkin();
    if (res) afterPour(res.water, res.completed, '무지출 체크인!');
    else flash('오늘은 이미 기록했어요');
  };

  const onFertilizer = () => {
    const res = store.useFertilizer();
    if (res) afterPour(res.water, res.completed, '비료 사용!');
  };

  const onRewardedAd = async () => {
    if (adBusy || adsLeft <= 0) return;
    setAdBusy(true);
    const ok = await showRewarded();
    setAdBusy(false);
    if (!ok) { flash('광고를 끝까지 보면 물방울을 받아요'); return; }
    store.countRewardedAd();
    const res = store.grantWater(GROWTH.rewardedAdWater);
    afterPour(res.water, res.completed, '광고 보상!');
  };

  return (
    <div style={wrap}>
      <div style={header}>
        <div style={{ width: 36 }} />
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: C.sub, margin: 0 }}>지금까지 지킨 돈</p>
          <p style={{ fontSize: 32, fontWeight: 700, color: C.text, margin: '4px 0 0' }}>
            {totalSaved.toLocaleString()}원
          </p>
          <p style={{ fontSize: 14, color: C.orange, margin: '6px 0 0' }}>🔥 {streak}일 연속</p>
        </div>
        <button style={gear} onClick={onOpenSettings} aria-label="설정">⚙️</button>
      </div>

      <div style={treeArea}>
        <span style={{ fontSize: 96, lineHeight: 1, transition: 'transform .3s', transform: `scale(${0.8 + progress * 0.4})` }}>
          {theme.stageEmoji[stage.key]}
        </span>
        <p style={{ fontSize: 16, color: '#333D4B', fontWeight: 600, margin: '10px 0 0' }}>
          {theme.label} · {stage.label}
        </p>
        <div style={barBg}>
          <div style={{ ...barFill, width: `${progress * 100}%` }} />
        </div>
        <p style={{ fontSize: 13, color: C.sub, margin: '6px 0 0' }}>
          💧 {tree.water} / {GROWTH.completeAt}
        </p>

        {/* 완성 직전 비료 안내 (잔여 수치 정직 표기 — 다크패턴 아님) */}
        {remainWater > 0 && remainWater <= 10 && fertilizers === 0 && (
          <button style={shopHint} onClick={onGoShop}>
            물방울 {remainWater}개만 더 모으면 완성 — 상점에서 비료 보기
          </button>
        )}
        {fertilizers > 0 && (
          <button style={fertBtn} onClick={onFertilizer}>
            🌿 비료 주기 (+{GROWTH.fertilizerWater}) · {fertilizers}개 보유
          </button>
        )}
      </div>

      <button style={btn(C.blue)} onClick={() => setSheetOpen(true)}>참았어요 ✋</button>
      <button style={subBtn} onClick={onCheckin}>오늘 무지출 체크인</button>
      <button
        style={{ ...subBtn, color: adsLeft > 0 ? C.green : C.sub2 }}
        onClick={onRewardedAd} disabled={adsLeft <= 0 || adBusy}
      >
        {adBusy ? '광고 불러오는 중…' : `광고 보고 물방울 ${GROWTH.rewardedAdWater}개 받기 (오늘 ${adsLeft}회 남음)`}
      </button>

      <Toast message={toast} />
      <RecordSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSaved={(water, completed) => afterPour(water, completed, '잘 참았어요!')}
      />

      <Sheet visible={celebrate} onClose={() => setCelebrate(false)}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: 72 }}>{theme.stageEmoji.bloom}</span>
          <p style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: '12px 0 6px' }}>
            나무가 만개했어요!
          </p>
          <p style={{ fontSize: 14, color: C.sub, margin: '0 0 20px' }}>
            도감에 영구 보관됐어요. 새 씨앗이 심어졌습니다.
          </p>
          <button style={btn(C.green)} onClick={() => setCelebrate(false)}>새 나무 키우기</button>
        </div>
      </Sheet>
    </div>
  );
}

const wrap: CSSProperties = {
  display: 'flex', flexDirection: 'column', minHeight: '100%', padding: 20, boxSizing: 'border-box',
};
const header: CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 8 };
const gear: CSSProperties = {
  width: 36, height: 36, borderRadius: 18, border: 'none', background: C.card,
  fontSize: 16, cursor: 'pointer',
};
const treeArea: CSSProperties = {
  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
  justifyContent: 'center', padding: '24px 0',
};
const barBg: CSSProperties = {
  width: '70%', height: 8, background: C.line, borderRadius: 4, marginTop: 12, overflow: 'hidden',
};
const barFill: CSSProperties = { height: 8, background: C.blue, borderRadius: 4, transition: 'width .4s' };
const subBtn: CSSProperties = {
  background: 'none', border: 'none', color: C.blue, fontSize: 15, fontWeight: 600,
  padding: '14px 0 0', cursor: 'pointer', fontFamily: 'inherit',
};
const shopHint: CSSProperties = {
  marginTop: 14, background: C.greenSoft, color: C.green, border: 'none', borderRadius: 12,
  padding: '10px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
};
const fertBtn: CSSProperties = {
  marginTop: 14, background: C.green, color: '#FFF', border: 'none', borderRadius: 12,
  padding: '10px 16px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
};
