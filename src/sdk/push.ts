// 기능성 푸시 (기획서 2.6)
// 실제 발송은 앱인토스 콘솔에서 알림 동의문 등록(서비스명/발송시점/철회경로/고객센터 포함) 후
// 콘솔 발송 설정으로 이뤄진다. 클라이언트는 사용자의 동의 상태만 로컬에 관리한다.
// MVP에는 서버가 없으므로 발송 트리거 연동은 콘솔 등록 후 진행.

export type NotifType = 'weekly_report' | 'streak_guard' | 'tree_done';

export function consentLabel(type: NotifType): string {
  switch (type) {
    case 'weekly_report': return '주간 리포트 알림 (일요일 21시)';
    case 'streak_guard': return '스트릭 리마인더 (21시, 직접 켠 경우만)';
    case 'tree_done': return '나무 완성 알림';
  }
}
