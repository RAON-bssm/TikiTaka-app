import type { ApiResponse } from '@/types/api';
import type {
  ChallengeRequest,
  ChallengeResult,
  CurrentCycle,
  DefensePhotoResult,
  DevelopResult,
  DevelopmentListData,
  DongPreference,
  DongPreferenceListData,
  MissionChange,
  MyTerritoryListData,
  RepresentativeListData,
  SetupTerritoryRequest,
  TeamRankingData,
  TerritoryDetail,
  TerritoryListData,
  UpdateDongPreferencesRequest,
  UpdateMissionRequest,
} from '@/types/territory';
import client from './client';
import { appendImage, MULTIPART_HEADERS } from './uploadImage';

// 세팅·도전·재촬영은 서버가 AI 채점까지 끝낸 뒤 응답해(동기) 기본 10초로는 채점 중에 끊긴다.
const SCORING_TIMEOUT_MS = 30 * 1000;

export async function getCurrentCycle(): Promise<CurrentCycle> {
  const { data } = await client.get<ApiResponse<CurrentCycle>>('/api/territory/cycle/current');
  return data.data;
}

export async function getDongPreferences(): Promise<DongPreference[]> {
  const { data } = await client.get<ApiResponse<DongPreferenceListData>>(
    '/api/territory/preferences',
  );
  return data.data.preferences;
}

/** PUT이라 통째로 교체한다. */
export async function updateDongPreferences(
  req: UpdateDongPreferencesRequest,
): Promise<DongPreference[]> {
  const { data } = await client.put<ApiResponse<DongPreferenceListData>>(
    '/api/territory/preferences',
    req,
  );
  return data.data.preferences;
}

export async function getRepresentatives(params: {
  cycleId?: number;
  locationId?: number;
}): Promise<RepresentativeListData> {
  const { data } = await client.get<ApiResponse<RepresentativeListData>>(
    '/api/territory/representatives',
    { params },
  );
  return data.data;
}

/** `locationId`를 빼면 부산 전체 땅을 준다. */
export async function getTerritories(locationId?: number): Promise<TerritoryListData> {
  const { data } = await client.get<ApiResponse<TerritoryListData>>('/api/territory/dongs', {
    params: { locationId },
  });
  return data.data;
}

/** 대표 선발 전이면 404("이 동의 땅이 아직 없습니다"). */
export async function getTerritory(dongCode: number): Promise<TerritoryDetail> {
  const { data } = await client.get<ApiResponse<TerritoryDetail>>(
    `/api/territory/dongs/${dongCode}`,
  );
  return data.data;
}

export async function setupTerritory(
  dongCode: number,
  { adjective, noun, scoringCriteria, imageUri }: SetupTerritoryRequest,
): Promise<DefensePhotoResult> {
  const formData = new FormData();
  formData.append('adjective', adjective);
  formData.append('noun', noun);
  if (scoringCriteria) formData.append('scoringCriteria', scoringCriteria);
  await appendImage(formData, imageUri);

  const { data } = await client.post<ApiResponse<DefensePhotoResult>>(
    `/api/territory/dongs/${dongCode}/setup`,
    formData,
    { headers: MULTIPART_HEADERS, timeout: SCORING_TIMEOUT_MS },
  );
  return data.data;
}

export async function challengeTerritory(
  dongCode: number,
  { imageUri, lat, lng }: ChallengeRequest,
): Promise<ChallengeResult> {
  const formData = new FormData();
  await appendImage(formData, imageUri);
  if (lat != null && lng != null) {
    formData.append('lat', String(lat));
    formData.append('lng', String(lng));
  }

  const { data } = await client.post<ApiResponse<ChallengeResult>>(
    `/api/territory/dongs/${dongCode}/challenge`,
    formData,
    { headers: MULTIPART_HEADERS, timeout: SCORING_TIMEOUT_MS },
  );
  return data.data;
}

export async function getChallenge(challengeId: string): Promise<ChallengeResult> {
  const { data } = await client.get<ApiResponse<ChallengeResult>>(
    `/api/territory/challenges/${challengeId}`,
  );
  return data.data;
}

export async function developTerritory(dongCode: number): Promise<DevelopResult> {
  const { data } = await client.post<ApiResponse<DevelopResult>>(
    `/api/territory/dongs/${dongCode}/develop`,
  );
  return data.data;
}

export async function getDevelopments(dongCode: number): Promise<DevelopmentListData> {
  const { data } = await client.get<ApiResponse<DevelopmentListData>>(
    `/api/territory/dongs/${dongCode}/developments`,
  );
  return data.data;
}

export async function getMyTerritories(): Promise<MyTerritoryListData> {
  const { data } = await client.get<ApiResponse<MyTerritoryListData>>('/api/territory/me');
  return data.data;
}

export async function updateMission(
  dongCode: number,
  req: UpdateMissionRequest,
): Promise<MissionChange> {
  const { data } = await client.patch<ApiResponse<MissionChange>>(
    `/api/territory/dongs/${dongCode}/mission`,
    req,
  );
  return data.data;
}

export async function retakeDefensePhoto(
  dongCode: number,
  imageUri: string,
): Promise<DefensePhotoResult> {
  const formData = new FormData();
  await appendImage(formData, imageUri);

  const { data } = await client.post<ApiResponse<DefensePhotoResult>>(
    `/api/territory/dongs/${dongCode}/defense-photo`,
    formData,
    { headers: MULTIPART_HEADERS, timeout: SCORING_TIMEOUT_MS },
  );
  return data.data;
}

export async function getTeamRanking(cycleId?: number): Promise<TeamRankingData> {
  const { data } = await client.get<ApiResponse<TeamRankingData>>('/api/territory/ranking/team', {
    params: { cycleId },
  });
  return data.data;
}
