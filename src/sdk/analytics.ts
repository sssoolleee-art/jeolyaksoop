import { Analytics } from '@apps-in-toss/web-framework';

// 토스 콘솔 분석 이벤트. 토스 환경 밖(로컬 브라우저)에서는 콘솔 로그만 남는다.
export function track(event: string, props?: Record<string, string | number | boolean>) {
  try {
    void Analytics.click({ log_name: event, ...(props ?? {}) });
  } catch { /* 미지원 환경 */ }
  if (import.meta.env.DEV) console.log('[track]', event, props ?? {});
}
