import { useLocations } from '@/hooks/location/useLocations';
import { useCurrentCycle } from './useTerritoryPhase';

/**
 * 땅따먹기 팀 = 사이클이 시작될 때의 본진 구(`my_location_id`). 사이클 중 본진을 바꿔도 팀은 그대로라
 * `myInfo.main_location`이 아니라 이 값을 기준으로 위치 판정·희망 동 목록·팀 표시를 한다.
 */
export function useMyTeam() {
  const cycle = useCurrentCycle();
  const locations = useLocations();
  const locationId = cycle.data?.my_location_id;
  const team =
    locationId === undefined
      ? undefined
      : locations.data?.find((location) => location.location_id === locationId);

  return {
    team,
    locationId,
    isLoading: cycle.isLoading || locations.isLoading,
    isError: cycle.isError || locations.isError,
    refetch: () => {
      void cycle.refetch();
      void locations.refetch();
    },
  };
}
