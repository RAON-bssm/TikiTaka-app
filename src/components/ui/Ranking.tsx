import type { ReactNode } from 'react';
import { View } from 'react-native';

import PlaceIcon from '@/assets/icons/place.svg';
import { palette } from '@/constants/colors';
import MoreMenu, { type MoreMenuItem } from './MoreMenu';
import Typography from './Typography';

const COLOR_GRAY = palette.gray[500];

type RankingProps = {
  number: number;
  location: string;
  count: number | string;
  /** 점수가 아닌 값(땅값 등)은 단위를 바꾸거나 빈 문자열로 뺀다. */
  unit?: string;
  avatar?: ReactNode;
  address?: string;
  menuItems?: MoreMenuItem[];
};

export default function Ranking({
  number,
  location,
  count,
  unit = '점',
  avatar,
  address,
  menuItems,
}: RankingProps) {
  return (
    <View className="w-full flex-row items-center justify-between gap-md px-md py-xl">
      <Typography variant="body1" className={number <= 3 ? 'text-primary-600' : 'text-gray-500'}>
        {number}
      </Typography>

      {avatar}

      <View className="flex-1 items-center gap-xs">
        <Typography variant="body1" className="text-gray-800">
          {location}
        </Typography>
        {address && (
          <View className="flex-row items-center gap-xs">
            <PlaceIcon width={12} height={12} color={COLOR_GRAY} />
            <Typography variant="body3" className="text-xs text-gray-500">
              {address}
            </Typography>
          </View>
        )}
      </View>

      <Typography variant="body1" className="text-primary-600">
        {count}
        {unit}
      </Typography>

      {menuItems?.length ? <MoreMenu items={menuItems} /> : null}
    </View>
  );
}
