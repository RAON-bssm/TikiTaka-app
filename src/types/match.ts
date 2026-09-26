import type { ApiResponse, DateTimeString } from './api';

/** 서버가 enum 이름이 아니라 한글 설명을 내려준다. (`NORMAL` → `'일반 매치'`) */
export const MATCH_TYPES = ['일반 매치', '이벤트 매치', '미션 위크'] as const;
export type MatchType = (typeof MATCH_TYPES)[number];

/** 시즌은 4라운드, 라운드는 7일. 랭킹·매치 결과는 라운드 단위로 집계된다. */
export interface Stage {
  stage_id: number;
  season: number;
  round: number;
  started_at: DateTimeString;
}

export type StageResponse = ApiResponse<Stage>;

/**
 * 직전 종료 라운드의 결과. `win_team`/`lost_team`이 둘 다 없으면 동점 또는 부전승이고,
 * `match_type`으로만 구분한다(`'미션 위크'` = 부전승).
 */
export interface MatchResult {
  match_id: number;
  mission: string;
  win_team?: string;
  lost_team?: string;
  match_type: MatchType;
}

/** 배열 키가 `matches`가 아니라 `match`다. */
export interface MatchResultListData {
  match: MatchResult[];
}

export type MatchResultListResponse = ApiResponse<MatchResultListData>;
