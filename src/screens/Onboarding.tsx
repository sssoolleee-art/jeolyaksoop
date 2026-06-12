import { CSSProperties, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { tossLogin } from '../sdk/auth';
import { C, Toast, btn } from './ui';

const SLIDES = [
  { emoji: '✋', title: '참았다면, 기록하세요', body: '커피 한 잔, 배달 한 번.\n참은 소비를 2탭으로 기록해요.' },
  { emoji: '🌳', title: '참은 만큼 나무가 자라요', body: '참은 금액이 물방울이 되어\n나무를 키우고 숲이 돼요.' },
  { emoji: '📊', title: '일요일 밤, 소비 리포트', body: '내 소비 페르소나와 위험 시간대를\n매주 알려드려요.' },
];

const GOALS = [
  { monthly: 30000, label: '월 3만원', desc: '가볍게 시작' },
  { monthly: 50000, label: '월 5만원', desc: '커피·배달 줄이기' },
  { monthly: 100000, label: '월 10만원', desc: '본격 절약' },
];

export default function Onboarding() {
  const completeOnboarding = useAppStore(s => s.completeOnboarding);
  const [step, setStep] = useState(0);             // 0~2 슬라이드, 3 로그인, 4 목표+알림
  const [goal, setGoal] = useState(50000);
  const [notifOk, setNotifOk] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const login = async () => {
    if (busy) return;
    setBusy(true);
    const ok = await tossLogin();
    setBusy(false);
    if (ok) setStep(4);
    else {
      setToast('로그인에 실패했어요. 다시 시도해주세요.');
      setTimeout(() => setToast(null), 2200);
    }
  };

  const finish = () => {
    completeOnboarding(goal, { weeklyReport: notifOk, treeDone: notifOk });
  };

  if (step < 3) {
    const s = SLIDES[step];
    return (
      <div style={wrap}>
        <div style={center}>
          <span style={{ fontSize: 80 }}>{s.emoji}</span>
          <p style={title}>{s.title}</p>
          <p style={body}>{s.body}</p>
        </div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 20 }}>
          {SLIDES.map((_, i) => (
            <span key={i} style={{ ...dot, background: i === step ? C.blue : C.line }} />
          ))}
        </div>
        <button style={btn(C.blue)} onClick={() => setStep(step + 1)}>
          {step === 2 ? '시작하기' : '다음'}
        </button>
        {step < 2 && (
          <button style={skip} onClick={() => setStep(3)}>건너뛰기</button>
        )}
      </div>
    );
  }

  if (step === 3) {
    return (
      <div style={wrap}>
        <div style={center}>
          <span style={{ fontSize: 72 }}>🌳</span>
          <p style={title}>절약숲</p>
          <p style={body}>토스로 간편하게 시작해요</p>
        </div>
        <button style={btn(C.blue)} onClick={login} disabled={busy}>
          {busy ? '로그인 중…' : '토스로 시작하기'}
        </button>
        <Toast message={toast} />
      </div>
    );
  }

  return (
    <div style={wrap}>
      <div style={{ flex: 1, paddingTop: 32 }}>
        <p style={title}>한 달에 얼마나 지켜볼까요?</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
          {GOALS.map(g => (
            <button key={g.monthly}
              style={{ ...goalCard, ...(goal === g.monthly ? goalCardActive : {}) }}
              onClick={() => setGoal(g.monthly)}
            >
              <span style={{ fontSize: 16, fontWeight: 700 }}>{g.label}</span>
              <span style={{ fontSize: 13, color: goal === g.monthly ? C.blue : C.sub }}> · {g.desc}</span>
            </button>
          ))}
        </div>

        <button style={notifRow} onClick={() => setNotifOk(!notifOk)}>
          <span style={{ fontSize: 14, color: C.text, textAlign: 'left' }}>
            주간 리포트·나무 완성 알림 받기
            <span style={{ fontSize: 12, color: C.sub2, display: 'block', marginTop: 2 }}>
              일요일 밤 리포트가 도착하면 알려드려요 (설정에서 언제든 끄기 가능)
            </span>
          </span>
          <span style={{ fontSize: 22 }}>{notifOk ? '✅' : '⬜'}</span>
        </button>
      </div>
      <button style={btn(C.blue)} onClick={finish}>숲 만들기 시작</button>
    </div>
  );
}

const wrap: CSSProperties = {
  display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: 24,
  boxSizing: 'border-box', background: C.bg,
};
const center: CSSProperties = {
  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  textAlign: 'center',
};
const title: CSSProperties = { fontSize: 24, fontWeight: 700, color: C.text, margin: '20px 0 0' };
const body: CSSProperties = { fontSize: 15, color: C.sub, margin: '10px 0 0', lineHeight: 1.6, whiteSpace: 'pre-line' };
const dot: CSSProperties = { width: 8, height: 8, borderRadius: 4, display: 'inline-block' };
const skip: CSSProperties = {
  background: 'none', border: 'none', color: C.sub2, fontSize: 14, padding: '14px 0 0',
  cursor: 'pointer', fontFamily: 'inherit',
};
const goalCard: CSSProperties = {
  background: C.card, border: '1.5px solid transparent', borderRadius: 16, padding: '16px 18px',
  textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', color: C.text,
};
const goalCardActive: CSSProperties = { borderColor: C.blue, background: C.blueSoft, color: C.blue };
const notifRow: CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, width: '100%',
  background: C.card, border: 'none', borderRadius: 16, padding: '16px 18px', marginTop: 24,
  cursor: 'pointer', fontFamily: 'inherit',
};
