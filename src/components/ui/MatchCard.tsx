import { View } from 'react-native';

import FireIcon from '@/assets/icons/fire.svg';
import { palette } from '@/constants/colors';
import type { CurrentBattle } from '@/hooks/match/useCurrentBattles';
import Typography from './Typography';

// 대결 카드는 왼쪽 팀을 파랑, 오른쪽 팀을 주황으로 고정한다. 우세 뱃지도 앞선 쪽 색을 따른다.
const COLOR_TEAM1 = palette.secondary[500];
const COLOR_TEAM2 = palette.primary[600];

/** 진행 중인 대결 한 건. 점수는 라운드가 끝나면 그대로 승패 판정에 쓰이는 값이다. */
export default function MatchCard({ team1, team2, isBye }: CurrentBattle) {
  const leader = team1.score > team2.score ? team1 : team2.score > team1.score ? team2 : undefined;
  const leaderIsTeam1 = leader === team1;

  return (
    <View className="w-[250px] items-center gap-lg rounded-md border border-gray-100 bg-white px-lg py-md">
      {isBye ? (
        <View className="rounded-full bg-gray-100 px-md py-xs">
          <Typography variant="body3" className="text-xs text-gray-700">
            이번 라운드는 미션 위크예요
          </Typography>
        </View>
      ) : (
        <View
          className={`flex-row items-center gap-xs rounded-full px-md py-xs ${
            leader ? (leaderIsTeam1 ? 'bg-secondary-100' : 'bg-primary-100') : 'bg-gray-100'
          }`}
        >
          {leader && (
            <FireIcon width={16} height={16} color={leaderIsTeam1 ? COLOR_TEAM1 : COLOR_TEAM2} />
          )}
          <Typography variant="body3" className="text-xs text-gray-700">
            {leader ? `${leader.name}가 우세합니다!` : '아직 동점이에요'}
          </Typography>
        </View>
      )}

      {isBye ? (
        <View className="items-center gap-xs">
          <Typography variant="body3" className="text-xs text-secondary-500">
            {team1.name}
          </Typography>
          <Typography variant="h2" className="text-gray-800">
            {team1.score}점
          </Typography>
        </View>
      ) : (
        <View className="w-full flex-row items-center justify-center gap-md">
          <View className="flex-1 items-center gap-xs">
            <Typography variant="body3" className="text-xs text-secondary-500">
              {team1.name}
            </Typography>
            <Typography variant="h2" className="text-center text-gray-800">
              {team1.score}점
            </Typography>
          </View>
          <Typography variant="h4" className="text-gray-700">
            VS
          </Typography>
          <View className="flex-1 items-center gap-xs">
            <Typography variant="body3" className="text-xs text-primary-600">
              {team2.name}
            </Typography>
            <Typography variant="h2" className="text-center text-gray-800">
              {team2.score}점
            </Typography>
          </View>
        </View>
      )}
    </View>
  );
}
