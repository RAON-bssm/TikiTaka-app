import { useQuery } from '@tanstack/react-query';
import { useEffect, useSyncExternalStore } from 'react';

import { territoryKeys } from '@/api/queryKeys';
import { getCurrentCycle } from '@/api/territory';
import type { DateTimeString } from '@/types/api';
import type { CurrentCycle } from '@/types/territory';

/**
 * - `none`: 사이클 없음
 * - `selection`: 선발전(1~4일차). 희망 동 등록
 * - `awaitingPick`: 랭킹은 멈췄지만 대표 발표 전
 * - `setup`: 대표 발표 ~ 땅따먹기 시작 전. 대표는 땅 세팅
 * - `battle`: 땅따먹기(8~14일차)
 */
export type TerritoryPhase = 'none' | 'selection' | 'awaitingPick' | 'setup' | 'battle';

// 단계 전환은 새벽 배치라 시각보다 늦을 수 있어, 서버가 따라올 때까지 이 간격으로 다시 묻는다.
const LAGGING_REFETCH_MS = 60 * 1000;
const TICK_MS = 60 * 1000;
// setTimeout 상한(약 24.8일)을 넘기지 않게 자른다.
const MAX_TIMER_MS = 24 * 60 * 60 * 1000;

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** 서버 시각은 오프셋 없는 KST라 기기 시간대와 무관하게 KST로 읽는다. */
export function parseKst(value: DateTimeString): number {
  return new Date(`${value}+09:00`).getTime();
}

/**
 * 남은 시간을 `2일 5시간`, `3시간`, `12분` 같은 기간 명사로 준다(뒤에 "뒤", "남았어요"를 붙여 쓴다).
 * 시각이 없거나 이미 지났으면 undefined라, 호출부는 이 경우 문장을 따로 둔다.
 */
export function formatTimeLeft(value: DateTimeString | undefined, now: number): string | undefined {
  if (!value) return undefined;
  const left = parseKst(value) - now;
  if (left <= 0) return undefined;
  const days = Math.floor(left / DAY_MS);
  const hours = Math.floor((left % DAY_MS) / HOUR_MS);
  if (days >= 3) return `${days}일`;
  if (days >= 1) return hours > 0 ? `${days}일 ${hours}시간` : `${days}일`;
  if (hours >= 1) return `${hours}시간`;
  return `${Math.max(1, Math.ceil(left / MINUTE_MS))}분`;
}

export function describeTimeLeft(
  value: DateTimeString | undefined,
  now: number,
  format: (left: string) => string,
  fallback: string,
): string {
  const left = formatTimeLeft(value, now);
  return left ? format(left) : fallback;
}

export function getTerritoryPhase(cycle: CurrentCycle, now: number): TerritoryPhase {
  if (cycle.round_type === 'BATTLE') return 'battle';
  if (cycle.round_type === 'NONE') return 'none';
  if (cycle.representatives_selected) return 'setup';
  if (cycle.ranking_freeze_at && now >= parseKst(cycle.ranking_freeze_at)) return 'awaitingPick';
  return 'selection';
}

const passed = (value: DateTimeString | undefined, now: number) =>
  !!value && now >= parseKst(value);

/** 시각상 다음 단계여야 하는데 서버 값이 아직 이전 단계인지(배치 지연) */
function isServerLagging(cycle: CurrentCycle, now: number): boolean {
  if (cycle.round_type === 'POINT') {
    if (passed(cycle.battle_started_at, now)) return true;
    if (!cycle.representatives_selected && passed(cycle.ranking_freeze_at, now)) return true;
  }
  if (cycle.round_type === 'BATTLE' && passed(cycle.battle_ended_at, now)) return true;
  return false;
}

function nextBoundary(cycle: CurrentCycle, now: number): number | undefined {
  return [cycle.ranking_freeze_at, cycle.battle_started_at, cycle.battle_ended_at]
    .filter((value): value is string => !!value)
    .map(parseKst)
    .filter((time) => time > now)
    .sort((a, b) => a - b)[0];
}

export function useCurrentCycle() {
  return useQuery({
    queryKey: territoryKeys.cycle(),
    queryFn: getCurrentCycle,
    refetchInterval: (query) => {
      const cycle = query.state.data;
      if (!cycle) return false;
      return isServerLagging(cycle, Date.now()) ? LAGGING_REFETCH_MS : false;
    },
  });
}

// 지도·랭킹·허브 등 여러 화면이 동시에 이 훅을 쓰므로, 화면마다 타이머를 걸지 않고 시계 하나를 나눠 쓴다.
// 구독하는 화면이 없으면 타이머도 멈춘다.
const clock = {
  now: Date.now(),
  listeners: new Set<() => void>(),
  timer: undefined as ReturnType<typeof setInterval> | undefined,
};

function tickClock() {
  clock.now = Date.now();
  clock.listeners.forEach((listener) => listener());
}

function subscribeClock(listener: () => void) {
  clock.listeners.add(listener);
  if (!clock.timer) {
    clock.now = Date.now();
    clock.timer = setInterval(tickClock, TICK_MS);
  }
  return () => {
    clock.listeners.delete(listener);
    if (clock.listeners.size === 0 && clock.timer) {
      clearInterval(clock.timer);
      clock.timer = undefined;
    }
  };
}

const getClockNow = () => clock.now;

/**
 * 단계 경계 시각이 지나면 사이클을 다시 받아 화면이 저절로 다음 단계로 넘어가게 한다.
 * 서버 전환이 늦으면 `useCurrentCycle`의 refetchInterval이 따라잡을 때까지 다시 묻는다.
 */
export function useTerritoryPhase() {
  const query = useCurrentCycle();
  const cycle = query.data;
  const now = useSyncExternalStore(subscribeClock, getClockNow);
  const { refetch } = query;

  useEffect(() => {
    if (!cycle) return;
    const boundary = nextBoundary(cycle, Date.now());
    if (boundary === undefined) return;
    const timer = setTimeout(
      () => {
        tickClock();
        // 이 훅을 쓰는 화면마다 같은 시각에 부르므로, 진행 중인 요청을 취소하지 않고 하나로 합친다.
        void refetch({ cancelRefetch: false });
      },
      Math.min(boundary - Date.now() + 1000, MAX_TIMER_MS),
    );
    return () => clearTimeout(timer);
    // now가 1분마다 바뀌며 타이머를 다시 건다. 사이클은 구조 공유로 참조가 그대로라 상한으로 자른 긴 타이머도 이 덕에 이어진다.
  }, [cycle, now, refetch]);

  return {
    ...query,
    phase: cycle ? getTerritoryPhase(cycle, now) : undefined,
    myLocationId: cycle?.my_location_id,
    now,
  };
}
