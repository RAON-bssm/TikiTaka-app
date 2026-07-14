/**
 * 랭킹 화면의 탭/정렬 옵션과 (임시) 목 데이터.
 *
 * 목록 데이터는 서버 연동 전 임시값이며, 연동 시 TanStack Query 훅으로 대체한다.
 */

import type { MatchTeam } from '@/components/ui/MatchCard';
import type { CharacterConfig } from '@/constants/character/types';

/** 랭킹 종류 탭 */
export const RANKING_TABS = ['동네랭킹', '개인랭킹'] as const;
export type RankingTab = (typeof RANKING_TABS)[number];

/** 정렬 필터 */
export const RANKING_SORTS = ['가장 높은 순', '가장 낮은 순'] as const;
export type RankingSort = (typeof RANKING_SORTS)[number];

/** 진행 중인 동네 대결. */
export interface Match {
  id: number;
  left: MatchTeam;
  right: MatchTeam;
}

/** 동네랭킹 한 행. */
export interface DistrictRanking {
  rank: number;
  location: string;
  score: number;
}

/** 개인랭킹 한 행. character는 각 유저의 캐릭터 구성. */
export interface PersonalRanking {
  rank: number;
  name: string;
  address: string;
  score: number;
  character: CharacterConfig;
}

// TODO: 서버 연동 시 TanStack Query로 대체
export const MATCHES: Match[] = [
  { id: 1, left: { name: '사상구', score: 80 }, right: { name: '영도구', score: 67 } },
  { id: 2, left: { name: '동래구', score: 67 }, right: { name: '강서구', score: 99 } },
  { id: 3, left: { name: '부산진구', score: 80 }, right: { name: '중구', score: 67 } },
];

// TODO: 서버 연동 시 TanStack Query로 대체
export const DISTRICT_RANKINGS: DistrictRanking[] = [
  { rank: 1, location: '부산시 영도구', score: 670 },
  { rank: 2, location: '부산시 사상구', score: 580 },
  { rank: 3, location: '부산시 부산진구', score: 550 },
  { rank: 4, location: '부산시 연제구', score: 530 },
  { rank: 5, location: '부산시 동래구', score: 420 },
  { rank: 6, location: '부산시 강서구', score: 390 },
  { rank: 7, location: '부산시 중구', score: 330 },
  { rank: 8, location: '부산시 해운대구', score: 320 },
  { rank: 9, location: '부산시 수영구', score: 220 },
];

// 개인랭킹 각 유저의 캐릭터. 순위별로 하나하나 수정할 수 있도록 개별 config로 분리했다.
// 파츠 id는 모두 src/constants/character/assets.ts 레지스트리에 등록된 값이어야 한다.
const RANK1_CHARACTER: CharacterConfig = {
  body: 'body01',
  eyes: 'eyes01',
  eyesColor: 'sky',
  mouth: 'mouth02',
  hairBack: 'low-pigtails',
  hairFront: 'basic',
  hairColor: 'black',
  clothing: 'clothing04',
};
const RANK2_CHARACTER: CharacterConfig = {
  body: 'body02',
  eyes: 'eyes01',
  eyesColor: 'pink',
  mouth: 'mouth02',
  hairBack: 'side-wave',
  hairFront: 'basic',
  hairColor: 'brown',
  clothing: 'clothing05',
  accessory: 'glasses',
};
const RANK3_CHARACTER: CharacterConfig = {
  body: 'body02',
  eyes: 'eyes01',
  eyesColor: 'pink',
  mouth: 'mouth01',
  hairBack: 'puff',
  hairFront: 'basic',
  hairColor: 'pink',
  clothing: 'clothing03',
};
const RANK4_CHARACTER: CharacterConfig = {
  body: 'body01',
  eyes: 'eyes01',
  eyesColor: 'green',
  mouth: 'mouth01',
  hairBack: 'short',
  hairFront: 'basic',
  hairColor: 'brown',
  clothing: 'clothing04',
};
const RANK5_CHARACTER: CharacterConfig = {
  body: 'body02',
  eyes: 'eyes01',
  eyesColor: 'blue',
  mouth: 'mouth01',
  hairBack: 'low-tail',
  hairFront: 'basic',
  hairColor: 'black',
  clothing: 'clothing04',
  accessory: 'plaster',
};
const RANK6_CHARACTER: CharacterConfig = {
  body: 'body01',
  eyes: 'eyes01',
  eyesColor: 'orange',
  mouth: 'mouth02',
  hairBack: 'side-tail',
  hairFront: 'basic',
  hairColor: 'brown',
  clothing: 'clothing06',
};
const RANK7_CHARACTER: CharacterConfig = {
  body: 'body02',
  eyes: 'eyes01',
  eyesColor: 'blue',
  mouth: 'mouth01',
  hairBack: 'low-tail',
  hairFront: 'basic',
  hairColor: 'pink',
  clothing: 'clothing02',
};
const RANK8_CHARACTER: CharacterConfig = {
  body: 'body01',
  eyes: 'eyes01',
  eyesColor: 'pink',
  mouth: 'mouth02',
  hairBack: 'low-pigtails',
  hairFront: 'basic',
  hairColor: 'blond',
  clothing: 'clothing02',
};
const RANK9_CHARACTER: CharacterConfig = {
  body: 'body02',
  eyes: 'eyes01',
  eyesColor: 'sky',
  mouth: 'mouth01',
  hairBack: 'wave',
  hairFront: 'basic',
  hairColor: 'black',
  clothing: 'clothing03',
};

// TODO: 서버 연동 시 TanStack Query로 대체
export const PERSONAL_RANKINGS: PersonalRanking[] = [
  { rank: 1, name: '가은니', address: '부산시 사상구', score: 580, character: RANK1_CHARACTER },
  { rank: 2, name: '사이다사주', address: '부산시 영도구', score: 420, character: RANK2_CHARACTER },
  { rank: 3, name: '니코꼬리찜', address: '부산시 사상구', score: 390, character: RANK3_CHARACTER },
  {
    rank: 4,
    name: '인제그만말해',
    address: '부산시 부산진구',
    score: 344,
    character: RANK4_CHARACTER,
  },
  {
    rank: 5,
    name: '니코꼬리찜',
    address: '부산시 동래구',
    score: 299,
    character: RANK5_CHARACTER,
  },
  { rank: 6, name: '거제야호', address: '부산시 연제구', score: 280, character: RANK6_CHARACTER },
  { rank: 7, name: 'SOMONOX', address: '부산시 수영구', score: 277, character: RANK7_CHARACTER },
  { rank: 8, name: '야르끙끙', address: '부산시 금정구', score: 233, character: RANK8_CHARACTER },
  { rank: 9, name: '고양이식빵', address: '부산시 강서구', score: 120, character: RANK9_CHARACTER },
];

/** 랭킹에 등장하는 캐릭터 구성 목록. (게시글 아바타를 랜덤으로 채울 때 재사용) */
export const RANKING_CHARACTERS: CharacterConfig[] = PERSONAL_RANKINGS.map((r) => r.character);

/**
 * 랭킹 캐릭터 중 하나를 골라 반환한다.
 *
 * seed(예: post_id)를 주면 그 문자열을 해시해 **항상 같은 캐릭터**를 반환한다.
 * (같은 게시글이 매 렌더마다 다른 캐릭터로 깜빡이지 않도록 하기 위함.)
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
