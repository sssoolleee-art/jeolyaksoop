import { WeekAgg } from './aggregate';
import { PERSONAS, Persona } from '../constants/phrases';
import { CategoryId } from '../types';

type HourBand = 'morning' | 'day' | 'evening' | 'night';

export function hourBandOf(hour: number): HourBand {
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'day';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

export function pickPersona(agg: WeekAgg): Persona {
  const topCat = (Object.entries(agg.byCategory)
    .sort((a, b) => b[1].amount - a[1].amount)[0]?.[0] ?? 'etc') as CategoryId;

  const bandCount: Record<HourBand, number> = { morning: 0, day: 0, evening: 0, night: 0 };
  agg.byHour.forEach((n, h) => { bandCount[hourBandOf(h)] += n; });
  const topBand = (Object.entries(bandCount)
    .sort((a, b) => b[1] - a[1])[0][0]) as HourBand;

  return PERSONAS.find(p => p.match.category === topCat && p.match.hourBand === topBand)
      ?? PERSONAS.find(p => p.match.category === topCat && p.match.hourBand === 'any')
      ?? PERSONAS[PERSONAS.length - 1];   // all_rounder 폴백
}
