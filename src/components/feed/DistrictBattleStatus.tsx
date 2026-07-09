import { View } from 'react-native';
import Typography from '../ui/Typography';

/** 대결에 참여하는 한 팀의 정보. */
export interface BattleTeam {
  /** 동네(구) 이름. 예: '강서구' */
  name: string;
  /** 현재 점수. */
  score: number;
}

interface Props {
  myTeam: BattleTeam;
  opponentTeam: BattleTeam;
}

export default function DistrictBattleStatus({ myTeam, opponentTeam }: Props) {
  const totalScore = myTeam.score + opponentTeam.score;
  const myRatio = totalScore === 0 ? 0.5 : myTeam.score / totalScore;

  return (
    <View className="flex flex-col w-full p-lg bg-white items-center rounded-md border border-gray-100 gap-lg">
      <Typography variant="h4" className="text-gray-600">
        우리 팀의 현재 상황
      </Typography>
      <View className="flex flex-row justify-contents items-center gap-2xl">
        <View className="flex flex-col items-center gap-xs">
          <Typography variant="caption" className="text-gray-500">
            우리팀
          </Typography>
          <Typography variant="h1" className="text-gray-800">
            {myTeam.name}
          </Typography>
          <Typography variant="h3" className="text-primary-600">
            {myTeam.score}
          </Typography>
        </View>
        <Typography variant="h3" className="text-primary-600">
          VS
        </Typography>
        <View className="flex flex-col items-center gap-xs">
          <Typography variant="caption" className="text-gray-500">
            상대팀
          </Typography>
          <Typography variant="h1" className="text-gray-800">
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
      <View className="flex flex-row items-center w-full justify-center p-xs bg-primary-100 rounded-full">
        <Typography variant="body3" className="text-primary-600">
          +67점
        </Typography>
        <Typography variant="body3" className="text-gray-600">
          {' '}
          앞서나가고 있어요!
        </Typography>
      </View>
    </View>
  );
}
