// 웹 프레임워크 환경: AsyncStorage 대신 localStorage (사주앱 등 기존 앱 검증 패턴)
export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const v = localStorage.getItem(key);
      return v ? (JSON.parse(v) as T) : fallback;
    } catch { return fallback; }
  },
  set(key: string, value: unknown) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota 등 무시 */ }
  },
  remove(key: string) {
    try { localStorage.removeItem(key); } catch { /* 무시 */ }
  },
};
