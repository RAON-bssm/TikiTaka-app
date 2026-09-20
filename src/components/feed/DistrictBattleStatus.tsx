import { View } from 'react-native';

import type { BattleTeam } from '@/hooks/match/useCurrentBattles';
import Typography from '../ui/Typography';

interface Props {
  myTeam: BattleTeam;
  opponentTeam: BattleTeam;
  isBye?: boolean;
}

export default function DistrictBattleStatus({ myTeam, opponentTeam, isBye = false }: Props) {
  const totalScore = myTeam.score + opponentTeam.score;
  const myRatio = totalScore === 0 ? 0.5 : myTeam.score / totalScore;
  const diff = myTeam.score - opponentTeam.score;

  if (isBye) {
    return (
      <View className="flex flex-col w-full p-lg bg-white items-center rounded-md border border-gray-100 gap-lg">
        <Typography variant="h4" className="text-gray-600">
          우리 팀의 현재 상황
        </Typography>
        <View className="flex flex-col items-center gap-xs">
          <Typography variant="h1" className="text-center text-gray-800">
            {myTeam.name}
          </Typography>
          <Typography variant="h3" className="text-primary-600">
            {myTeam.score}
          </Typography>
        </View>
        <Typography variant="body3" className="text-gray-600">
          이번 라운드는 상대 없이 미션만 수행해요
        </Typography>
      </View>
    );
  }

  return (
    <View className="flex flex-col w-full p-lg bg-white items-center rounded-md border border-gray-100 gap-lg">
      <Typography variant="h4" className="text-gray-600">
        우리 팀의 현재 상황
      </Typography>
      <View className="flex flex-row w-full justify-center items-center gap-2xl">
        <View className="flex flex-1 flex-col items-center gap-xs">
          <Typography variant="caption" className="text-gray-500">
            우리팀
          </Typography>
          <Typography variant="h1" className="text-center text-gray-800">
            {myTeam.name}
          </Typography>
          <Typography variant="h3" className="text-primary-600">
            {myTeam.score}
          </Typography>
        </View>
        <Typography variant="h3" className="text-primary-600">
          VS
        </Typography>
        <View className="flex flex-1 flex-col items-center gap-xs">
          <Typography variant="caption" className="text-gray-500">
            상대팀
          </Typography>
          <Typography variant="h1" className="text-center text-gray-800">
            {opponentTeam.name}
          </Typography>
          <Typography variant="h3" className="text-primary-600">
            {opponentTeam.score}
          </Typography>
        </View>
      </View>
      <View
        className="w-full bg-gray-200 rounded-full overflow-hidden flex-row rounded-full"
        style={{ height: 8 }}
      >
        <View className="bg-primary-600" style={{ flex: myRatio }} />
        <View style={{ flex: 1 - myRatio }} />
      </View>
      <View className="flex flex-row items-center w-full justify-center">
        {diff === 0 ? (
          <Typography variant="body3" className="text-gray-600">
            지금은 동점이에요!
          </Typography>
        ) : (
          <>
            <Typography variant="body3" className="text-primary-600">
              {diff > 0 ? `+${diff}점` : `${-diff}점`}
            </Typography>
            <Typography variant="body3" className="text-gray-600">
              {diff > 0 ? ' 앞서나가고 있어요!' : ' 뒤지고 있어요'}
            </Typography>
          </>
        )}
      </View>
    </View>
  );
}
