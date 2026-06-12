import { SavingRecord, CategoryId } from '../types';

export interface WeekAgg {
  weekKey: string;
  records: SavingRecord[];
  totalSaved: number;
  recordCount: number;
  activeDays: number;
  byCategory: Record<CategoryId, { amount: number; count: number }>;
  byHour: number[];        // 24칸, 기록 건수
  byDay: number[];         // 7칸(월~일), 절약액
}

export function weekKeyOf(ts: number): string {
  const d = new Date(ts);
  const day = (d.getDay() + 6) % 7;                 // 월=0
  const thursday = new Date(d); thursday.setDate(d.getDate() - day + 3);
  const firstThursday = new Date(thursday.getFullYear(), 0, 4);
  const week = 1 + Math.round(
    ((thursday.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getDay() + 6) % 7)) / 7
  );
  return `${thursday.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function aggregateWeek(all: SavingRecord[], weekKey: string): WeekAgg {
  const records = all.filter(r => weekKeyOf(r.createdAt) === weekKey);
  const byCategory = {} as WeekAgg['byCategory'];
  const byHour = Array(24).fill(0);
  const byDay = Array(7).fill(0);
  const days = new Set<string>();
  let totalSaved = 0;

  for (const r of records) {
    totalSaved += r.amount;
    const c = (byCategory[r.category] ??= { amount: 0, count: 0 });
    c.amount += r.amount; c.count += 1;
    const d = new Date(r.createdAt);
    byHour[d.getHours()] += 1;
    byDay[(d.getDay() + 6) % 7] += r.amount;
    days.add(d.toDateString());
  }
  return { weekKey, records, totalSaved, recordCount: records.length,
           activeDays: days.size, byCategory, byHour, byDay };
}
