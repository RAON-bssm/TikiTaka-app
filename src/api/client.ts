import axios from 'axios';

import { getAccessToken } from './token';

// 기본 Axios 클라이언트 인스턴스 생성
// axios 타입 선언상 `create`가 named export로도 잡혀서 발생하는 false positive이므로 비활성화합니다.
// eslint-disable-next-line import/no-named-as-default-member
const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 개발용 고정 토큰(임시): 실제 저장된 토큰 대신 항상 이 값을 사용한다.
const DEV_TOKEN = '11111111-1111-1111-1111-111111111111';

// 요청 인터셉터: 저장된 액세스 토큰을 모든 요청에 자동으로 주입한다.
client.interceptors.request.use(
  async (config) => {
    // 임시: 개발용 고정 토큰 사용
    config.headers.Authorization = `Bearer ${DEV_TOKEN}`;

    // TODO: 개발 완료 후 아래 원래 로직으로 복구
    // const token = await getAccessToken();
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 응답 인터셉터 추가 (공통 에러 핸들링 등)
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // 예: 401 Unauthorized 에러 시 로그아웃 처리 등
    return Promise.reject(error);
  },
);

export default client;
