import type { FC } from 'react';
import { View } from 'react-native';
import Typography from './Typography';

type RankingRowProps = {
  /** 순위 (1부터). 1~3위는 강조색으로 표시한다. */
  number: number;
  /** 동네(구) 이름. */
  location: string;
  /** 점수. */
  count: number;
};

const Ranking: FC<RankingRowProps> = ({ number, location, count }) => {
  return (
    <View className="w-full flex-row items-center gap-md px-md py-lg">
      {/* 순위 (왼쪽) — 1~3위 강조 */}
      <Typography
        variant="body1"
        className={`w-8 ${number <= 3 ? 'text-primary-600' : 'text-gray-600'}`}
      >
        {number}
      </Typography>
      {/* 동네명 (중앙) */}
      <Typography variant="body1" className="flex-1 text-center text-gray-900">
        {location}
      </Typography>
      {/* 점수 (오른쪽) */}
      <Typography variant="body1" className="w-16 text-right font-semibold text-primary-600">
        {count}점
      </Typography>
    </View>
  );
};

export default Ranking;
