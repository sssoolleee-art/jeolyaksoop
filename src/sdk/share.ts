import { contactsViral, setClipboardText } from '@apps-in-toss/web-framework';
import { useAppStore } from '../store/useAppStore';
import { track } from './analytics';

// 친구 초대 (연락처 공유 리워드). moduleId는 콘솔 미니앱 > 공유 리워드 메뉴에서 발급.
const VIRAL_MODULE_ID = 'PENDING_VIRAL_MODULE_ID';

export function inviteFriend(): void {
  track('invite_sent');
  try {
    const cleanup = contactsViral({
      options: { moduleId: VIRAL_MODULE_ID },
      onEvent: event => {
        // 공유 성공 시 비료 1개 지급 (기획서 2.7)
        if (event.type === 'sendViral') useAppStore.getState().addFertilizers(1);
        if (event.type === 'close') cleanup();
      },
      onError: () => cleanup(),
    });
  } catch { /* 미지원 환경 */ }
}

// 리포트 카드 텍스트 공유.
// 주의: navigator.share()는 시스템 다이얼로그로 간주되어 심사 반려 사유 →
// 클립보드 복사 후 호출부에서 커스텀 토스트로 안내한다.
export async function copyReportCard(text: string): Promise<boolean> {
  track('report_share');
  try { await setClipboardText(text); return true; }
  catch { /* 폴백으로 진행 */ }
  try { await navigator.clipboard.writeText(text); return true; }
  catch { return false; }
}
