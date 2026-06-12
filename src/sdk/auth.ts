import { appLogin } from '@apps-in-toss/web-framework';

// 토스 로그인. MVP는 서버가 없으므로 인가 코드 교환 없이 로그인 완료 여부만 기록한다.
export async function tossLogin(): Promise<boolean> {
  try {
    const { authorizationCode } = await appLogin();
    return Boolean(authorizationCode);
  } catch {
    // 토스 앱 밖(로컬 브라우저)에서는 개발 편의를 위해 통과
    return import.meta.env.DEV;
  }
}
