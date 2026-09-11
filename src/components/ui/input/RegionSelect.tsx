import type { Location } from '@/types/location';
import { useState } from 'react';
import { View } from 'react-native';
import Dropdown from './Dropdown';

interface CityGroup {
  city: string;
  locations: Location[];
}

/**
 * 서버 동네 목록을 시/도로 묶는다. 시/도 순서는 목록에 처음 나온 순서를 따른다.
 *
 * 시/도는 서버가 `city_name`으로 함께 내려주므로 프론트에 매핑을 두지 않는다.
 * (두면 서버가 동네를 추가할 때마다 어긋난다)
 */
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
  /** 선택 가능한 동네 목록(서버 `GET /api/location`). */
  locations: Location[];
  /** 선택된 동네의 `location_id`. 시/도만 고른 상태면 undefined. */
  value?: number;
  onChange?: (locationId: number | undefined) => void;
  label?: string;
  cityPlaceholder?: string;
  districtPlaceholder?: string;
}

// 시/도 · 구/군 드롭다운 한 쌍 (동네 선택)
export default function RegionSelect({
  locations,
  value,
  onChange,
  label = '동네',
  cityPlaceholder = '시/도',
  districtPlaceholder = '구/군',
}: Props) {
  const groups = groupLocationsByCity(locations);
  // 시/도는 구/군 선택지를 좁히기 위한 화면 상태다. 서버로 나가는 값은 location_id 하나뿐이라
  // 바깥에 알릴 이유가 없어 이 컴포넌트가 들고 있는다.
  const [city, setCity] = useState<string>();
  const districts = groups.find((group) => group.city === city)?.locations ?? [];

  const handleCityChange = (nextCity: string) => {
    setCity(nextCity);
    // 시/도를 바꾸면 이전 구/군은 다른 시/도 소속이므로 선택을 버린다.
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
        {/* Dropdown이 선택값을 내부 state로 들고 있어 prop만 바꿔도 표시가 갱신되지 않는다.
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
