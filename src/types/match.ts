import type { ApiResponse, DateTimeString } from './api';

/**
 * 매치 종류. **서버는 enum 이름이 아니라 한글 설명을 내려준다.** (`NORMAL` → `'일반 매치'`)
 * `matchType === 'BYE'` 같은 비교는 맞지 않는다.
 */
export const MATCH_TYPES = ['일반 매치', '이벤트 매치', '미션 위크'] as const;
export type MatchType = (typeof MATCH_TYPES)[number];

/**
 * 현재 시즌·라운드. `GET /api/match/stage`
 *
 * 시즌은 4라운드, 라운드는 7일. 랭킹·매치 결과가 모두 라운드 단위로 집계된다.
 */
export interface Stage {
  stage_id: number;
  season: number;
  round: number;
  started_at: DateTimeString;
}

export type StageResponse = ApiResponse<Stage>;

/**
 * 경기 결과 한 건. `GET /api/match/result`
 *
 * **직전에 종료된 라운드**의 결과이며, 끝난 라운드가 없으면 빈 배열이다.
 *
 * `win_team`/`lost_team`이 **둘 다 없으면** 동점이거나 부전승이고,
 * 구분은 `match_type`뿐이다. (`'미션 위크'` = 부전승)
 */
export interface MatchResult {
  match_id: number;
  mission: string;
  win_team?: string;
  lost_team?: string;
  match_type: MatchType;
}

/** `GET /api/match/result` 응답 data. (배열 키가 `matches`가 아니라 `match`다) */
export interface MatchResultListData {
  match: MatchResult[];
}

export type MatchResultListResponse = ApiResponse<MatchResultListData>;
