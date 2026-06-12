import { contactsViral, setClipboardText, share, getTossShareLink, generateHapticFeedback } from '@apps-in-toss/web-framework';
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

// 햅틱 진동 (토스 밖에서는 Web Vibration API 폴백)
export type HapticType = 'success' | 'confetti' | 'tap' | 'basicWeak' | 'tickWeak';
export function haptic(type: HapticType) {
  try { void generateHapticFeedback({ type }); }
  catch { try { navigator.vibrate?.(type === 'confetti' ? [40, 60, 40] : 20); } catch { /* 무시 */ } }
}

// 토스 공식 공유 링크 (미설치 유저는 스토어로 유도됨)
async function appShareLink(): Promise<string | null> {
  try { return await getTossShareLink('intoss://jeolyaksoop'); }
  catch { return null; }
}

// 텍스트 공유: 토스 공유 시트 → 실패 시 클립보드 복사 폴백
// 주의: navigator.share()는 심사 반려 사유 — 반드시 SDK share만 사용
export async function shareText(text: string): Promise<'shared' | 'copied' | false> {
  track('report_share');
  const link = await appShareLink();
  const full = link ? `${text}\n${link}` : text;
  try { await share({ message: full }); return 'shared'; }
  catch { /* 토스 밖: 클립보드 폴백 */ }
  try { await setClipboardText(full); return 'copied'; }
  catch { /* 다음 폴백 */ }
  try { await navigator.clipboard.writeText(full); return 'copied'; }
  catch { return false; }
}
