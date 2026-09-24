import axios from 'axios';

import type { ApiResponse } from '@/types/api';
import type { TokenData } from '@/types/auth';

// 인터셉터 없는 재발급 전용 인스턴스. 공용 client로 보내면 재발급의 401이 다시 재발급을 불러 무한 루프가 된다.
// eslint-disable-next-line import/no-named-as-default-member
const refreshClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** 서버가 refresh 토큰을 로테이션하므로 응답의 refresh_token도 반드시 저장해야 한다. */
export async function reissue(refreshToken: string): Promise<TokenData> {
  const { data } = await refreshClient.post<ApiResponse<TokenData>>('/api/auth/refresh', {
    refresh_token: refreshToken,
  });
  return data.data;
}
