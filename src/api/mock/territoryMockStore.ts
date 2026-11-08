import { useSyncExternalStore } from 'react';

/**
 * 개발 빌드 전용 땅따먹기 목 설정. 서버에 땅 데이터가 생기기 전(대표 선발 전)에도
 * 새 화면을 직접 조작해 보려고 둔다. 메모리에만 있어 앱을 다시 켜면 꺼진다.
 * `__DEV__`가 아니면 켜지지 않는다.
 */
export type MockPhase = 'none' | 'selection' | 'awaitingPick' | 'setup' | 'battle';
export type MockChallengeOutcome = 'random' | 'CAPTURED' | 'FAILED';

export interface TerritoryMockSettings {
  enabled: boolean;
  phase: MockPhase;
  /** 내 팀(본진 구) 이름. 부산 구여야 동 목록이 나온다. */
  teamGu: string;
  /** 부산 밖에서도 도전·세팅 카메라를 쓸 수 있게 본진 구 위치 판정을 건너뛴다. */
  skipLocation: boolean;
  challengeOutcome: MockChallengeOutcome;
  /** AI 채점(세팅·도전·재촬영) 응답 지연 */
  scoringDelayMs: number;
}

let settings: TerritoryMockSettings = {
  enabled: false,
  phase: 'battle',
  teamGu: '북구',
  skipLocation: true,
  challengeOutcome: 'random',
  scoringDelayMs: 2000,
};

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getTerritoryMockSettings(): TerritoryMockSettings {
  return settings;
}

export function isTerritoryMockActive(): boolean {
  return __DEV__ && settings.enabled;
}

export function setTerritoryMockSettings(patch: Partial<TerritoryMockSettings>) {
  if (!__DEV__) return;
  settings = { ...settings, ...patch };
  listeners.forEach((listener) => listener());
}

export function useTerritoryMockSettings(): TerritoryMockSettings {
  return useSyncExternalStore(subscribe, getTerritoryMockSettings);
}
