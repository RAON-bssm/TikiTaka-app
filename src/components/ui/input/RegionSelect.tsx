import { CITIES, DISTRICTS } from '@/constants/regions';
import { View } from 'react-native';
import Dropdown from './Dropdown';

interface Props {
  label?: string;
  cityPlaceholder?: string;
  districtPlaceholder?: string;
  city?: string;
  district?: string;
  onCityChange?: (value: string) => void;
  onDistrictChange?: (value: string) => void;
}

// 시/도 · 구/군 드롭다운 한 쌍 (동네 선택)
export default function RegionSelect({
  label = '동네',
  cityPlaceholder = '시/도',
  districtPlaceholder = '구/군',
  city,
  district,
  onCityChange,
  onDistrictChange,
}: Props) {
  return (
    <View className="flex flex-row items-end gap-sm w-full">
      <View className="flex-1">
        <Dropdown
          label={label}
          placeholder={cityPlaceholder}
          options={CITIES}
          value={city}
          onChange={onCityChange}
        />
      </View>
      <View className="flex-1">
        <Dropdown
          placeholder={districtPlaceholder}
          options={DISTRICTS}
          value={district}
          onChange={onDistrictChange}
        />
      </View>
    </View>
  );
}
