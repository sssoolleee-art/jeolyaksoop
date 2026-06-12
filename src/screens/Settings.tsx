import { CSSProperties, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { C, Sheet, btn, card, useBackEvent } from './ui';

const GOALS = [30000, 50000, 100000];   // 월 3/5/10만원 → 주간 환산 표시

export default function Settings({ onClose }: { onClose: () => void }) {
  const { weeklyGoalKrw, setWeeklyGoal, notif, setNotif, resetAll, isPremium } = useAppStore();
  const [confirmReset, setConfirmReset] = useState<0 | 1 | 2>(0);

  useBackEvent(confirmReset === 0, onClose);

  const doReset = () => {
    resetAll();
    setConfirmReset(0);
    onClose();
  };

  return (
    <div style={overlay}>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: '8px 0 0' }}>설정</p>

        <div style={card}>
          <p style={sectionTitle}>알림</p>
          <ToggleRow label="주간 리포트 (일요일 21시)" value={notif.weeklyReport}
            onChange={v => setNotif({ weeklyReport: v })} />
          <ToggleRow label="나무 완성 알림" value={notif.treeDone}
            onChange={v => setNotif({ treeDone: v })} />
          <ToggleRow label="스트릭 리마인더 (21시)" value={notif.streakGuard}
            onChange={v => setNotif({ streakGuard: v })} />
          <p style={hint}>알림은 토스 앱 설정에서도 언제든 끌 수 있어요.</p>
        </div>

        <div style={card}>
          <p style={sectionTitle}>한 달 절약 목표</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {GOALS.map(g => {
              const weekly = Math.round(g / 4.345 / 1000) * 1000;
              const active = weeklyGoalKrw === weekly;
              return (
                <button key={g}
                  style={{ ...goalChip, ...(active ? goalChipActive : {}) }}
                  onClick={() => setWeeklyGoal(weekly)}
                >
                  월 {g / 10000}만원
                </button>
              );
            })}
          </div>
          <p style={hint}>주간 목표 약 {weeklyGoalKrw.toLocaleString()}원으로 리포트 점수를 계산해요.</p>
        </div>

        <div style={card}>
          <p style={sectionTitle}>구독</p>
          <p style={{ fontSize: 14, color: C.text, margin: 0 }}>
            {isPremium ? '프리미엄 이용 중' : '무료 플랜 이용 중'}
          </p>
          <p style={hint}>구독 해지는 토스 앱 &gt; 설정 &gt; 구독 관리에서 할 수 있어요. 해지해도 남은 기간은 이용 가능해요.</p>
        </div>

        <div style={card}>
          <p style={sectionTitle}>고객센터 · 약관</p>
          <p style={hint}>
            문의는 앱 상세페이지의 문의하기로 보내주세요. 영업일 기준 2일 내 답변드려요.<br />
            개인정보는 기기에만 저장되며 외부로 전송하지 않아요. 데이터 초기화 시 즉시 파기돼요.
          </p>
        </div>

        <button style={dangerBtn} onClick={() => setConfirmReset(1)}>데이터 초기화</button>
        <button style={btn(C.bg, C.text)} onClick={onClose}>닫기</button>
      </div>

      {/* 이중 확인 (시스템 confirm 금지 → 커스텀 시트 2단계) */}
      <Sheet visible={confirmReset === 1} onClose={() => setConfirmReset(0)}>
        <p style={confirmTitle}>모든 기록을 지울까요?</p>
        <p style={hint}>나무, 기록, 스트릭이 전부 사라져요. 구매 내역 복원은 가능해요.</p>
        <button style={{ ...btn('#E84D4D'), marginTop: 16 }} onClick={() => setConfirmReset(2)}>지우기</button>
        <button style={{ ...btn(C.bg, C.text), marginTop: 8 }} onClick={() => setConfirmReset(0)}>취소</button>
      </Sheet>
      <Sheet visible={confirmReset === 2} onClose={() => setConfirmReset(0)}>
        <p style={confirmTitle}>정말로요? 되돌릴 수 없어요.</p>
        <button style={{ ...btn('#E84D4D'), marginTop: 16 }} onClick={doReset}>네, 전부 지울게요</button>
        <button style={{ ...btn(C.bg, C.text), marginTop: 8 }} onClick={() => setConfirmReset(0)}>취소</button>
      </Sheet>
    </div>
  );
}

function ToggleRow({ label, value, onChange }: {
  label: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <button style={toggleRow} onClick={() => onChange(!value)}>
      <span style={{ fontSize: 14, color: C.text }}>{label}</span>
      <span style={{ ...knobTrack, background: value ? C.blue : C.line }}>
        <span style={{ ...knob, transform: value ? 'translateX(16px)' : 'none' }} />
      </span>
    </button>
  );
}

const overlay: CSSProperties = {
  position: 'fixed', inset: 0, background: C.bg, zIndex: 50, overflowY: 'auto',
};
const sectionTitle: CSSProperties = { fontSize: 14, color: C.sub, margin: '0 0 10px' };
const hint: CSSProperties = { fontSize: 12, color: C.sub2, lineHeight: 1.5, margin: '8px 0 0' };
const goalChip: CSSProperties = {
  flex: 1, background: C.bg, border: '1px solid transparent', borderRadius: 12,
  padding: '10px 0', fontSize: 14, fontWeight: 600, color: C.text, cursor: 'pointer', fontFamily: 'inherit',
};
const goalChipActive: CSSProperties = { background: C.blueSoft, borderColor: C.blue, color: C.blue };
const toggleRow: CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%',
  background: 'none', border: 'none', padding: '10px 0', cursor: 'pointer', fontFamily: 'inherit',
};
const knobTrack: CSSProperties = {
  width: 40, height: 24, borderRadius: 12, position: 'relative', transition: 'background .2s',
  display: 'inline-block', flexShrink: 0,
};
const knob: CSSProperties = {
  position: 'absolute', top: 2, left: 2, width: 20, height: 20, borderRadius: 10,
  background: '#FFF', transition: 'transform .2s', display: 'block',
};
const dangerBtn: CSSProperties = {
  background: 'none', border: 'none', color: '#E84D4D', fontSize: 14, fontWeight: 600,
  padding: '6px 0', cursor: 'pointer', fontFamily: 'inherit',
};
const confirmTitle: CSSProperties = { fontSize: 18, fontWeight: 700, color: C.text, margin: 0 };
