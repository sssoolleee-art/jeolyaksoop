import { CSSProperties } from 'react';
import { Top } from '@toss/tds-mobile';
import { useAppStore } from '../store/useAppStore';
import { THEMES, themeOf } from '../constants/growth';
import { MONETIZATION_READY } from '../constants/products';
import { BannerAd } from '../sdk/ads';
import { inviteFriend } from '../sdk/share';
import { C, card } from './ui';

export default function Collection() {
  const { trees, adsRemoved, ownedThemes, setTheme } = useAppStore();
  const done = trees.filter(t => t.completedAt).sort((a, b) => (b.completedAt! - a.completedAt!));
  const current = trees[0];

  return (
    <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 16, minHeight: '100%', boxSizing: 'border-box' }}>
      <div style={{ margin: '0 -4px' }}>
        <Top title={<Top.TitleParagraph size={22}>나의 숲</Top.TitleParagraph>} />
      </div>
      <div style={card}>
        <p style={cardTitle}>내 나무 테마</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {THEMES.map(t => {
            const owned = ownedThemes.includes(t.id);
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

      <p style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: '4px 0 0' }}>
        다 키운 나무 {done.length}그루
      </p>

      {done.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', padding: '40px 20px' }}>
          <span style={{ fontSize: 48 }}>🌱</span>
          <p style={{ fontSize: 15, color: C.sub, margin: '12px 0 0' }}>
            첫 나무를 만개시키면 여기 영구 보관돼요
          </p>
        </div>
      ) : (
        <div style={grid}>
          {done.map(t => {
            const theme = themeOf(t.themeId);
            return (
              <div key={t.id} style={{ ...card, textAlign: 'center', padding: 16 }}>
                <span style={{ fontSize: 44 }}>{theme.stageEmoji.bloom}</span>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: '8px 0 0' }}>{theme.label}</p>
                <p style={{ fontSize: 12, color: C.sub, margin: '4px 0 0' }}>
                  {new Date(t.completedAt!).toLocaleDateString('ko-KR')}
                </p>
                <p style={{ fontSize: 13, color: C.green, fontWeight: 700, margin: '4px 0 0' }}>
                  {t.savedAmount.toLocaleString()}원 지킴
                </p>
              </div>
            );
          })}
        </div>
      )}

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
    </div>
  );
}

const cardTitle: CSSProperties = { fontSize: 14, color: C.sub, margin: '0 0 10px' };
const grid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 };
const themeChip: CSSProperties = {
  background: C.bg, border: '1px solid transparent', borderRadius: 20, padding: '8px 14px',
  fontSize: 13, fontWeight: 600, color: C.text, cursor: 'pointer', fontFamily: 'inherit',
};
const themeChipActive: CSSProperties = { background: C.blueSoft, borderColor: C.blue, color: C.blue };
const inviteCard: CSSProperties = {
  background: '#FFF8E7', border: 'none', borderRadius: 20, padding: 20, textAlign: 'left',
  cursor: 'pointer', fontFamily: 'inherit',
};
