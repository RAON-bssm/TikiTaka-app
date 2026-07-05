import type { FC } from 'react';
import { View } from 'react-native';
import Typography from './Typography';

type LocationHeaderProps = {
  number: number;
  location: string;
  count: number;
};

const LocationHeader: FC<LocationHeaderProps> = ({ number, location, count }) => {
  return (
    <View className="flex-row items-center gap-md px-3 py-4 w-full">
      {/* 번호 (왼쪽) */}
      <Typography
        variant="body1"
        className={number === 1 ? 'w-8 text-primary-500' : 'w-8 text-gray-800'}
      >
        {number}
      </Typography>
      {/* 위치명 (중앙) */}
      <Typography variant="body1" className="flex-1 text-gray-800 items-center">
        {location}
      </Typography>
      {/* 점수 (오른쪽) */}
      <Typography variant="body1" className="text-primary-500 font-semibold w-16 text-right">
        {count}점
      </Typography>
    </View>
  );
};

export default LocationHeader;
