import { formatLocationName } from '@/constants/location';
import { useBoards } from '@/hooks/post/useBoards';
import { useLocationRanking } from '@/hooks/ranking/useLocationRanking';
import type { Board } from '@/types/post';
import type { LocationRanking } from '@/types/ranking';

export interface BattleTeam {
  /** 짧은 동네명. 예: '사상구' */
  name: string;
  score: number;
}

/** 같은 이름의 구가 시/도마다 있어, 동네를 가려낼 때는 `fullName`으로 비교한다. */
export interface BattleSide extends BattleTeam {
  fullName: string;
}

export interface CurrentBattle {
  boardId: number;
  team1: BattleSide;
  team2: BattleSide;
  /** 부전승(미션 위크)이면 서버가 team1과 team2를 같은 동네로 만든다. */
  isBye: boolean;
  isMine: boolean;
}

// 매치의 팀 이름은 시/도까지 합친 전체 지역명이라 그 형태로 랭킹 행을 찾는다.
function toTeam(fullName: string, rows: LocationRanking[]): BattleSide {
  const row = rows.find(
    (item) => formatLocationName(item.city_name, item.location_name) === fullName,
  );
  // 랭킹 행이 없으면 이번 라운드에 아직 점수가 없는 동네다. 서버도 0점으로 계산한다.
  return { name: row?.location_name ?? fullName, fullName, score: row?.location_score ?? 0 };
}

function toBattle(board: Board, rows: LocationRanking[]): CurrentBattle {
  return {
    boardId: board.board_id,
    team1: toTeam(board.team1_name, rows),
    team2: toTeam(board.team2_name, rows),
    isBye: board.match_type === '미션 위크' || board.team1_name === board.team2_name,
    isMine: board.my_match,
  };
}

/**
 * "진행 중인 대결 점수" API가 없어, 서버가 승패를 정할 때와 같은 재료로 조립한다:
 * 대진은 `/api/board`, 점수는 `/api/location/rank`의 현재 라운드 누적 점수(인원수 보정 없음).
 * 내 동네 매치가 맨 앞인 것은 서버 정렬 덕분이다.
 */
export function useCurrentBattles() {
  const boards = useBoards();
  const ranking = useLocationRanking();

  const rows = ranking.data?.location_ranking;
  const battles = boards.data && rows ? boards.data.map((board) => toBattle(board, rows)) : [];

  return {
    battles,
    isLoading: boards.isLoading || ranking.isLoading,
    isError: boards.isError || ranking.isError,
    refetch: async () => {
      await Promise.all([boards.refetch(), ranking.refetch()]);
    },
  };
}
