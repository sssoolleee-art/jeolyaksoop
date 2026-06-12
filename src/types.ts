export type CategoryId =
  | 'coffee' | 'delivery' | 'taxi' | 'shopping'
  | 'snack' | 'subscription' | 'drink' | 'etc';

export interface SavingRecord {
  id: string;
  category: CategoryId;
  amount: number;        // 참은 금액 (원)
  memo?: string;
  createdAt: number;     // epoch ms
}

export interface Tree {
  id: string;
  themeId: string;       // 'basic' | 시즌 테마
  water: number;         // 누적 물방울
  startedAt: number;
  completedAt?: number;
  savedAmount: number;   // 이 나무를 키우는 동안 지킨 금액
}

export interface WeeklyReport {
  weekKey: string;            // '2026-W24'
  totalSaved: number;
  recordCount: number;
  activeDays: number;
  score: number;              // 0~100
  scoreBreakdown: { freq: number; volume: number; consistency: number };
  personaId: string;
  personaTitle: string;
  personaComment: string;
  summary: string;
  topCategory: { id: CategoryId; amount: number; count: number };
  byCategory: Record<CategoryId, number>;
  riskHours: number[];        // 유혹 집중 시간대 (0~23) 상위 3
  nextMission: { title: string; targetAmount: number };
  premiumLocked: boolean;     // true면 요약만 노출
}

export type ProductType = 'consumable' | 'non_consumable' | 'subscription';

export interface Product {
  id: string;
  type: ProductType;
  sku: string;           // 콘솔 등록 후 발급되는 실제 SKU (배포 전 grep PENDING_ 필수)
  priceKrw: number;      // SDK 표시가가 없을 때의 폴백 표기
  title: string;
  description: string;
}
