import type { CharacterConfig } from './character/types';

/**
 * 홈 상단 배너 데이터 정의.
 *
 * 배너는 여러 장(슬라이드)으로 늘어날 수 있으므로, 컴포넌트가 아니라 이 데이터만 수정하면
 * 배너가 추가/변경되도록 구성한다. (문구·이미지·이동 경로만 채우면 됨)
 */

/** 제목 한 줄을 이루는 텍스트 조각. highlight=true면 강조색(primary)으로 렌더한다. */
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
