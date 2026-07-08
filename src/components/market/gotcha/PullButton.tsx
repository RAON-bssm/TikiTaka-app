import { Pressable, View } from 'react-native';

import PointIcon from '@/assets/icons/point.svg';
import Typography from '@/components/ui/Typography';

// TODO: 팀 팔레트에 파란색(secondary) 토큰이 있으면 클래스로 교체하세요.
const BUTTON_BLUE = '#7D8FE0';

interface Props {
  label: string;
  cost: number;
  onPress: () => void;
}

/** 뽑기 버튼 — 위에 라벨, 아래에 코인 + 비용 알약 (시안의 파란 버튼). */
export default function PullButton({ label, cost, onPress }: Props) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View
          className={`items-center gap-xs rounded-2xl px-2xl py-md ${pressed ? 'opacity-70' : ''}`}
          style={{ backgroundColor: BUTTON_BLUE }}
        >
          <Typography variant="h4" className="text-white">
            {label}
          </Typography>
          <View className="flex-row items-center gap-xs rounded-full bg-white/90 px-md py-xs">
            <PointIcon width={16} height={16} />
            <Typography variant="body1" style={{ color: BUTTON_BLUE }}>
              {cost.toLocaleString()}
            </Typography>
          </View>
        </View>
      )}
    </Pressable>
  );
}
