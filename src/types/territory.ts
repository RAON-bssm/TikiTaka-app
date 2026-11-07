import type { DateTimeString } from './api';

/**
 * 땅따먹기(동 대표 선발전 + 땅따먹기) API 타입. 경로는 모두 `/api/territory`로 시작한다.
 * - 응답·JSON 본문은 snake_case, 쿼리와 multipart 필드는 camelCase(`locationId`, `scoringCriteria`)다.
 * - 값이 없는 필드는 키가 빠진다. 주인 없는 땅의 `owner_*`, 세팅 전 땅의 `mission`·`defense_photo`가 대표적이다.
 * - 통행료율·개발비·확률은 서버 설정값이라 바뀔 수 있다. 앱에서 계산하지 말고 응답값(`toll` 등)을 쓴다.
 */

/** `POINT`: 1~7일차(선발전·땅 세팅), `BATTLE`: 8~14일차, `NONE`: 사이클 밖 */
export type RoundType = 'POINT' | 'BATTLE' | 'NONE';
export type ChallengeOutcome = 'CAPTURED' | 'FAILED';
export type AssignedBy = 'PREFERENCE_1' | 'PREFERENCE_2' | 'PREFERENCE_3' | 'RANDOM';

/** 사이클이 없으면(`NONE`) 시각과 `cycle_id`가 빠진다. */
export interface CurrentCycle {
  cycle_id?: number;
  round_type: RoundType;
  point_started_at?: DateTimeString;
  /** 이 시각부터 개인·동네 랭킹이 멈춘다(포인트 라운드 4일차 끝). */
  ranking_freeze_at?: DateTimeString;
  battle_started_at?: DateTimeString;
  battle_ended_at?: DateTimeString;
  /** 선발은 새벽 배치라 늦어질 수 있다. 시각이 아니라 이 값으로 선발 여부를 판단한다. */
  representatives_selected: boolean;
  /** 내 본진 구 = 내 팀. 사이클 중에는 바뀌지 않는다. */
  my_location_id?: number;
}

export interface DongPreference {
  priority: 1 | 2 | 3;
  dong_id: number;
  dong_code: number;
  dong_name: string;
}

export interface DongPreferenceListData {
  preferences: DongPreference[];
}

/** 배열 순서가 1·2·3순위. 0~3개, 본진 구의 동만. 빈 배열이면 모두 지운다. */
export interface UpdateDongPreferencesRequest {
  dong_codes: number[];
}

/** 임시 API라 화면 확정 후 형식이 바뀔 수 있다. 차단·탈퇴 유저는 빠지지만 rank는 다시 매기지 않는다. */
export interface Representative {
  rank: number;
  user_id: string;
  user_name: string;
  score: number;
  location_id: number;
  dong_id: number;
  dong_code: number;
  dong_name: string;
  assigned_by: AssignedBy;
  mine: boolean;
}

export interface RepresentativeListData {
  cycle_id?: number;
  representatives_selected: boolean;
  representatives: Representative[];
}

/**
 * `location_id`는 동이 있는 구, `owner_location_id`는 주인의 팀(본진)이다. 다른 구 땅도 빼앗을 수 있어 다를 수 있다.
 * 차단한 유저의 땅이면 `blocked: true`이고 `owner_name`만 빠진다(팀 색을 위해 `owner_location_id`는 남는다).
 */
export interface TerritorySummary {
  territory_id: number;
  dong_id: number;
  dong_code: number;
  dong_name: string;
  location_id: number;
  owner_id?: string;
  owner_name?: string;
  owner_location_id?: number;
  defense_score: number;
  land_price: number;
  mine: boolean;
  /** 땅따먹기 라운드이고 내 땅·우리 팀 땅이 아닐 때. 포인트 부족은 보지 않는다. */
  challengeable: boolean;
  blocked: boolean;
}

/** 대표 선발 전이나 사이클 밖이면 `territories`가 빈 배열이다. */
export interface TerritoryListData {
  cycle_id?: number;
  round_type: RoundType;
  territories: TerritorySummary[];
}

export interface TerritoryDetail extends Omit<TerritorySummary, 'dong_id'> {
  /** 표시용(형용사 + 공백 + 명사). 세팅 전 땅이면 빠질 수 있다. */
  mission?: string;
  mission_adjective?: string;
  mission_noun?: string;
  scoring_criteria?: string;
  /** 미션 변경 후 재촬영 전의 대기 미션. 내 땅일 때만 온다. */
  pending_adjective?: string;
  pending_noun?: string;
  pending_criteria?: string;
  /** S3 key. 차단한 유저의 땅이면 빠진다. */
  defense_photo?: string;
  /** 성공·실패와 관계없이 도전할 때마다 낸다. */
  toll: number;
  development_cost: number;
  development_probability: number;
}

export interface SetupTerritoryRequest {
  adjective: string;
  noun: string;
  scoringCriteria?: string;
  imageUri: string;
}

/** 땅 세팅·대표 사진 재촬영의 응답. `defense_score`가 새 방어 점수다(낮아져도 바뀐다). */
export interface DefensePhotoResult {
  dong_code: number;
  mission: string;
  mission_adjective: string;
  mission_noun: string;
  scoring_criteria?: string;
  defense_photo: string;
  defense_score: number;
  review?: string;
}

export interface ChallengeRequest {
  imageUri: string;
  /** 서버는 기록만 한다. 본진 판정은 앱이 촬영 전에 한다. */
  lat?: number;
  lng?: number;
}

export interface ChallengeResult {
  challenge_id: string;
  dong_code: number;
  dong_name: string;
  /** 지금 그 땅의 미션이다. 도전 뒤 대표가 바꿨다면 바뀐 미션이 온다. */
  mission?: string;
  result: ChallengeOutcome;
  score: number;
  /** 도전 당시 방어 점수 */
  defense_score_at: number;
  toll: number;
  review?: string;
  created_at: DateTimeString;
  /** 통행료를 낸 뒤 내 포인트. 도전 응답에만 있고 결과 다시 조회에는 없다. */
  my_point?: number;
}

/** 실패도 HTTP 200에 `success: false`다. 개발비는 실패해도 돌려주지 않는다. */
export interface DevelopResult {
  dong_code: number;
  success: boolean;
  cost: number;
  probability: number;
  team_gain: number;
  land_price: number;
  next_cost: number;
  remaining_today: number;
  my_point: number;
}

export interface Development {
  development_id: number;
  user_id: string;
  /** 차단한 유저면 빠진다. */
  user_name?: string;
  success: boolean;
  cost: number;
  value_added: number;
  created_at: DateTimeString;
  mine: boolean;
  blocked: boolean;
}

/** 최신순 최대 100건 */
export interface DevelopmentListData {
  dong_code: number;
  dong_name: string;
  developments: Development[];
}

export interface MyTerritory {
  territory_id: number;
  dong_code: number;
  dong_name: string;
  location_id: number;
  mission?: string;
  mission_adjective?: string;
  mission_noun?: string;
  scoring_criteria?: string;
  pending_adjective?: string;
  pending_noun?: string;
  pending_criteria?: string;
  defense_photo?: string;
  defense_score: number;
  land_price: number;
  development_value: number;
  /** 하루 넘게 활동이 없으면 방어 점수가 매일 1점씩(60점까지) 내려간다. */
  owner_last_active_at?: DateTimeString;
}

/** `territories.length === max_owned`면 다른 땅에 도전할 수 없다(409). */
export interface MyTerritoryListData {
  cycle_id?: number;
  round_type: RoundType;
  max_owned: number;
  territories: MyTerritory[];
}

/** JSON 본문이라 snake_case다. 바로 적용되지 않고 대표 사진 재촬영에 성공해야 지금 미션이 된다. */
export interface UpdateMissionRequest {
  adjective: string;
  noun: string;
  scoring_criteria?: string;
}

export interface MissionChange {
  dong_code: number;
  mission?: string;
  pending_adjective: string;
  pending_noun: string;
  pending_criteria?: string;
}

export interface TeamRank {
  /** 같은 합계면 같은 순위(1, 1, 3) */
  rank: number;
  location_id: number;
  location_name: string;
  total_land_price: number;
  owned_dong_count: number;
  avg_land_price: number;
}

/**
 * `finalized: false`는 실시간, `true`는 땅따먹기 라운드 종료 뒤 확정값.
 * 대표 선발 전에 `cycleId` 없이 부르면 직전에 확정된 사이클을 준다.
 */
export interface TeamRankingData {
  cycle_id?: number;
  finalized: boolean;
  my_location_id?: number;
  teams: TeamRank[];
}
