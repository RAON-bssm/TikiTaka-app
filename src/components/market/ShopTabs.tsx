import { router, usePathname } from 'expo-router';
import { Pressable, View } from 'react-native';

import Typography from '@/components/ui/Typography';
import { SHOP_SECTIONS, type ShopSection } from '@/constants/market';

/** 섹션 → 라우트 경로. */
const SECTION_ROUTE = {
  상점: '/market',
  뽑기: '/market/gacha',
} as const satisfies Record<ShopSection, string>;

/**
 * 상점 상단 섹션 탭 (상점/뽑기) — 현재 경로로 활성 상태를 판단하고 라우트를 전환한다.
 * 밑줄 강조, 선택된 탭이 더 크게 표시된다.
 */
export default function ShopTabs() {
  const pathname = usePathname();

  return (
    <View className="flex-row items-center gap-sm">
      {SHOP_SECTIONS.map((label) => {
        const route = SECTION_ROUTE[label];
        const active = pathname === route;
        return (
          <Pressable
            key={label}
            onPress={() => router.replace(route)}
            // 선택 탭만 primary 밑줄. 비활성도 투명 테두리를 둬 높이를 맞춘다 (랭킹 탭과 동일한 강조)
            className={`items-center justify-center border-b-2 p-xs ${
              active ? 'border-primary-600' : 'border-transparent'
            }`}
          >
            <Typography variant={active ? 'h2' : 'body1'} className="text-gray-800">
              {label}
            </Typography>
          </Pressable>
        );
      })}
    </View>
  );
}
