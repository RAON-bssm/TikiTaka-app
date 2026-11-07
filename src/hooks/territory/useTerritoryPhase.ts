import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

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

// 대표 선발은 새벽 배치라 늦을 수 있어, 발표를 기다리는 동안만 자주 다시 묻는다.
const AWAITING_PICK_REFETCH_MS = 60 * 1000;
// setTimeout 상한(약 24.8일)을 넘기지 않게 자른다.
const MAX_TIMER_MS = 24 * 60 * 60 * 1000;

/** 서버 시각은 오프셋 없는 KST라 기기 시간대와 무관하게 KST로 읽는다. */
export function parseKst(value: DateTimeString): number {
  return new Date(`${value}+09:00`).getTime();
}

export function getTerritoryPhase(cycle: CurrentCycle, now: number): TerritoryPhase {
  if (cycle.round_type === 'BATTLE') return 'battle';
  if (cycle.round_type === 'NONE') return 'none';
  if (cycle.representatives_selected) return 'setup';
  if (cycle.ranking_freeze_at && now >= parseKst(cycle.ranking_freeze_at)) return 'awaitingPick';
  return 'selection';
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
      return getTerritoryPhase(cycle, Date.now()) === 'awaitingPick'
        ? AWAITING_PICK_REFETCH_MS
        : false;
    },
  });
}

/** 단계 경계 시각이 지나면 사이클을 다시 받아 화면이 저절로 다음 단계로 넘어가게 한다. */
export function useTerritoryPhase() {
  const query = useCurrentCycle();
  const cycle = query.data;
  const [now, setNow] = useState(() => Date.now());
  const { refetch } = query;

  useEffect(() => {
    if (!cycle) return;
    const boundary = nextBoundary(cycle, Date.now());
    if (boundary === undefined) return;
    const timer = setTimeout(
      () => {
        setNow(Date.now());
        void refetch();
      },
      Math.min(boundary - Date.now() + 1000, MAX_TIMER_MS),
    );
    return () => clearTimeout(timer);
  }, [cycle, now, refetch]);

  return {
    ...query,
    phase: cycle ? getTerritoryPhase(cycle, now) : undefined,
    myLocationId: cycle?.my_location_id,
  };
}
