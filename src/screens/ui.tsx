import { CSSProperties, ReactNode, useEffect } from 'react';
import { graniteEvent } from '@apps-in-toss/web-framework';

// 토스 팔레트
export const C = {
  bg: '#F2F4F6',
  card: '#FFFFFF',
  text: '#191F28',
  sub: '#6B7684',
  sub2: '#8B95A1',
  line: '#E5E8EB',
  blue: '#3182F6',
  blueSoft: '#E8F3FF',
  green: '#0E9A63',
  greenSoft: '#E7F6EF',
  orange: '#FF6B00',
  dark: '#191F28',
};

// 하드웨어/내비바 뒤로가기 연동 (커스텀 back 버튼 금지 — 심사 반려 사유)
export function useBackEvent(active: boolean, onBack: () => void) {
  useEffect(() => {
    if (!active) return;
    let cleanup: (() => void) | undefined;
    try {
      cleanup = graniteEvent.addEventListener('backEvent', { onEvent: () => onBack() });
    } catch { /* 토스 앱 밖 */ }
    return () => { try { cleanup?.(); } catch { /* 무시 */ } };
  }, [active, onBack]);
}

// 바텀시트 (alert/confirm 대체 — 시스템 모달 금지)
export function Sheet({ visible, onClose, children }: {
  visible: boolean; onClose: () => void; children: ReactNode;
}) {
  useBackEvent(visible, onClose);
  if (!visible) return null;
  return (
    <div style={sheetOverlay} onClick={onClose}>
      <div style={sheetBody} onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  );
}

const sheetOverlay: CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', zIndex: 100,
};
const sheetBody: CSSProperties = {
  background: C.card, borderRadius: '24px 24px 0 0',
  padding: '24px 24px calc(28px + env(safe-area-inset-bottom))',
  maxHeight: '85vh', overflowY: 'auto',
};

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 96, left: '50%', transform: 'translateX(-50%)',
      background: C.dark, color: '#FFF', borderRadius: 20, padding: '10px 18px',
      fontSize: 14, zIndex: 200, whiteSpace: 'nowrap', maxWidth: '88vw',
      overflow: 'hidden', textOverflow: 'ellipsis',
    }}>{message}</div>
  );
}

export const card: CSSProperties = {
  background: C.card, borderRadius: 20, padding: 20,
};

export function btn(bg: string, color = '#FFF'): CSSProperties {
  return {
    background: bg, color, border: 'none', borderRadius: 14,
    padding: '15px 0', width: '100%', fontSize: 16, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit',
  };
}
