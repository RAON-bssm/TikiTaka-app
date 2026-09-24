import type { CharacterConfig } from '@/constants/character/types';

export const RANKING_TABS = ['동네랭킹', '개인랭킹'] as const;
export type RankingTab = (typeof RANKING_TABS)[number];

// 서버가 남의 착용 정보를 주지 않아(`GET /api/users/rank`에 캐릭터 없음) 아바타를 클라이언트에서 채운다.
// 파츠 id는 모두 assets.ts 레지스트리에 등록된 값이어야 한다.
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
 * seed(user_id 등)를 주면 해시해 항상 같은 캐릭터를 반환한다(렌더마다 바뀌어 깜빡이지 않도록).
 * seed가 없으면 무작위.
 */
export function pickRankingCharacter(seed?: string): CharacterConfig {
  if (!seed) {
    return RANKING_CHARACTERS[Math.floor(Math.random() * RANKING_CHARACTERS.length)];
  }
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % RANKING_CHARACTERS.length;
  return RANKING_CHARACTERS[index];
}
