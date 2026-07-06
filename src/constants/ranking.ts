/**
 * 랭킹 화면의 탭/정렬 옵션과 (임시) 목 데이터.
 *
 * 목록 데이터는 서버 연동 전 임시값이며, 연동 시 TanStack Query 훅으로 대체한다.
 */

import type { MatchTeam } from '@/components/ui/MatchCard';
import type { CharacterConfig } from '@/constants/character/types';
import { DEFAULT_CHARACTER_CONFIG } from '@/constants/character/assets';

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
  { id: 2, left: { name: '사상구', score: 67 }, right: { name: '영도구', score: 99 } },
  { id: 3, left: { name: '사상구', score: 80 }, right: { name: '영도구', score: 67 } },
];

// TODO: 서버 연동 시 TanStack Query로 대체
export const DISTRICT_RANKINGS: DistrictRanking[] = Array.from({ length: 9 }, (_, i) => ({
  rank: i + 1,
  location: '부산시 사상구',
  score: 580,
}));

// TODO: 서버 연동 시 TanStack Query로 대체
export const PERSONAL_RANKINGS: PersonalRanking[] = Array.from({ length: 9 }, (_, i) => ({
  rank: i + 1,
  name: '니코꼬리찜',
  address: '부산시 사상구',
  score: 580,
  character: DEFAULT_CHARACTER_CONFIG,
}));
