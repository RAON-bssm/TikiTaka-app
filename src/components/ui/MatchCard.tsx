import { View } from 'react-native';

import FireIcon from '@/assets/icons/fire.svg';
import { palette } from '@/constants/colors';
import Typography from './Typography';

/** 대결 카드에 표시할 한 팀 정보. */
export interface MatchTeam {
  /** 동네(구) 이름. 예: '사상구' */
  name: string;
  /** 현재 점수. */
  score: number;
}

interface Props {
  /** 왼쪽(파란색) 팀. */
  left: MatchTeam;
  /** 오른쪽(주황색) 팀. */
  right: MatchTeam;
}

const COLOR_BLUE = palette.secondary[500];
const COLOR_ORANGE = palette.primary[600];

/**
 * "현재 진행 중인 대결" 카드. 두 동네의 점수를 VS로 보여준다.
 * 앞서고 있는 팀의 색(왼쪽=파랑 / 오른쪽=주황)으로 우세 뱃지를 칠한다.
 */
export default function MatchCard({ left, right }: Props) {
  const leftLeading = left.score >= right.score;
  const leader = leftLeading ? left : right;

  return (
    <View className="items-center gap-lg rounded-sm border border-gray-100 bg-white px-lg py-md">
      {/* 우세 뱃지 — 앞선 팀 색으로 */}
      <View
        className={`flex-row items-center gap-xs rounded-full px-sm py-xs ${
          leftLeading ? 'bg-secondary-100' : 'bg-primary-100'
        }`}
      >
        <FireIcon width={20} height={20} color={leftLeading ? COLOR_BLUE : COLOR_ORANGE} />
        <Typography variant="body3" className="text-xs text-gray-700">
          {leader.name}가 우세합니다!
        </Typography>
      </View>

      {/* 점수 대결 */}
      <View className="flex-row items-center gap-xl">
        <View className="items-center gap-xs">
          <Typography variant="body3" className="text-xs text-secondary-500">
            {left.name}
          </Typography>
          <Typography variant="h2" className="text-gray-800">
            {left.score}점
          </Typography>
        </View>
        <Typography variant="h4" className="text-gray-700">
          VS
        </Typography>
        <View className="items-center gap-xs">
          <Typography variant="body3" className="text-xs text-primary-600">
            {right.name}
          </Typography>
          <Typography variant="h2" className="text-gray-800">
            {right.score}점
          </Typography>
        </View>
      </View>
    </View>
  );
}
