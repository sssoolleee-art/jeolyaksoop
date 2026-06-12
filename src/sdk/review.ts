import { requestReview } from '@apps-in-toss/web-framework';

type ReviewTrigger = 'tree_complete' | 'report_week2';

// 같은 트리거로 중복 요청하지 않는다 (localStorage에 영구 기록)
export function maybeRequestReview(trigger: ReviewTrigger) {
  const key = `review_asked_${trigger}`;
  try {
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, '1');
    if (requestReview.isSupported()) void requestReview();
  } catch { /* 미지원 환경 */ }
}
