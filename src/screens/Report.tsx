import { CSSProperties, useMemo, useState } from 'react';
import { Button, Top } from '@toss/tds-mobile';
import { useAppStore } from '../store/useAppStore';
import { buildWeeklyReport } from '../engine/report';
import { aggregateWeek, weekKeyOf } from '../engine/aggregate';
import { CATEGORIES } from '../constants/categories';
import { MONETIZATION_READY } from '../constants/products';
import { track } from '../sdk/analytics';
import { copyReportCard } from '../sdk/share';
import { maybeRequestReview } from '../sdk/review';
import { C, Toast, card } from './ui';

export default function Report({ onGoShop, onGoHome }: { onGoShop: () => void; onGoHome: () => void }) {
  const { records, weeklyGoalKrw, isPremium, installedAt } = useAppStore();
  const [toast, setToast] = useState<string | null>(null);

  // offset: 0 = 이번 주(집계 중), 1 = 지난주, 2 = 2주 전 …
  const [offset, setOffset] = useState(() => {
    const lastWeekKey = weekKeyOf(Date.now() - 7 * 86400000);
    return aggregateWeek(useAppStore.getState().records, lastWeekKey).recordCount > 0 ? 1 : 0;
  });

  const report = useMemo(() => {
    track('report_open', { offset });
    const installedDays = Date.now() - installedAt;
    if (installedDays >= 7 * 86400000 && installedDays < 14 * 86400000) {
      maybeRequestReview('report_week2');
    }
    return {
      live: offset === 0,
      ...buildWeeklyReport({
        records, weekKey: weekKeyOf(Date.now() - offset * 7 * 86400000),
        weeklyGoalKrw, isPremium,
        isFirstWeek: installedDays < 7 * 86400000,
      }),
    };
  }, [records, weeklyGoalKrw, isPremium, installedAt, offset]);

  // 주차 네비게이션 범위: 가장 오래된 기록이 있는 주 ~ 이번 주
  const mondayOf = (off: number) => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7) - off * 7);
  };
  const earliest = records.length ? Math.min(...records.map(r => r.createdAt)) : Date.now();
  const canPrev = weekKeyOf(Date.now() - (offset + 1) * 7 * 86400000) >= weekKeyOf(earliest);
  const weekLabel = `${mondayOf(offset).getMonth() + 1}월 ${mondayOf(offset).getDate()}일 주`;

  const maxCat = Math.max(...Object.values(report.byCategory), 1);

  // 메모가 있는 기록 = 유저가 직접 남긴 유혹의 순간 (해당 주차, 금액 큰 순 4개)
  const memoRecords = useMemo(
    () => records
      .filter(r => weekKeyOf(r.createdAt) === report.weekKey && r.memo)
      .sort((a, b) => b.amount - a.amount).slice(0, 4),
    [records, report.weekKey],
  );

  const share = async () => {
    const totalAll = records.reduce((a, r) => a + r.amount, 0);
    const text = [
      `🌳 나의 소비 페르소나: ${report.personaTitle}`,
      `절제력 ${report.score}점 · ${report.live ? '이번 주' : '지난주'} ${report.totalSaved.toLocaleString()}원 지킴`,
      report.personaComment,
      ``,
      `시작한 뒤로 지금까지 ${totalAll.toLocaleString()}원을 지켰어요 💰`,
      `토스에서 '절약숲'을 검색하면 너도 키울 수 있어 🌱`,
    ].join('\n');
    const ok = await copyReportCard(text);
    setToast(ok ? '복사 완료! 붙여넣으면 친구도 절약숲을 찾아올 수 있어요' : '복사에 실패했어요');
    setTimeout(() => setToast(null), 2500);
  };

  // 기록이 한 건도 없으면: 빈 리포트 대신 뭘 받게 되는지 보여준다
  if (records.length === 0) {
    return (
      <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ margin: '0 -4px' }}>
          <Top title={<Top.TitleParagraph size={22}>주간 리포트</Top.TitleParagraph>} />
        </div>
        <div style={{ ...card, textAlign: 'center', padding: '32px 20px' }}>
          <span style={{ fontSize: 48 }}>📊</span>
          <p style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: '12px 0 6px' }}>
            일요일 밤, 한 주의 절약 성적표가 나와요
          </p>
          <p style={{ fontSize: 14, color: C.sub, margin: 0, lineHeight: 1.6 }}>
            기록이 쌓이면 내 소비 페르소나와 절제력 점수,{'\n'}유혹이 몰린 시간대까지 분석해드려요
          </p>
        </div>
        <div style={{ ...card, opacity: 0.55 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.sub2, margin: '0 0 8px' }}>미리보기</p>
          <p style={personaTitle}>새벽 배달 유혹 파이터</p>
          <p style={personaComment}>밤 11시의 치킨을 이긴 사람은 뭐든 이길 수 있어요.</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: 12 }}>
            <span style={{ fontSize: 36, fontWeight: 800, color: C.blue, lineHeight: 1 }}>76</span>
            <span style={{ fontSize: 15, color: C.sub, marginLeft: 2 }}>점</span>
          </div>
        </div>
        <Button display="block" size="large" onClick={onGoHome}>첫 절약 기록하기</Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ margin: '0 -4px' }}>
        <Top title={<Top.TitleParagraph size={22}>주간 리포트</Top.TitleParagraph>} />
      </div>
      <div style={weekNav}>
        <button style={{ ...navBtn, opacity: canPrev ? 1 : 0.3 }} disabled={!canPrev}
          onClick={() => setOffset(offset + 1)}>‹</button>
        <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{weekLabel}</span>
        <button style={{ ...navBtn, opacity: offset > 0 ? 1 : 0.3 }} disabled={offset === 0}
          onClick={() => setOffset(offset - 1)}>›</button>
      </div>
      <p style={{ fontSize: 13, color: C.sub, margin: 0, textAlign: 'center' }}>
        {report.live ? '아직 집계 중이에요. 일요일 밤에 완성돼요.' : '주간 결산 리포트예요.'}
      </p>

      {report.recordCount === 0 ? (
        <div style={{ ...card, textAlign: 'center', padding: '36px 20px' }}>
          <span style={{ fontSize: 40 }}>🍂</span>
          <p style={{ fontSize: 15, fontWeight: 600, color: C.sub, margin: '10px 0 0' }}>
            이 주에는 기록이 없어요
          </p>
        </div>
      ) : (
      <>
      <div style={personaCard}>
        <p style={personaTitle}>{report.personaTitle}</p>
        <p style={personaComment}>{report.personaComment}</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: 16 }}>
          <span style={{ fontSize: 44, fontWeight: 800, color: C.blue, lineHeight: 1 }}>{report.score}</span>
          <span style={{ fontSize: 16, color: C.sub, marginLeft: 2 }}>점</span>
        </div>
        <p style={{ fontSize: 13, color: C.sub2, margin: '6px 0 0' }}>
          빈도 {report.scoreBreakdown.freq} · 규모 {report.scoreBreakdown.volume} · 일관성 {report.scoreBreakdown.consistency}
        </p>
        <p style={{ fontSize: 14, color: C.sub, margin: '8px 0 0' }}>{report.summary}</p>
        <button style={shareBtn} onClick={share}>내 페르소나 자랑하기</button>
      </div>

      <div style={card}>
        <p style={cardTitle}>{report.live ? '이번 주 지킨 돈' : '지난주 지킨 돈'}</p>
        <p style={bigNumber}>{report.totalSaved.toLocaleString()}원</p>
        <p style={sub}>{report.recordCount}번 참았어요 · {report.activeDays}일 기록</p>
      </div>

      {memoRecords.length > 0 && (
        <div style={card}>
          <p style={cardTitle}>버텨낸 순간들</p>
          {memoRecords.map(r => {
            const c = CATEGORIES.find(x => x.id === r.category)!;
            return (
              <p key={r.id} style={memoLine}>
                {c.emoji} {r.amount.toLocaleString()}원 · “{r.memo}”
              </p>
            );
          })}
        </div>
      )}

      {report.recordCount > 0 && (
        <div style={card}>
          <p style={cardTitle}>카테고리별</p>
          {Object.entries(report.byCategory).sort((a, b) => b[1] - a[1]).map(([id, amt]) => {
            const c = CATEGORIES.find(x => x.id === id)!;
            return (
              <div key={id} style={barRow}>
                <span style={barLabel}>{c.emoji} {c.label}</span>
                <div style={barTrack}>
                  <div style={{ ...barFill, width: `${(amt / maxCat) * 100}%` }} />
                </div>
                <span style={barAmt}>{amt.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      )}

      {report.premiumLocked && MONETIZATION_READY ? (
        <button style={lockCard} onClick={onGoShop}>
          <span style={{ color: '#FFF', fontSize: 15, fontWeight: 700 }}>
            🔒 위험 시간대 분석 · 다음 주 미션 · 월간 추세
          </span>
          <span style={{ color: C.sub2, fontSize: 13, marginTop: 6, display: 'block' }}>
            프리미엄에서 전체 리포트를 볼 수 있어요
          </span>
        </button>
      ) : (
        <>
          <div style={card}>
            <p style={cardTitle}>유혹이 몰린 시간</p>
            <p style={bigNumber}>
              {report.riskHours.map(h => `${h}시`).join(' · ') || '데이터 부족'}
            </p>
            <p style={sub}>이 시간대를 조심하면 다음 주가 편해져요</p>
          </div>
          <div style={card}>
            <p style={cardTitle}>다음 주 미션</p>
            <p style={{ fontSize: 17, fontWeight: 600, color: C.text, margin: 0 }}>
              {report.nextMission.title}
            </p>
          </div>
          {(isPremium) && <PremiumExtras />}
        </>
      )}
      </>
      )}
      <Toast message={toast} />
    </div>
  );
}

// 프리미엄 전용: 연간 환산 절약액 (월간 추세는 4주 데이터 쌓인 뒤 자연 확장)
function PremiumExtras() {
  const { records, installedAt } = useAppStore();
  const totalSaved = records.reduce((a, r) => a + r.amount, 0);
  const days = Math.max((Date.now() - installedAt) / 86400000, 1);
  const yearly = Math.round((totalSaved / days) * 365 / 10000) * 10000;
  if (totalSaved === 0) return null;
  return (
    <div style={{ ...card, background: C.greenSoft }}>
      <p style={cardTitle}>연간 환산</p>
      <p style={{ ...bigNumber, color: C.green }}>
        이 페이스면 1년에 {yearly.toLocaleString()}원
      </p>
    </div>
  );
}

const cardTitle: CSSProperties = { fontSize: 14, color: C.sub, margin: '0 0 8px' };
const personaTitle: CSSProperties = { fontSize: 22, fontWeight: 700, color: C.text, margin: 0 };
const personaComment: CSSProperties = { fontSize: 15, color: '#333D4B', margin: '8px 0 0', lineHeight: 1.5 };
const bigNumber: CSSProperties = { fontSize: 26, fontWeight: 700, color: C.text, margin: 0 };
const sub: CSSProperties = { fontSize: 13, color: C.sub, margin: '4px 0 0' };
const barRow: CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0' };
const barLabel: CSSProperties = { width: 76, fontSize: 13, color: '#333D4B', flexShrink: 0 };
const barTrack: CSSProperties = { flex: 1, height: 8, background: C.bg, borderRadius: 4 };
const barFill: CSSProperties = { height: 8, background: C.blue, borderRadius: 4 };
const barAmt: CSSProperties = { width: 64, fontSize: 12, color: C.sub, textAlign: 'right', flexShrink: 0 };
const lockCard: CSSProperties = {
  background: C.dark, borderRadius: 20, padding: 20, border: 'none', textAlign: 'left',
  cursor: 'pointer', fontFamily: 'inherit',
};
const personaCard: CSSProperties = {
  background: 'linear-gradient(150deg, #EAF4FF 0%, #FFFFFF 55%)',
  borderRadius: 20, padding: 20,
};
const memoLine: CSSProperties = {
  fontSize: 14, color: '#333D4B', margin: '8px 0 0', lineHeight: 1.5,
};
const weekNav: CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18,
};
const navBtn: CSSProperties = {
  width: 32, height: 32, borderRadius: 16, border: 'none', background: C.card,
  fontSize: 18, color: C.text, cursor: 'pointer', fontFamily: 'inherit', lineHeight: 1,
};
const shareBtn: CSSProperties = {
  marginTop: 16, width: '100%', background: C.blueSoft, color: C.blue, border: 'none',
  borderRadius: 12, padding: '12px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer',
  fontFamily: 'inherit',
};
