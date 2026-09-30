import * as SecureStore from 'expo-secure-store';

import type { ApiResponse } from '@/types/api';
import type { MatchResultListData, Stage } from '@/types/match';
import client from './client';

export async function getMatchStage(): Promise<Stage> {
  const { data } = await client.get<ApiResponse<Stage>>('/api/match/stage');
  return data.data;
}

/** 직전 종료 라운드의 결과. 없으면 빈 배열. */
export async function getMatchResult(): Promise<MatchResultListData> {
  const { data } = await client.get<ApiResponse<MatchResultListData>>('/api/match/result');
  return data.data;
}

// 서버에 "대결 종료" 팝업을 봤는지 여부가 없어 기기에 마지막으로 확인한 stage_id를 저장한다.
const SEEN_RESULT_STAGE_KEY = 'seenMatchResultStageId';

export async function getSeenResultStageId(): Promise<number | null> {
  const raw = await SecureStore.getItemAsync(SEEN_RESULT_STAGE_KEY);
  return raw ? Number(raw) : null;
}

export async function setSeenResultStageId(stageId: number): Promise<void> {
  await SecureStore.setItemAsync(SEEN_RESULT_STAGE_KEY, String(stageId));
}
