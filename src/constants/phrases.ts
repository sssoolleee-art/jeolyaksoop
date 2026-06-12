import { CategoryId } from '../types';

export interface Persona {
  id: string;
  match: { category: CategoryId | 'any'; hourBand: 'morning' | 'day' | 'evening' | 'night' | 'any' };
  title: string;
  comments: string[];
}

// 판정 우선순위: 배열 앞이 우선. category+hourBand 구체 매치 → any 매치 순.
export const PERSONAS: Persona[] = [
  { id: 'night_delivery', match: { category: 'delivery', hourBand: 'night' },
    title: '새벽 배달 유혹 파이터',
    comments: [
      '밤 11시의 치킨을 이긴 사람은 뭐든 이길 수 있어요.',
      '이번 주 가장 위험했던 순간, 전부 버텨냈네요.',
      '배달앱이 당신을 잃고 울고 있어요.',
      '심야 배달 {count}번 참기. 위장도 지갑도 평화로워요.',
      '새벽의 당신, 낮의 당신이 고마워하고 있어요.',
    ] },
  { id: 'evening_delivery', match: { category: 'delivery', hourBand: 'evening' },
    title: '저녁 배달 끊기 챔피언',
    comments: [
      '퇴근 후 "시켜 먹을까"를 {count}번 이겼어요.',
      '배달비에 최소주문금액까지, {amount}원이 그대로 남았어요.',
      '냉장고를 연 당신의 손, 이번 주의 MVP예요.',
      '저녁 7시의 유혹은 생각보다 힘이 세요. 그걸 이겼고요.',
      '오늘 저녁도 집밥 승리. 통장이 조용히 박수 치는 중.',
    ] },
  { id: 'morning_coffee', match: { category: 'coffee', hourBand: 'morning' },
    title: '모닝 카페인 절제러',
    comments: [
      '아메리카노 {count}잔을 참았어요. 카페인 대신 의지력 충전.',
      '커피값 {amount}원이 그대로 남았어요.',
      '출근길 카페 앞을 그냥 지나친 당신, 강한 사람이에요.',
      '이번 주 커피 절약만 모아도 한 끼 식사예요.',
      '내성 리셋 중. 다음 커피가 더 맛있을 거예요.',
    ] },
  { id: 'night_shopping', match: { category: 'shopping', hourBand: 'night' },
    title: '새벽 장바구니 비우기 달인',
    comments: [
      '새벽의 장바구니는 아침에 보면 다 필요 없는 것들이죠. 이미 알고 계셨네요.',
      '결제 직전에 멈춘 {count}번. 그게 제일 어려운 건데요.',
      '"내일 다시 생각해보자"를 실천한 한 주였어요.',
      '쇼핑몰 알고리즘과의 전투에서 승리했어요.',
      '장바구니에 넣는 건 무료니까, 거기까지만.',
    ] },
  { id: 'day_shopping', match: { category: 'shopping', hourBand: 'day' },
    title: '점심시간 지름 차단러',
    comments: [
      '점심시간의 "잠깐 구경만"이 제일 위험한데, {count}번 다 막았어요.',
      '특가 알림을 보고도 닫은 사람. 흔치 않아요.',
      '"품절되면 어떡하지"는 마케팅이 만든 문장이에요. 안 넘어갔네요.',
      '낮의 충동구매 {amount}원을 지켰어요. 월급이 덜 슬퍼해요.',
      '세일은 다음 달에도 해요. 당신은 이미 알고 있었고요.',
    ] },
  { id: 'night_taxi', match: { category: 'taxi', hourBand: 'night' },
    title: '막차 수호자',
    comments: [
      '막차를 잡은 밤이 {count}번. 택시비 {amount}원이 무사해요.',
      '11시 50분의 전력질주, 그 가치는 충분했어요.',
      '집에 가는 길이 조금 길어도, 지갑은 가벼워지지 않았어요.',
      '심야 할증의 세계에서 탈출 성공.',
      '오늘도 지하철이 당신의 영웅이에요.',
    ] },
  { id: 'day_snack', match: { category: 'snack', hourBand: 'day' },
    title: '오후 간식 방어단',
    comments: [
      '오후 3시의 디저트 유혹, {count}번 전부 방어 성공.',
      '편의점 신상은 다음 주에도 신상이에요. 잘 참았어요.',
      '간식값 {amount}원이 그대로예요. 입은 심심해도 지갑은 든든.',
      '당 떨어지는 시간을 물로 버틴 당신, 존경합니다.',
      '작은 금액이라고 무시 못 해요. 간식이 제일 자주 오는 유혹이거든요.',
    ] },
  { id: 'evening_drink', match: { category: 'drink', hourBand: 'evening' },
    title: '2차 탈출의 고수',
    comments: [
      '"딱 한 잔만 더"를 끊고 일어난 {count}번. 진짜 어려운 일이에요.',
      '술값 {amount}원과 내일 아침의 컨디션을 동시에 지켰어요.',
      '회식의 2차는 늘 1차보다 비싸죠. 그걸 피했네요.',
      '먼저 일어나는 용기가 제일 큰 절약이에요.',
      '오늘 밤의 절제가 내일의 숙취 해장비까지 아꼈어요.',
    ] },
  { id: 'subscription_cutter', match: { category: 'subscription', hourBand: 'any' },
    title: '구독 정리 마스터',
    comments: [
      '안 보는 구독을 해지한 결단. 매달 자동으로 절약돼요.',
      '구독료 {amount}원, 이건 한 번 참으면 매달 돌아오는 절약이에요.',
      '"언젠가 보겠지"의 언젠가는 안 와요. 정확한 판단이었어요.',
      '구독 해지 {count}건. 고정비를 줄인 사람이 진짜 고수예요.',
      '스트리밍보다 재밌는 건 줄어든 카드 명세서예요.',
    ] },
  { id: 'all_rounder', match: { category: 'any', hourBand: 'any' },
    title: '균형 잡힌 절약 올라운더',
    comments: [
      '특정 유혹에 약하지 않은 타입. 골고루 잘 참았어요.',
      '카테고리 편식 없는 절약. 제일 오래가는 유형이에요.',
      '{count}번의 작은 승리가 모여 {amount}원이 됐어요.',
      '꾸준함이 무기인 사람. 다음 주도 기대돼요.',
      '절약에도 밸런스가 있다면, 당신이 그 표본이에요.',
    ] },
];

export const SUMMARY_BY_SCORE: { min: number; lines: string[] }[] = [
  { min: 80, lines: [
    '이번 주 절제력, 상위권이에요. 이대로면 목표는 시간문제예요.',
    '거의 완벽한 한 주. 다음 주는 기록 갱신에 도전해봐요.',
    '유혹이 와도 흔들리지 않는 한 주였어요.',
    '이 페이스 그대로. 더 보탤 말이 없어요.',
  ] },
  { min: 60, lines: [
    '좋은 흐름이에요. 위험 시간대만 조심하면 다음 주는 더 좋아져요.',
    '안정적인 한 주. 한두 번의 고비만 더 넘기면 돼요.',
    '습관이 만들어지고 있어요. 이번 주가 그 증거예요.',
    '꾸준히 쌓이는 중. 다음 주 미션으로 한 단계 더.',
  ] },
  { min: 40, lines: [
    '절반은 성공한 한 주. 기록하는 것 자체가 이미 절약의 시작이에요.',
    '흔들린 날도 있었지만, 다시 돌아왔다는 게 중요해요.',
    '위험 시간대를 확인해보세요. 다음 주의 승부처예요.',
    '이번 주의 아쉬움은 다음 주의 연료예요.',
  ] },
  { min: 0, lines: [
    '시작이 반이에요. 이번 주는 워밍업이었다고 치죠.',
    '기록이 적었던 한 주. 하루 한 번 체크인부터 다시 가요.',
    '괜찮아요. 절약은 마라톤이니까요.',
    '다음 주 미션을 가볍게 잡아뒀어요. 다시 가봐요.',
  ] },
];

export const MISSION_TEMPLATES = [
  '다음 주 {category} 유혹에서 {amount}원 지키기',
  '{category} 절약 {amount}원 도전 — 이번 주보다 딱 10%만 더',
  '주 {days}일 기록 유지하면서 {amount}원 지키기',
];
