import { router, usePathname } from 'expo-router';
import { Pressable, View } from 'react-native';

import Typography from '@/components/ui/Typography';
import { SHOP_SECTIONS, type ShopSection } from '@/constants/market';

const SECTION_ROUTE = {
  상점: '/market',
  뽑기: '/market/gacha',
} as const satisfies Record<ShopSection, string>;

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
            // 비활성 탭도 투명 테두리를 둬 높이를 맞춘다
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
