import { useEffect, useRef } from 'react';
import { TossAds, loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/web-framework';

// TODO: 앱인토스 콘솔에서 광고 ID 발급 후 교체 (배너 1, 보상형 1 — 기획서 2.5)
export const AD_IDS = {
  banner: 'PENDING_BANNER_AD_ID',
  rewarded: 'PENDING_REWARDED_AD_ID',
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
export async function showRewarded(): Promise<boolean> {
  if (!loadFullScreenAd.isSupported() || !showFullScreenAd.isSupported()) {
    return import.meta.env.DEV;   // 로컬 브라우저: 개발 편의상 보상 처리
  }
  return new Promise<boolean>(resolve => {
    let rewarded = false;
    const cleanupLoad = loadFullScreenAd({
      options: { adGroupId: AD_IDS.rewarded },
      onEvent: event => {
        if (event.type !== 'loaded') return;
        cleanupLoad();
        try {
          showFullScreenAd({
            options: { adGroupId: AD_IDS.rewarded },
            onEvent: ev => {
              if (ev.type === 'userEarnedReward') rewarded = true;
              if (ev.type === 'dismissed' || ev.type === 'failedToShow') resolve(rewarded);
            },
            onError: () => resolve(false),
          });
        } catch { resolve(false); }
      },
      onError: () => { resolve(false); },
    });
    setTimeout(() => resolve(rewarded), 15_000);
  });
}
