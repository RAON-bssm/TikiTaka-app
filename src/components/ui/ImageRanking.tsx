// import LocationIcon from '@/assets/icons/location.svg';
import type { FC } from 'react';
import { Image, View } from 'react-native';
import Typography from './Typography';

type LocationHeaderProps = {
  number: number;
  location: string;
  address: string;
  count: number;
  imageUrl: string;
};

const LocationHeader: FC<LocationHeaderProps> = ({
  number,
  location,
  address,
  count,
  imageUrl,
}) => {
  return (
    <View className="flex-row items-center gap-md px-3 py-4 w-full">
      {/* 번호 (왼쪽) */}
      <Typography
        variant="body1"
        className={number === 1 ? 'w-8 text-primary-500' : 'w-8 text-gray-800'}
      >
        {number}
      </Typography>

      {/* 이미지 */}
      <Image source={{ uri: imageUrl }} resizeMode="cover" className="w-[45px] h-[50px] rounded" />

      {/* 텍스트 (중앙, flex-1) — ml-lg로 이미지와 간격 추가 */}
      <View className="flex-1 gap-md justify-center ml-lg items-center">
        <Typography variant="body1" className="font-semibold text-gray-800">
          {location}
        </Typography>
        <Typography variant="caption" className="text-gray-500">
          {address}
        </Typography>
      </View>

      {/* 점수 (오른쪽) */}
      <Typography
        variant="body1"
        className="text-primary-500 font-semibold text-right whitespace-nowrap"
      >
        {count}점
      </Typography>
    </View>
  );
};

export default LocationHeader;
