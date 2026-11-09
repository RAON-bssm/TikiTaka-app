import { useLocations } from '@/hooks/location/useLocations';

/** 팀 = 본진 구. 땅따먹기 응답은 구를 id로만 주므로 동네 목록에서 이름을 찾는다. */
export function useTeamName() {
  const { data: locations } = useLocations();
  return (locationId: number | undefined) =>
    locationId === undefined
      ? undefined
      : locations?.find((location) => location.location_id === locationId)?.location_name;
}
