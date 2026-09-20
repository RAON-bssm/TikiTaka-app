/**
 * 랭킹 화면의 탭/정렬 옵션과, 아바타가 없는 개인 랭킹에 채워 넣을 캐릭터 풀.
 */

import type { CharacterConfig } from '@/constants/character/types';

/** 랭킹 종류 탭 */
export const RANKING_TABS = ['동네랭킹', '개인랭킹'] as const;
export type RankingTab = (typeof RANKING_TABS)[number];

// 개인랭킹 아바타용 캐릭터 풀. 서버는 남의 착용 정보를 내려주지 않으므로
// (`GET /api/users/rank` 응답에 캐릭터 정보 없음) 클라이언트에서 임의로 채워 넣는다.
// 파츠 id는 모두 src/constants/character/assets.ts 레지스트리에 등록된 값이어야 한다.
export const RANKING_CHARACTERS: CharacterConfig[] = [
  {
    body: 'body01',
    eyes: 'eyes01',
    eyesColor: 'sky',
    mouth: 'mouth02',
    hairBack: 'low-pigtails',
    hairFront: 'basic',
    hairColor: 'black',
    clothing: 'clothing04',
  },
  {
    body: 'body02',
    eyes: 'eyes01',
    eyesColor: 'pink',
    mouth: 'mouth02',
    hairBack: 'side-wave',
    hairFront: 'basic',
    hairColor: 'brown',
    clothing: 'clothing05',
    accessory: 'glasses',
  },
  {
    body: 'body02',
    eyes: 'eyes01',
    eyesColor: 'pink',
    mouth: 'mouth01',
    hairBack: 'puff',
    hairFront: 'basic',
    hairColor: 'pink',
    clothing: 'clothing03',
  },
  {
    body: 'body01',
    eyes: 'eyes01',
    eyesColor: 'green',
    mouth: 'mouth01',
    hairBack: 'short',
    hairFront: 'basic',
    hairColor: 'brown',
    clothing: 'clothing04',
  },
  {
    body: 'body02',
    eyes: 'eyes01',
    eyesColor: 'blue',
    mouth: 'mouth01',
    hairBack: 'low-tail',
    hairFront: 'basic',
    hairColor: 'black',
    clothing: 'clothing04',
    accessory: 'plaster',
  },
  {
    body: 'body01',
    eyes: 'eyes01',
    eyesColor: 'orange',
    mouth: 'mouth02',
    hairBack: 'side-tail',
    hairFront: 'basic',
    hairColor: 'brown',
    clothing: 'clothing06',
  },
  {
    body: 'body02',
    eyes: 'eyes01',
    eyesColor: 'blue',
    mouth: 'mouth01',
    hairBack: 'low-tail',
    hairFront: 'basic',
    hairColor: 'pink',
    clothing: 'clothing02',
  },
  {
    body: 'body01',
    eyes: 'eyes01',
    eyesColor: 'pink',
    mouth: 'mouth02',
    hairBack: 'low-pigtails',
    hairFront: 'basic',
    hairColor: 'blond',
    clothing: 'clothing02',
  },
  {
    body: 'body02',
    eyes: 'eyes01',
    eyesColor: 'sky',
    mouth: 'mouth01',
    hairBack: 'wave',
    hairFront: 'basic',
    hairColor: 'black',
    clothing: 'clothing03',
  },
];

/**
 * 랭킹 캐릭터 풀 중 하나를 골라 반환한다.
 *
 * seed(예: user_id, post_id)를 주면 그 문자열을 해시해 **항상 같은 캐릭터**를 반환한다.
 * (같은 사람/게시글이 매 렌더마다 다른 캐릭터로 깜빡이지 않도록 하기 위함.)
 * seed가 없으면 매 호출마다 무작위로 고른다.
 */
export function pickRankingCharacter(seed?: string): CharacterConfig {
  if (!seed) {
    return RANKING_CHARACTERS[Math.floor(Math.random() * RANKING_CHARACTERS.length)];
  }
  // 간단한 문자열 해시(djb2 변형) → 인덱스로 매핑
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % RANKING_CHARACTERS.length;
  return RANKING_CHARACTERS[index];
}
