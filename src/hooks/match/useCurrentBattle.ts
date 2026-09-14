import { useBoards } from '@/hooks/post/useBoards';
import { useLocationRanking } from '@/hooks/ranking/useLocationRanking';
import { useMyProfile } from '@/hooks/user/useMyProfile';
import type { Board } from '@/types/post';
import type { LocationRanking } from '@/types/ranking';

export interface BattleTeam {
  name: string;
  score: number;
}

export interface CurrentBattle {
  mission: string;
  isBye: boolean;
  myTeam: BattleTeam;
  opponentTeam: BattleTeam;
}

function toFullName(cityName: string, locationName: string): string {
  return `${cityName} ${locationName}`;
}

function toTeam(fullName: string, rows: LocationRanking[]): BattleTeam {
  const row = rows.find((item) => toFullName(item.city_name, item.location_name) === fullName);
  return { name: row?.location_name ?? fullName, score: row?.location_score ?? 0 };
}

function buildBattle(
  board: Board,
  myFullName: string,
  rows: LocationRanking[],
): CurrentBattle | undefined {
  const isTeam1 = board.team1_name === myFullName;
  const isTeam2 = board.team2_name === myFullName;
  if (!isTeam1 && !isTeam2) {
    return undefined;
  }

  return {
    mission: board.mission,
    isBye: board.match_type === '미션 위크' || board.team1_name === board.team2_name,
    myTeam: toTeam(myFullName, rows),
    opponentTeam: toTeam(isTeam1 ? board.team2_name : board.team1_name, rows),
  };
}

export function useCurrentBattle() {
  const boards = useBoards();
  const ranking = useLocationRanking();
  const profile = useMyProfile();

  const board = boards.data?.find((item) => item.my_match);
  const myFullName = profile.data
    ? toFullName(profile.data.main_location_city_name, profile.data.main_location_name)
    : undefined;

  const battle =
    board && myFullName && ranking.data
      ? buildBattle(board, myFullName, ranking.data.location_ranking)
      : undefined;

  return {
    battle,
    isLoading: boards.isLoading || ranking.isLoading || profile.isLoading,
    isError: boards.isError || ranking.isError || profile.isError,
    refetch: () => {
      void boards.refetch();
      void ranking.refetch();
      void profile.refetch();
    },
  };
}
