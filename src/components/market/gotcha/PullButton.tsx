import { Pressable, View } from 'react-native';

import PointIcon from '@/assets/icons/point.svg';
import Typography from '@/components/ui/Typography';

interface Props {
  label: string;
  cost: number;
  disabled?: boolean;
  /** 포인트가 부족할 때. 누를 수는 있게 두고(부족한 포인트를 알려 준다) 흐리게만 보인다. */
  dimmed?: boolean;
  onPress: () => void;
}

export default function PullButton({ label, cost, disabled, dimmed, onPress }: Props) {
  return (
    <Pressable onPress={onPress} disabled={disabled}>
      {({ pressed }) => (
        <View
          className={`items-center gap-xs rounded-2xl px-2xl py-md ${pressed || disabled || dimmed ? 'opacity-70' : ''} bg-secondary-600`}
        >
          <Typography variant="h4" className="text-white">
            {label}
          </Typography>
          <View className="flex-row items-center gap-xs rounded-full bg-white/90 px-md py-xs">
            <PointIcon width={16} height={16} />
            <Typography variant="body1" className="text-secondary-600">
              {cost.toLocaleString()}
            </Typography>
          </View>
        </View>
      )}
    </Pressable>
  );
}
