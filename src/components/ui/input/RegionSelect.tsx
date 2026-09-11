import type { Location } from '@/types/location';
import { useState } from 'react';
import { View } from 'react-native';
import Dropdown from './Dropdown';

interface CityGroup {
  city: string;
  locations: Location[];
}

function groupLocationsByCity(locations: Location[]): CityGroup[] {
  const groups: CityGroup[] = [];

  for (const location of locations) {
    const group = groups.find((candidate) => candidate.city === location.city_name);

    if (group) {
      group.locations.push(location);
    } else {
      groups.push({ city: location.city_name, locations: [location] });
    }
  }

  return groups;
}

interface Props {
  locations: Location[];
  /** 선택된 동네의 `location_id`. 시/도만 고른 상태면 undefined. */
  value?: number;
  onChange?: (locationId: number | undefined) => void;
  label?: string;
  cityPlaceholder?: string;
  districtPlaceholder?: string;
}

export default function RegionSelect({
  locations,
  value,
  onChange,
  label = '동네',
  cityPlaceholder = '시/도',
  districtPlaceholder = '구/군',
}: Props) {
  const groups = groupLocationsByCity(locations);
  const [city, setCity] = useState<string>();
  const districts = groups.find((group) => group.city === city)?.locations ?? [];

  const handleCityChange = (nextCity: string) => {
    setCity(nextCity);
    // 이전 구/군은 다른 시/도 소속이므로 선택을 버린다.
    onChange?.(undefined);
  };

  const handleDistrictChange = (districtName: string) => {
    const district = districts.find((location) => location.location_name === districtName);
    onChange?.(district?.location_id);
  };

  return (
    <View className="flex flex-row items-end gap-sm w-full">
      <View className="flex-1">
        <Dropdown
          label={label}
          placeholder={cityPlaceholder}
          options={groups.map((group) => group.city)}
          value={city}
          onChange={handleCityChange}
        />
      </View>
      <View className="flex-1">
        {/* Dropdown이 선택값을 내부 state로 들고 있어 prop만 바꿔선 표시가 갱신되지 않는다.
            시/도가 바뀌면 remount 시켜 이전 구/군 이름이 남는 것을 막는다. */}
        <Dropdown
          key={city}
          placeholder={districtPlaceholder}
          options={districts.map((location) => location.location_name)}
          value={districts.find((location) => location.location_id === value)?.location_name}
          onChange={handleDistrictChange}
        />
      </View>
    </View>
  );
}
