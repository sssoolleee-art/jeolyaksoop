import { CSSProperties, useState } from 'react';
import { Top } from '@toss/tds-mobile';
import { useAppStore } from '../store/useAppStore';
import { MONETIZATION_READY } from '../constants/products';
import { THEMES, themeOf, stageOf, GROWTH } from '../constants/growth';
import { Tree } from '../types';
import { BannerAd } from '../sdk/ads';
import { inviteFriend } from '../sdk/share';
import { C, Sheet, card } from './ui';

// 숲 칭호: 나무 수가 늘수록 숲이 자란다 — 다음 칭호가 수집 동기
const FOREST_RANKS = [
  { min: 0,  title: '빈 들판' },
  { min: 1,  title: '새내기 뜰' },
  { min: 3,  title: '오솔길 숲' },
  { min: 6,  title: '우거진 숲' },
  { min: 10, title: '울창한 숲' },
  { min: 20, title: '전설의 숲' },
];

export default function Collection() {
  const { trees, adsRemoved, ownedThemes, isPremium, setTheme } = useAppStore();
  const [selected, setSelected] = useState<Tree | null>(null);
  const done = [...trees.filter(t => t.completedAt)].sort((a, b) => a.completedAt! - b.completedAt!);
  const current = trees[0];
  const totalSaved = done.reduce((a, t) => a + t.savedAmount, 0);
  const rank = [...FOREST_RANKS].reverse().find(r => done.length >= r.min)!;
  const nextRank = FOREST_RANKS.find(r => r.min > done.length);
  const emptyPlots = nextRank ? Math.min(nextRank.min - done.length, 3) : 0;

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
        <span style={{ position: 'absolute', top: 18, left: 24, fontSize: 24, opacity: 0.85 }}>☁️</span>
        <span style={{ position: 'absolute', top: 38, right: 36, fontSize: 16, opacity: 0.55 }}>☁️</span>
        <span style={rankPill}>{rank.title}</span>
        <div style={forestGround} />
        <div style={treeField}>
          {planted.map(({ tree, growing }, i) => {
            const theme = themeOf(tree.themeId);
            const emoji = growing ? theme.stageEmoji[stageOf(tree.water).key] : theme.stageEmoji.bloom;
            const size = growing ? 40 : 52 + (i % 3) * 4;
            return (
              <button
                key={tree.id}
                style={{ ...treeSpot, marginBottom: (i % 2) * 8 }}
                onClick={() => setSelected(tree)}
                aria-label={theme.label}
              >
                <span style={{
                  fontSize: size, lineHeight: 1, display: 'inline-block',
                  animation: growing ? 'sway 2.4s ease-in-out infinite' : undefined,
                }}>
                  {emoji}
                </span>
                {/* 접지 그림자: 나무를 땅에 붙인다 */}
                <span style={{ ...treeShadow, width: size * 0.72 }} />
                {growing && <span style={growingBadge}>자라는 중</span>}
              </button>
            );
          })}
          {/* 빈 터: 채우고 싶은 자리를 보여준다 */}
          {Array.from({ length: emptyPlots }).map((_, i) => (
            <span key={`plot-${i}`} style={plot}>+</span>
          ))}
        </div>
        <p style={forestCaption}>
          {done.length === 0
            ? '첫 나무가 만개하면 이 숲에 영원히 심어져요'
            : `나무 ${done.length}그루가 ${totalSaved.toLocaleString()}원을 지켰어요`}
        </p>
        {nextRank && (
          <p style={nextRankCaption}>
            {nextRank.min - done.length}그루 더 심으면 ‘{nextRank.title}’이 돼요
          </p>
        )}
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
  background: 'linear-gradient(#D8EFFB 0%, #EAF6F0 48%, #D6EEDF 100%)',
  padding: '52px 16px 18px', minHeight: 300,
  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
};
const forestGround: CSSProperties = {
  position: 'absolute', left: -40, right: -40, bottom: -70, height: 190,
  background: '#BCE3CB', borderRadius: '50%',
};
const treeField: CSSProperties = {
  position: 'relative', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end',
  justifyContent: 'center', columnGap: 10, rowGap: 2, minHeight: 130,
};
const treeSpot: CSSProperties = {
  background: 'none', border: 'none', padding: 2, cursor: 'pointer',
  lineHeight: 1, position: 'relative',
  display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
};
const treeShadow: CSSProperties = {
  height: 10, borderRadius: '50%', marginTop: -5,
  background: 'radial-gradient(ellipse at center, rgba(31,77,52,0.22) 0%, rgba(31,77,52,0) 70%)',
};
const growingBadge: CSSProperties = {
  position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)',
  fontSize: 10, fontWeight: 700, color: C.green, background: '#FFFFFFCC',
  borderRadius: 8, padding: '2px 6px', whiteSpace: 'nowrap',
};
const forestCaption: CSSProperties = {
  position: 'relative', textAlign: 'center', fontSize: 13, fontWeight: 600,
  color: '#33604B', margin: '16px 0 0',
};
const nextRankCaption: CSSProperties = {
  position: 'relative', textAlign: 'center', fontSize: 12, fontWeight: 600,
  color: '#5E8A74', margin: '4px 0 0',
};
const rankPill: CSSProperties = {
  position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
  background: 'rgba(255,255,255,0.75)', color: '#0F6C47', fontSize: 13, fontWeight: 800,
  borderRadius: 14, padding: '5px 14px', backdropFilter: 'blur(2px)',
};
const plot: CSSProperties = {
  width: 40, height: 40, borderRadius: 20, border: '2px dashed rgba(15,108,71,0.30)',
  color: 'rgba(15,108,71,0.40)', fontSize: 20, fontWeight: 700,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  marginLeft: 8, marginBottom: 10, alignSelf: 'flex-end',
};
const themeChip: CSSProperties = {
  background: C.bg, border: '1px solid transparent', borderRadius: 20, padding: '8px 14px',
  fontSize: 13, fontWeight: 600, color: C.text, cursor: 'pointer', fontFamily: 'inherit',
};
const themeChipActive: CSSProperties = { background: C.greenSoft, borderColor: C.green, color: C.green };
const inviteCard: CSSProperties = {
  background: '#FFF8E7', border: 'none', borderRadius: 20, padding: 20, textAlign: 'left',
  cursor: 'pointer', fontFamily: 'inherit',
};
