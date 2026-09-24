import type { CharacterConfig } from './character/types';

// 홈 상단 배너. 슬라이드 추가/변경은 컴포넌트가 아니라 이 데이터만 고친다.

/** highlight=true면 강조색(primary)으로 렌더한다. */
export interface BannerTitleSegment {
  text: string;
  highlight?: boolean;
}

export interface BannerSlide {
  id: string;
  eyebrow: string;
  title: BannerTitleSegment[][];
  character: CharacterConfig;
  href?: string;
}

export const BANNER_SLIDES: BannerSlide[] = [
  {
    id: 'district-league',
    eyebrow: '여러분들의 동네리그에 참여해보세요',
    title: [
      [{ text: '우리가 남긴' }],
      [{ text: '우리 동네', highlight: true }, { text: '를' }],
      [{ text: '살펴볼까요?' }],
    ],
    character: {
      body: 'body02',
      eyes: 'eyes01',
      eyesColor: 'orange',
      mouth: 'mouth01',
      hairBack: 'long',
      hairFront: 'basic',
      hairColor: 'black',
      clothing: 'clothing01',
    },
  },
];
