import axios from 'axios';

import type { ApiResponse } from '@/types/api';
import type { TokenData } from '@/types/auth';

/**
 * 토큰 재발급 전용 Axios 인스턴스.
 *
 * 공용 client의 응답 인터셉터가 401을 만나면 재발급을 시도하는데, 그 재발급 요청까지
 * 같은 client로 보내면 재발급이 401일 때 다시 재발급을 부르는 무한 루프가 된다.
 * 그래서 인터셉터가 전혀 없는 별도 인스턴스를 쓴다.
 */
// eslint-disable-next-line import/no-named-as-default-member
const refreshClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * refresh token으로 새 토큰 쌍을 발급받는다. (공개 엔드포인트 — Authorization 헤더 불필요)
 *
 * 서버가 refresh 토큰을 로테이션하므로 응답의 refresh_token도 반드시 함께 저장해야 한다.
 */
export async function reissue(refreshToken: string): Promise<TokenData> {
  const { data } = await refreshClient.post<ApiResponse<TokenData>>('/api/auth/refresh', {
    refresh_token: refreshToken,
  });
  return data.data;
}
