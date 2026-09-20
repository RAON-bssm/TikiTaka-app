import { formatLocationName } from '@/constants/location';
import { useCurrentBattles, type BattleSide, type CurrentBattle } from './useCurrentBattles';
import { useMyProfile } from '@/hooks/user/useMyProfile';

export interface MyBattle {
  isBye: boolean;
  myTeam: BattleSide;
  opponentTeam: BattleSide;
}

/**
 * 대결을 우리팀/상대팀 관점으로 돌려놓는다.
 *
 * `isMine`은 서버가 내 메인 동네 id로 판단한 값이지만 팀은 이름으로만 내려온다.
 * 이름이 어느 쪽과도 안 맞으면 우리팀과 상대팀을 뒤집어 보여줄 위험이 있어 아예 그리지 않는다.
 */
function orient(battle: CurrentBattle, myFullName: string): MyBattle | undefined {
  const isTeam1 = battle.team1.fullName === myFullName;
  const isTeam2 = battle.team2.fullName === myFullName;
  if (!isTeam1 && !isTeam2) {
    return undefined;
  }

  return {
    isBye: battle.isBye,
    myTeam: isTeam2 ? battle.team2 : battle.team1,
    opponentTeam: isTeam2 ? battle.team1 : battle.team2,
  };
}

export interface CurrentBattleState {
  /** 내 동네가 치르는 대결. 내 매치가 없으면 undefined다. */
  battle?: MyBattle;
  /**
   * 이번 라운드에 대결이 하나라도 열려 있는지.
   *
   * `battle`이 없는 이유가 **라운드 자체가 안 열린 것**인지 **내 동네만 빠진 것**인지
   * 화면이 구분해서 안내하려면 필요하다. (동네 수가 홀수면 매번 한 동네는 부전승으로 빠진다)
   */
  hasAnyBattle: boolean;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<void>;
}

/** 진행 중인 라운드에서 내 동네가 치르는 대결. 내 매치가 없으면 `battle`이 undefined다. */
export function useCurrentBattle(): CurrentBattleState {
  const battles = useCurrentBattles();
  const profile = useMyProfile();

  const mine = battles.battles.find((item) => item.isMine);
  const myFullName = profile.data
    ? formatLocationName(profile.data.main_location_city_name, profile.data.main_location_name)
    : undefined;
  const battle = mine && myFullName ? orient(mine, myFullName) : undefined;

  return {
    battle,
    hasAnyBattle: battles.battles.length > 0,
    isLoading: battles.isLoading || profile.isLoading,
    isError: battles.isError || profile.isError,
    refetch: async () => {
      await Promise.all([battles.refetch(), profile.refetch()]);
    },
  };
}
