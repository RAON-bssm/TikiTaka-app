/** 미션 변경 후 재촬영 전까지 대기 중인 미션. 서버는 표시용 문자열을 주지 않아 형용사·명사를 붙인다. */
export function getPendingMission(territory: {
  pending_adjective?: string;
  pending_noun?: string;
}): string | undefined {
  if (!territory.pending_adjective || !territory.pending_noun) return undefined;
  return `${territory.pending_adjective} ${territory.pending_noun}`;
}

/** 미션 입력 화면의 추천 단어. 눌러서 바로 채울 수 있다. */
export const ADJECTIVE_SUGGESTIONS = [
  '노을 지는',
  '반짝이는',
  '오래된',
  '시원한',
  '알록달록한',
  '조용한',
];
export const NOUN_SUGGESTIONS = ['바다', '골목', '간판', '계단', '나무', '자전거'];
