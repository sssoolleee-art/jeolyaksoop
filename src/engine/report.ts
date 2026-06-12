import { aggregateWeek, weekKeyOf } from './aggregate';
import { scoreWeek } from './score';
import { pickPersona } from './persona';
import { SUMMARY_BY_SCORE, MISSION_TEMPLATES } from '../constants/phrases';
import { CATEGORIES } from '../constants/categories';
import { SavingRecord, WeeklyReport, CategoryId } from '../types';

function rotate<T>(arr: T[], seed: number): T { return arr[seed % arr.length]; }

function fill(t: string, v: Record<string, string | number>): string {
  return t.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ''));
}

export function buildWeeklyReport(opts: {
  records: SavingRecord[];
  weekKey?: string;                 // 기본: 지난주
  weeklyGoalKrw: number;
  isPremium: boolean;
  isFirstWeek: boolean;             // 첫 주는 전체 공개 (체험)
  checkinDates?: string[];          // 무지출 체크인 날들 ('YYYY-MM-DD') — 활동일로 인정
}): WeeklyReport {
  const weekKey = opts.weekKey ?? weekKeyOf(Date.now() - 7 * 86400000);
  const agg = aggregateWeek(opts.records, weekKey);

  // 무지출 체크인도 절제 활동 — 기록이 없는 체크인 날을 활동일에 합산
  const recordDays = new Set(agg.records.map(r => new Date(r.createdAt).toDateString()));
  const extraCheckinDays = (opts.checkinDates ?? []).filter(d => {
    const t = new Date(`${d}T12:00:00`);
    return weekKeyOf(t.getTime()) === weekKey && !recordDays.has(t.toDateString());
  }).length;
  agg.activeDays = Math.min(agg.activeDays + extraCheckinDays, 7);
  const { score, breakdown } = scoreWeek(agg, opts.weeklyGoalKrw);
  const persona = pickPersona(agg);
  const seed = parseInt(weekKey.slice(-2), 10);

  const topEntry = Object.entries(agg.byCategory)
    .sort((a, b) => b[1].amount - a[1].amount)[0];
  const topId = (topEntry?.[0] ?? 'etc') as CategoryId;
  const topCat = { id: topId, amount: topEntry?.[1].amount ?? 0, count: topEntry?.[1].count ?? 0 };
  const topLabel = CATEGORIES.find(c => c.id === topId)?.label ?? '기타';

  const riskHours = agg.byHour
    .map((n, h) => ({ h, n })).filter(x => x.n > 0)
    .sort((a, b) => b.n - a.n).slice(0, 3).map(x => x.h);

  const missionAmount = Math.ceil((topCat.amount * 1.1) / 1000) * 1000;
  const byCategory = Object.fromEntries(
    Object.entries(agg.byCategory).map(([k, v]) => [k, v.amount])
  ) as Record<CategoryId, number>;

  return {
    weekKey,
    totalSaved: agg.totalSaved,
    recordCount: agg.recordCount,
    activeDays: agg.activeDays,
    score, scoreBreakdown: breakdown,
    personaId: persona.id,
    personaTitle: persona.title,
    personaComment: fill(rotate(persona.comments, seed),
      { count: topCat.count, amount: topCat.amount.toLocaleString() }),
    summary: rotate(SUMMARY_BY_SCORE.find(s => score >= s.min)!.lines, seed),
    topCategory: topCat,
    byCategory,
    riskHours,
    nextMission: {
      title: fill(rotate(MISSION_TEMPLATES, seed), {
        category: topLabel, amount: missionAmount.toLocaleString(),
        days: Math.min(agg.activeDays + 1, 7),
      }),
      targetAmount: missionAmount,
    },
    premiumLocked: !(opts.isPremium || opts.isFirstWeek),
  };
}
