import { useEffect, useRef } from 'react';
import { TossAds, loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/web-framework';

// 앱인토스 콘솔 발급 광고 ID (앱 ID 41619)
export const AD_IDS = {
  banner: 'ait.v2.live.7881a5b2dbb04d1a',        // 배너 — 나의 숲 하단
  rewarded: 'ait.v2.live.23558bf039cb4c2a',      // 리워드 — 홈 "광고 보고 물방울"
  interstitial: 'ait.v2.live.f7a89a8dd2454926',  // 전면형
};

// 배너: 도감 화면 하단 1개만 (홈에는 두지 않는다 — 코어 루프 보호)
export function BannerAd() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    try {
      if (!ref.current || !TossAds.attachBanner.isSupported()) return;
      const result = TossAds.attachBanner(AD_IDS.banner, ref.current);
      return () => { try { result.destroy(); } catch { /* 무시 */ } };
    } catch { /* 토스 앱 밖: 빈 슬롯 유지 */ }
  }, []);
  return <div ref={ref} style={{ width: '100%', minHeight: 50 }} />;
}

// 보상형: 시청 완료(userEarnedReward) 시에만 true
// 주의: 시청 중에는 타임아웃을 걸지 않는다(광고가 15~30초라 중간에 false로 끊기면 보상 누락).
// 로드 단계에만 타임아웃을 둬서 광고 자체가 안 뜨는 경우를 처리한다.
export async function showRewarded(): Promise<boolean> {
  if (!loadFullScreenAd.isSupported() || !showFullScreenAd.isSupported()) {
    return import.meta.env.DEV;   // 로컬 브라우저: 개발 편의상 보상 처리
  }
  return new Promise<boolean>(resolve => {
    let settled = false;
    const done = (v: boolean) => { if (!settled) { settled = true; resolve(v); } };
    let rewarded = false;
    // 로드 10초 안 되면 포기 (네트워크/노출 실패 대비)
    const loadTimer = setTimeout(() => done(false), 10_000);

    const cleanupLoad = loadFullScreenAd({
      options: { adGroupId: AD_IDS.rewarded },
      onEvent: event => {
        if (event.type !== 'loaded') return;
        clearTimeout(loadTimer);
        try { cleanupLoad(); } catch { /* 무시 */ }
        try {
          showFullScreenAd({
            options: { adGroupId: AD_IDS.rewarded },
            onEvent: ev => {
              if (ev.type === 'userEarnedReward') rewarded = true;
              if (ev.type === 'dismissed' || ev.type === 'failedToShow') done(rewarded);
            },
            onError: () => done(false),
          });
        } catch { done(false); }
      },
      onError: () => { clearTimeout(loadTimer); done(false); },
    });
  });
}
