import { CSSProperties, useMemo, useState } from 'react';
import { Top } from '@toss/tds-mobile';
import { useAppStore } from '../store/useAppStore';
import { buildWeeklyReport } from '../engine/report';
import { aggregateWeek, weekKeyOf } from '../engine/aggregate';
import { CATEGORIES } from '../constants/categories';
import { MONETIZATION_READY } from '../constants/products';
import { track } from '../sdk/analytics';
import { copyReportCard } from '../sdk/share';
import { maybeRequestReview } from '../sdk/review';
import { C, Toast, card } from './ui';

export default function Report({ onGoShop }: { onGoShop: () => void }) {
  const { records, weeklyGoalKrw, isPremium, installedAt } = useAppStore();
  const [toast, setToast] = useState<string | null>(null);

  const report = useMemo(() => {
    track('report_open');
    // 지난주 기록이 있으면 지난주 리포트, 없으면 이번 주 중간 리포트
    const lastWeekKey = weekKeyOf(Date.now() - 7 * 86400000);
    const hasLastWeek = aggregateWeek(records, lastWeekKey).recordCount > 0;
    const weekKey = hasLastWeek ? lastWeekKey : weekKeyOf(Date.now());
    const installedDays = Date.now() - installedAt;
    if (installedDays >= 7 * 86400000 && installedDays < 14 * 86400000) {
      maybeRequestReview('report_week2');
    }
    return {
      live: !hasLastWeek,
      ...buildWeeklyReport({
        records, weekKey, weeklyGoalKrw, isPremium,
        isFirstWeek: installedDays < 7 * 86400000,
      }),
    };
  }, [records, weeklyGoalKrw, isPremium, installedAt]);

  const maxCat = Math.max(...Object.values(report.byCategory), 1);

  const share = async () => {
    const text = [
      `🌳 절약숲 주간 리포트`,
      `나의 소비 페르소나: ${report.personaTitle}`,
      `절제력 ${report.score}점 · 이번 주 ${report.totalSaved.toLocaleString()}원 지킴`,
      report.personaComment,
    ].join('\n');
    const ok = await copyReportCard(text);
    setToast(ok ? '리포트 카드가 복사됐어요. 어디든 붙여넣어 자랑하세요!' : '복사에 실패했어요');
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ margin: '0 -4px' }}>
        <Top title={<Top.TitleParagraph size={22}>주간 리포트</Top.TitleParagraph>} />
      </div>
      {report.live && (
        <p style={{ fontSize: 13, color: C.sub, margin: 0, textAlign: 'center' }}>
          이번 주 진행 중 리포트예요. 일요일 밤에 최종 리포트가 완성돼요.
        </p>
      )}

      <div style={card}>
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
        <button style={shareBtn} onClick={share}>페르소나 카드 공유하기</button>
      </div>

      <div style={card}>
        <p style={cardTitle}>이번 주 지킨 돈</p>
        <p style={bigNumber}>{report.totalSaved.toLocaleString()}원</p>
        <p style={sub}>{report.recordCount}번 참음 · {report.activeDays}일 활동</p>
      </div>

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
const shareBtn: CSSProperties = {
  marginTop: 16, width: '100%', background: C.blueSoft, color: C.blue, border: 'none',
  borderRadius: 12, padding: '12px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer',
  fontFamily: 'inherit',
};
