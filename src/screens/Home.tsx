import { CSSProperties, useState } from 'react';
import { Button } from '@toss/tds-mobile';
import { useAppStore, rewardedAdRemaining, effectiveStreak } from '../store/useAppStore';
import { MONETIZATION_READY } from '../constants/products';
import { stageOf, themeOf, GROWTH } from '../constants/growth';
import { showRewarded } from '../sdk/ads';
import { haptic, shareText } from '../sdk/share';
import RecordSheet from './RecordSheet';
import { C, Sheet, Toast } from './ui';

export default function Home({ onOpenSettings, onGoShop }: {
  onOpenSettings: () => void; onGoShop: () => void;
}) {
  const store = useAppStore();
  const { trees, records, fertilizers } = store;
  const streak = effectiveStreak(store);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [firstRecord, setFirstRecord] = useState<number | null>(null);  // 첫 기록 직후 1회 안내 (적립 물방울 수)
  const [adBusy, setAdBusy] = useState(false);

  const tree = trees[0];
  const stage = stageOf(tree.water);
  const theme = themeOf(tree.themeId);
  const nextStage = GROWTH.stages.find(s => s.at > tree.water);
  const totalSaved = records.reduce((a, r) => a + r.amount, 0);
  const progress = Math.min(tree.water / GROWTH.completeAt, 1);
  const remainWater = GROWTH.completeAt - tree.water;
  const adsLeft = rewardedAdRemaining(store);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };
  const afterPour = (water: number, completed: boolean, label: string) => {
    if (completed) {
      haptic('confetti');
      setCelebrate(true);
    } else {
      haptic('basicWeak');
      flash(`${label} 물방울 +${water}`);
    }
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
          {streak > 0 ? (
            <p style={{ fontSize: 14, color: C.orange, margin: '6px 0 0' }}>🔥 {streak}일 연속</p>
          ) : (
            <p style={{ fontSize: 13, color: C.sub2, margin: '6px 0 0' }}>오늘 기록하면 🔥 스트릭이 시작돼요</p>
          )}
        </div>
        <button style={gear} onClick={onOpenSettings} aria-label="설정">⚙️</button>
      </div>

      <div style={treeArea}>
        <div style={treeStand}>
          <div style={ground} />
          <span style={{ position: 'relative', display: 'inline-block', transition: 'transform .3s', transform: `scale(${0.8 + progress * 0.4})` }}>
            {/* key=water: 물 줄 때마다 리마운트 → waterPop 반응 후 breathe 루프 */}
            <span key={tree.water} style={{
              display: 'inline-block', fontSize: 96, lineHeight: 1,
              animation: 'waterPop .5s ease-out, breathe 3.6s ease-in-out .5s infinite',
            }}>
              {theme.stageEmoji[stage.key]}
            </span>
          </span>
        </div>
        <p style={{ fontSize: 16, color: '#333D4B', fontWeight: 600, margin: '10px 0 0' }}>
          {theme.label} · {stage.label}
        </p>
        <div style={barBg}>
          <div style={{ ...barFill, width: `${progress * 100}%` }} />
          {/* 성장 단계 눈금 (새싹 10 · 묘목 30 · 큰나무 70) */}
          {GROWTH.stages.filter(s => s.at > 0 && s.at < GROWTH.completeAt).map(s => (
            <span key={s.key} style={{ ...tick, left: `${(s.at / GROWTH.completeAt) * 100}%` }} />
          ))}
        </div>
        <p style={{ fontSize: 13, color: C.sub, margin: '8px 0 0' }}>
          💧 {tree.water} / {GROWTH.completeAt}
          {nextStage && (
            <span style={{ color: C.water, fontWeight: 700 }}> · {nextStage.label}까지 💧{nextStage.at - tree.water}</span>
          )}
        </p>
        <p style={{ fontSize: 12, color: C.sub2, margin: '3px 0 0' }}>참은 돈 1,000원 = 💧1</p>

        {/* 완성 직전 비료 안내 (잔여 수치 정직 표기 — 다크패턴 아님) */}
        {MONETIZATION_READY && remainWater > 0 && remainWater <= 10 && fertilizers === 0 && (
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

      {records.length === 0 && (
        <div style={guideCard}>
          <p style={guideTitle}>🌱 이렇게 키워요</p>
          <p style={guideLine}>커피·배달·택시… 사려다 참았다면 <b>참았어요</b>를 눌러요</p>
          <p style={guideLine}>참은 금액만큼 물방울이 쌓이고, 💧120이 되면 나무가 만개해요</p>
          <p style={guideLine}>만개한 나무는 나의 숲에 영원히 남아요</p>
        </div>
      )}

      <Button display="block" size="xlarge" onClick={() => setSheetOpen(true)}>참았어요 ✋</Button>
      <button style={subBtn} onClick={onCheckin}>오늘 한 푼도 안 썼어요</button>
      {MONETIZATION_READY && (
        <button
          style={{ ...subBtn, color: adsLeft > 0 ? C.green : C.sub2 }}
          onClick={onRewardedAd} disabled={adsLeft <= 0 || adBusy}
        >
          {adBusy ? '광고 불러오는 중…' : `광고 보고 물방울 ${GROWTH.rewardedAdWater}개 받기 (오늘 ${adsLeft}회 남음)`}
        </button>
      )}

      <Toast message={toast} />
      <RecordSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSaved={(water, completed) => {
          const isFirst = useAppStore.getState().records.length === 1;
          if (isFirst && !completed) setFirstRecord(water);
          else afterPour(water, completed, '잘 참았어요!');
        }}
      />

      {/* 첫 기록 직후 1회: 루프 설명 (동기 피크 시점) */}
      <Sheet visible={firstRecord !== null} onClose={() => setFirstRecord(null)}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: 56 }}>💧</span>
          <p style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: '12px 0 6px' }}>
            첫 절약, 물방울 {firstRecord}개가 됐어요
          </p>
          <p style={{ fontSize: 14, color: C.sub, margin: '0 0 4px', lineHeight: 1.6 }}>
            참은 돈은 사라지지 않고 물방울로 쌓여요.{'\n'}💧120이 되면 나무가 만개하고,
            만개한 나무는{'\n'}<b>나의 숲</b>에 영원히 남아요.
          </p>
          <p style={{ fontSize: 13, color: C.sub2, margin: '0 0 20px' }}>
            매일 기록하면 연속 스트릭 🔥도 함께 자라요
          </p>
          <Button display="block" size="large" onClick={() => setFirstRecord(null)}>계속 키우기</Button>
        </div>
      </Sheet>

      <Sheet visible={celebrate} onClose={() => setCelebrate(false)}>
        <CelebrateContent onClose={() => setCelebrate(false)} />
      </Sheet>
    </div>
  );
}

// 만개 축하: 컨페티 + 통계 인정 + 자랑하기 (감정 피크 — 기획서 2.7 공유 시점)
const CONFETTI = ['🎉', '✨', '🌸', '💧', '🍃', '⭐', '🎊', '✨', '🌸', '💛'];

function CelebrateContent({ onClose }: { onClose: () => void }) {
  const trees = useAppStore(s => s.trees);
  const done = trees.filter(t => t.completedAt).sort((a, b) => b.completedAt! - a.completedAt!);
  const justDone = done[0];
  if (!justDone) return null;
  const theme = themeOf(justDone.themeId);
  const days = Math.max(Math.ceil((justDone.completedAt! - justDone.startedAt) / 86400000), 1);

  const brag = async () => {
    await shareText([
      `🌳 절약숲에서 ${done.length}번째 나무를 다 키웠어요!`,
      `${days}일 동안 ${justDone.savedAmount.toLocaleString()}원을 참아서 만든 ${theme.label}예요 ${theme.stageEmoji.bloom}`,
      `너도 절약숲 키워볼래? 🌱`,
    ].join('\n'));
  };

  return (
    <div style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      {CONFETTI.map((c, i) => (
        <span key={i} style={{
          position: 'absolute', top: -24, left: `${4 + i * 10}%`, fontSize: 16 + (i % 3) * 6,
          animation: `confettiFall ${1.6 + (i % 4) * 0.5}s linear ${i * 0.22}s infinite`,
          pointerEvents: 'none',
        }}>{c}</span>
      ))}
      <div style={{ ...bloomHalo, animation: 'popIn .6s ease-out' }}>
        <span style={{ fontSize: 76, lineHeight: 1 }}>{theme.stageEmoji.bloom}</span>
      </div>
      <p style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: '14px 0 4px' }}>
        {done.length}번째 나무, 만개!
      </p>
      <p style={{ fontSize: 15, color: '#333D4B', margin: '0 0 2px', lineHeight: 1.6 }}>
        {days}일 동안 <b style={{ color: C.green }}>{justDone.savedAmount.toLocaleString()}원</b>을 참아서
        키운 {theme.label}예요.
      </p>
      <p style={{ fontSize: 13, color: C.sub2, margin: '0 0 22px' }}>
        나의 숲에 영원히 남았어요. 새 씨앗도 심어뒀어요.
      </p>
      <Button display="block" size="large" onClick={brag}>친구에게 자랑하기</Button>
      <button style={celebrateLater} onClick={onClose}>새 나무 키우러 가기</button>
    </div>
  );
}

const celebrateLater: CSSProperties = {
  background: 'none', border: 'none', color: C.sub, fontSize: 14, fontWeight: 600,
  padding: '14px 0 0', cursor: 'pointer', fontFamily: 'inherit', width: '100%',
};

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
const treeStand: CSSProperties = {
  position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
  paddingBottom: 14,
};
const ground: CSSProperties = {
  position: 'absolute', bottom: 0, width: 190, height: 54, borderRadius: '50%',
  background: 'radial-gradient(ellipse at center, #D3EBDD 0%, #E4F3EA 70%, rgba(228,243,234,0) 100%)',
};
const bloomHalo: CSSProperties = {
  width: 124, height: 124, borderRadius: 62, margin: '0 auto',
  background: 'radial-gradient(circle, #E5F6EE 0%, rgba(229,246,238,0) 75%)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const barBg: CSSProperties = {
  position: 'relative', width: '70%', height: 10, background: C.line, borderRadius: 5,
  marginTop: 12, overflow: 'hidden',
};
const barFill: CSSProperties = {
  height: 10, background: 'linear-gradient(90deg, #54CBE8, #1FA9D6)', borderRadius: 5,
  transition: 'width .4s',
};
const tick: CSSProperties = {
  position: 'absolute', top: 0, width: 2, height: 10, background: '#FFFFFF', opacity: 0.9,
};
const subBtn: CSSProperties = {
  background: 'none', border: 'none', color: C.green, fontSize: 15, fontWeight: 600,
  padding: '14px 0 0', cursor: 'pointer', fontFamily: 'inherit',
};
const shopHint: CSSProperties = {
  marginTop: 14, background: C.greenSoft, color: C.green, border: 'none', borderRadius: 12,
  padding: '10px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
};
// 비료는 보조 액션 — 채워진 초록 대신 소프트 톤 (초록 사용량 절제)
const fertBtn: CSSProperties = {
  marginTop: 14, background: C.greenSoft, color: C.green, border: 'none', borderRadius: 12,
  padding: '10px 16px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
};
const guideCard: CSSProperties = {
  background: C.greenSoft, borderRadius: 16, padding: '14px 16px', marginBottom: 12,
};
const guideTitle: CSSProperties = { fontSize: 14, fontWeight: 700, color: '#0B6B45', margin: '0 0 8px' };
const guideLine: CSSProperties = { fontSize: 13, color: '#33604B', margin: '4px 0 0', lineHeight: 1.5 };
