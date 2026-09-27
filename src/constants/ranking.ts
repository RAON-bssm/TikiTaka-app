import type { CharacterConfig } from '@/constants/character/types';

export const RANKING_TABS = ['동네랭킹', '개인랭킹'] as const;
export type RankingTab = (typeof RANKING_TABS)[number];

// 서버가 남의 착용 정보를 주지 않아(`GET /api/users/rank`에 캐릭터 없음) 아바타를 클라이언트에서 채운다.
// 파츠 id는 모두 assets.ts 레지스트리에 등록된 값이어야 한다.
export const RANKING_CHARACTERS: CharacterConfig[] = [
  {
    body: 'body-01',
    eyes: 'eyes-01',
    eyesColor: 'sky',
    mouth: 'mouth-02',
    hairBack: 'hair-back-low-pigtails',
    hairFront: 'hair-front-basic',
    hairColor: 'black',
    clothing: 'clothing-04',
  },
  {
    body: 'body-02',
    eyes: 'eyes-01',
    eyesColor: 'pink',
    mouth: 'mouth-02',
    hairBack: 'hair-back-side-wave',
    hairFront: 'hair-front-basic',
    hairColor: 'brown',
    clothing: 'clothing-05',
    accessory: 'accessory-glasses',
  },
  {
    body: 'body-02',
    eyes: 'eyes-01',
    eyesColor: 'pink',
    mouth: 'mouth-01',
    hairBack: 'hair-back-puff',
    hairFront: 'hair-front-basic',
    hairColor: 'pink',
    clothing: 'clothing-03',
  },
  {
    body: 'body-01',
    eyes: 'eyes-01',
    eyesColor: 'green',
    mouth: 'mouth-01',
    hairBack: 'hair-back-short',
    hairFront: 'hair-front-basic',
    hairColor: 'brown',
    clothing: 'clothing-04',
  },
  {
    body: 'body-02',
    eyes: 'eyes-01',
    eyesColor: 'blue',
    mouth: 'mouth-01',
    hairBack: 'hair-back-low-tail',
    hairFront: 'hair-front-basic',
    hairColor: 'black',
    clothing: 'clothing-04',
    accessory: 'accessory-plaster',
  },
  {
    body: 'body-01',
    eyes: 'eyes-01',
    eyesColor: 'orange',
    mouth: 'mouth-02',
    hairBack: 'hair-back-side-tail',
    hairFront: 'hair-front-basic',
    hairColor: 'brown',
    clothing: 'clothing-06',
  },
  {
    body: 'body-02',
    eyes: 'eyes-01',
    eyesColor: 'blue',
    mouth: 'mouth-01',
    hairBack: 'hair-back-low-tail',
    hairFront: 'hair-front-basic',
    hairColor: 'pink',
    clothing: 'clothing-02',
  },
  {
    body: 'body-01',
    eyes: 'eyes-01',
    eyesColor: 'pink',
    mouth: 'mouth-02',
    hairBack: 'hair-back-low-pigtails',
    hairFront: 'hair-front-basic',
    hairColor: 'blond',
    clothing: 'clothing-02',
  },
  {
    body: 'body-02',
    eyes: 'eyes-01',
    eyesColor: 'sky',
    mouth: 'mouth-01',
    hairBack: 'hair-back-wave',
    hairFront: 'hair-front-basic',
    hairColor: 'black',
    clothing: 'clothing-03',
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
