import { View } from 'react-native';

import CheckIcon from '@/assets/icons/check.svg';
import { palette } from '@/constants/colors';
import type { MatchResult } from '@/types/match';
import Typography from './Typography';

const COLOR_ORANGE = palette.primary[600];

/**
 * "지난 라운드 경기 결과" 카드.
 *
 * `win_team`/`lost_team`이 둘 다 없으면 동점이거나 부전승이며, 구분은 `match_type`로 한다.
 * ('미션 위크' = 부전승)
 */
export default function MatchCard({ mission, win_team, lost_team, match_type }: MatchResult) {
  const decided = Boolean(win_team && lost_team);
  const resultLabel = decided
    ? `${win_team}가 승리했어요!`
    : match_type === '미션 위크'
      ? '이번 라운드는 미션 위크였어요'
      : '무승부였어요';

  return (
    <View className="items-center gap-lg rounded-sm border border-gray-100 bg-white px-lg py-md">
      {/* 결과 뱃지 */}
      <View className="flex-row items-center gap-xs rounded-full bg-primary-100 px-sm py-xs">
        {decided && <CheckIcon width={16} height={16} color={COLOR_ORANGE} />}
        <Typography variant="body3" className="text-xs text-gray-700">
          {resultLabel}
        </Typography>
      </View>

      {/* 대결 팀 — 승/패가 갈린 경우에만 표시 */}
      {decided && (
        <View className="flex-row items-center gap-xl">
          <View className="items-center gap-xs">
            <Typography variant="body3" className="text-xs text-primary-600">
              {win_team}
            </Typography>
            <Typography variant="h4" className="text-gray-800">
              승
            </Typography>
          </View>
          <Typography variant="h4" className="text-gray-700">
            VS
          </Typography>
          <View className="items-center gap-xs">
            <Typography variant="body3" className="text-xs text-gray-500">
              {lost_team}
            </Typography>
            <Typography variant="h4" className="text-gray-400">
              패
            </Typography>
          </View>
        </View>
      )}

      <Typography variant="body3" className="text-xs text-gray-400">
        {mission}
      </Typography>
    </View>
  );
}
