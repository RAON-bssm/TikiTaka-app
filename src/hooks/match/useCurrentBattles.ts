import { formatLocationName } from '@/constants/location';
import { useBoards } from '@/hooks/post/useBoards';
import { useLocationRanking } from '@/hooks/ranking/useLocationRanking';
import type { Board } from '@/types/post';
import type { LocationRanking } from '@/types/ranking';

export interface BattleTeam {
  /** 카드에 쓰는 짧은 동네명. 예: '사상구' */
  name: string;
  /** 이번 라운드 누적 점수. */
  score: number;
}

/** 어느 동네인지 가려내야 하는 자리에서 쓰는 팀. 같은 이름의 구가 시/도마다 있다. */
export interface BattleSide extends BattleTeam {
  /** 시/도까지 합친 전체 지역명. 매치의 팀 이름이 이 형태다. */
  fullName: string;
}

export interface CurrentBattle {
  boardId: number;
  team1: BattleSide;
  team2: BattleSide;
  /** 부전승(미션 위크). 서버가 team1과 team2를 같은 동네로 만든다. */
  isBye: boolean;
  /** 내 메인 동네가 참가한 대결. */
  isMine: boolean;
}

/**
 * 매치의 팀 이름은 시/도까지 합친 전체 지역명이라 그 형태로 랭킹 행을 찾고,
 * 폭이 좁은 카드에는 짧은 동네명만 보여준다.
 */
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
 * 진행 중인 라운드의 모든 대결과 현재 점수.
 *
 * 서버에 "진행 중인 대결 점수"를 주는 API는 없다. 대신 라운드 끝에 승패를 정할 때 쓰는 것과
 * **같은 재료**로 조립한다 — 대진은 `/api/board`, 점수는 `/api/location/rank`의 현재 라운드
 * 누적 점수다. (인원수 보정 없이 두 점수를 그대로 비교한다)
 *
 * 내 동네 매치가 목록 맨 앞에 오는 것은 서버가 그렇게 정렬해 주기 때문이다.
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
