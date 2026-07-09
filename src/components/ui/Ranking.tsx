import type { FC, ReactNode } from 'react';
import { View } from 'react-native';

import PlaceIcon from '@/assets/icons/place.svg';
import { palette } from '@/constants/colors';
import Typography from './Typography';

const COLOR_GRAY = palette.gray[500];

type RankingProps = {
  number: number;
  location: string;
  count: number;
  avatar?: ReactNode;
  address?: string;
};

const Ranking: FC<RankingProps> = ({ number, location, count, avatar, address }) => {
  return (
    <View
      className={`w-full flex-row items-center justify-between px-md ${avatar ? 'py-md' : 'py-lg'}`}
    >
      <Typography variant="body1" className={number <= 3 ? 'text-primary-600' : 'text-gray-500'}>
        {number}
      </Typography>

      {avatar}

      <View className="items-start gap-xs">
        <Typography variant="body1" className="text-gray-800">
          {location}
        </Typography>
        {address && (
          <View className="flex-row items-center gap-xs">
            <PlaceIcon width={12} height={12} color={COLOR_GRAY} />
            <Typography variant="body3" className="text-[10px] text-gray-500">
              {address}
            </Typography>
          </View>
        )}
      </View>

      <Typography variant="body1" className="text-primary-600">
        {count}점
      </Typography>
    </View>
  );
};

export default Ranking;
