import { WeekAgg } from './aggregate';

export function scoreWeek(agg: WeekAgg, weeklyGoalKrw: number) {
  const freq = (agg.activeDays / 7) * 40;

  const volume = Math.min(agg.totalSaved / Math.max(weeklyGoalKrw, 1), 1) * 30;

  const daily = agg.byDay;
  const mean = daily.reduce((a, b) => a + b, 0) / 7;
  let consistency = 0;
  if (mean > 0) {
    const sd = Math.sqrt(daily.reduce((a, b) => a + (b - mean) ** 2, 0) / 7);
    const cv = Math.min(sd / mean, 2);            // 변동계수 cap 2
    consistency = (1 - cv / 2) * 30;
  }
  const breakdown = {
    freq: Math.round(freq),
    volume: Math.round(volume),
    consistency: Math.round(consistency),
  };
  return { score: breakdown.freq + breakdown.volume + breakdown.consistency, breakdown };
}
