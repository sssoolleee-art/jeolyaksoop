import { CSSProperties, useState } from 'react';
import { Top } from '@toss/tds-mobile';
import { useAppStore } from '../store/useAppStore';
import { MONETIZATION_READY } from '../constants/products';
import { THEMES, themeOf, stageOf, GROWTH } from '../constants/growth';
import { Tree } from '../types';
import { BannerAd } from '../sdk/ads';
import { inviteFriend } from '../sdk/share';
import { C, Sheet, card } from './ui';

export default function Collection() {
  const { trees, adsRemoved, ownedThemes, isPremium, setTheme } = useAppStore();
  const [selected, setSelected] = useState<Tree | null>(null);
  const done = [...trees.filter(t => t.completedAt)].sort((a, b) => a.completedAt! - b.completedAt!);
  const current = trees[0];
  const totalSaved = done.reduce((a, t) => a + t.savedAmount, 0);

  // 완성 나무들 + 자라는 중인 나무를 한 땅에 심는다
  const planted: { tree: Tree; growing: boolean }[] = [
    ...done.map(tree => ({ tree, growing: false })),
    { tree: current, growing: true },
  ];

  return (
    <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 16, minHeight: '100%', boxSizing: 'border-box' }}>
      <div style={{ margin: '0 -4px' }}>
        <Top title={<Top.TitleParagraph size={22}>나의 숲</Top.TitleParagraph>} />
      </div>

      <div style={forest}>
        <span style={{ position: 'absolute', top: 18, left: 24, fontSize: 22, opacity: 0.8 }}>☁️</span>
        <span style={{ position: 'absolute', top: 34, right: 36, fontSize: 16, opacity: 0.6 }}>☁️</span>
        <span style={{ position: 'absolute', top: 14, right: 96, fontSize: 13, opacity: 0.5 }}>🐦</span>
        <div style={forestGround} />
        <div style={treeField}>
          {planted.map(({ tree, growing }, i) => {
            const theme = themeOf(tree.themeId);
            const emoji = growing ? theme.stageEmoji[stageOf(tree.water).key] : theme.stageEmoji.bloom;
            return (
              <button
                key={tree.id}
                style={{
                  ...treeSpot,
                  fontSize: growing ? 30 : 38 + (i % 3) * 4,
                  marginTop: (i % 3) * 14,
                  animation: growing ? 'sway 2.4s ease-in-out infinite' : undefined,
                }}
                onClick={() => setSelected(tree)}
                aria-label={theme.label}
              >
                {emoji}
                {growing && <span style={growingBadge}>자라는 중</span>}
              </button>
            );
          })}
        </div>
        <p style={forestCaption}>
          {done.length === 0
            ? '첫 나무가 만개하면 이 숲에 영원히 심어져요'
            : `나무 ${done.length}그루가 ${totalSaved.toLocaleString()}원을 지켰어요`}
        </p>
      </div>

      <div style={card}>
        <p style={cardTitle}>내 나무 테마</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {THEMES.map(t => {
            const owned = ownedThemes.includes(t.id) || isPremium;
            const active = current.themeId === t.id;
            return (
              <button
                key={t.id}
                style={{ ...themeChip, ...(active ? themeChipActive : {}), opacity: owned ? 1 : 0.4 }}
                onClick={() => owned && setTheme(t.id)}
                disabled={!owned}
              >
                {t.stageEmoji.bloom} {t.label}{owned ? '' : ' 🔒'}
              </button>
            );
          })}
        </div>
      </div>

      {MONETIZATION_READY && (
        <button style={inviteCard} onClick={inviteFriend}>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>👋 친구 초대하고 비료 받기</span>
          <span style={{ fontSize: 13, color: C.sub, display: 'block', marginTop: 4 }}>
            초대가 성공하면 두 사람 모두 비료 1개
          </span>
        </button>
      )}

      <div style={{ flex: 1 }} />
      {MONETIZATION_READY && !adsRemoved && <BannerAd />}

      <Sheet visible={selected !== null} onClose={() => setSelected(null)}>
        {selected && <TreeDetail tree={selected} growing={!selected.completedAt} />}
      </Sheet>
    </div>
  );
}

function TreeDetail({ tree, growing }: { tree: Tree; growing: boolean }) {
  const theme = themeOf(tree.themeId);
  const emoji = growing ? theme.stageEmoji[stageOf(tree.water).key] : theme.stageEmoji.bloom;
  return (
    <div style={{ textAlign: 'center' }}>
      <span style={{ fontSize: 64 }}>{emoji}</span>
      <p style={{ fontSize: 19, fontWeight: 700, color: C.text, margin: '10px 0 0' }}>
        {theme.label}{growing ? ` · ${stageOf(tree.water).label}` : ''}
      </p>
      {growing ? (
        <p style={detailSub}>💧 {tree.water} / {GROWTH.completeAt} · 지금까지 {tree.savedAmount.toLocaleString()}원 지킴</p>
      ) : (
        <>
          <p style={detailSub}>
            {new Date(tree.startedAt).toLocaleDateString('ko-KR')} ~ {new Date(tree.completedAt!).toLocaleDateString('ko-KR')}
          </p>
          <p style={{ fontSize: 17, fontWeight: 700, color: C.green, margin: '8px 0 0' }}>
            이 나무가 지킨 돈 {tree.savedAmount.toLocaleString()}원
          </p>
        </>
      )}
    </div>
  );
}

const cardTitle: CSSProperties = { fontSize: 14, color: C.sub, margin: '0 0 10px' };
const detailSub: CSSProperties = { fontSize: 13, color: C.sub, margin: '6px 0 0' };
const forest: CSSProperties = {
  position: 'relative', borderRadius: 20, overflow: 'hidden',
  background: 'linear-gradient(#D7EEFF 0%, #E8F7F0 55%, #C9EBD8 56%, #BFE6CE 100%)',
  padding: '28px 16px 14px', minHeight: 190,
  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
};
const forestGround: CSSProperties = {
  position: 'absolute', left: -30, right: -30, bottom: -46, height: 110,
  background: '#ABDFBE', borderRadius: '50%',
};
const treeField: CSSProperties = {
  position: 'relative', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end',
  justifyContent: 'center', columnGap: 6, rowGap: 0, minHeight: 96,
};
const treeSpot: CSSProperties = {
  background: 'none', border: 'none', padding: 2, cursor: 'pointer',
  lineHeight: 1, position: 'relative',
};
const growingBadge: CSSProperties = {
  position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)',
  fontSize: 10, fontWeight: 700, color: C.green, background: '#FFFFFFCC',
  borderRadius: 8, padding: '2px 6px', whiteSpace: 'nowrap',
};
const forestCaption: CSSProperties = {
  position: 'relative', textAlign: 'center', fontSize: 13, fontWeight: 600,
  color: '#3D6B4F', margin: '14px 0 0',
};
const themeChip: CSSProperties = {
  background: C.bg, border: '1px solid transparent', borderRadius: 20, padding: '8px 14px',
  fontSize: 13, fontWeight: 600, color: C.text, cursor: 'pointer', fontFamily: 'inherit',
};
const themeChipActive: CSSProperties = { background: C.blueSoft, borderColor: C.blue, color: C.blue };
const inviteCard: CSSProperties = {
  background: '#FFF8E7', border: 'none', borderRadius: 20, padding: 20, textAlign: 'left',
  cursor: 'pointer', fontFamily: 'inherit',
};
