import { Pressable, View } from 'react-native';

import PointIcon from '@/assets/icons/point.svg';
import Typography from '@/components/ui/Typography';

interface Props {
  label: string;
  /** 상품 목록에서 뽑기권 가격을 못 읽으면 undefined. 이때는 누를 수 없다. */
  cost?: number;
  disabled?: boolean;
  onPress: () => void;
}

export default function PullButton({ label, cost, disabled, onPress }: Props) {
  const isDisabled = disabled || cost === undefined;

  return (
    <Pressable onPress={onPress} disabled={isDisabled}>
      {({ pressed }) => (
        <View
          className={`items-center gap-xs rounded-2xl px-2xl py-md ${pressed || isDisabled ? 'opacity-70' : ''} bg-secondary-600`}
        >
          <Typography variant="h4" className="text-white">
            {label}
          </Typography>
          <View className="flex-row items-center gap-xs rounded-full bg-white/90 px-md py-xs">
            <PointIcon width={16} height={16} />
            <Typography variant="body1" className="text-secondary-600">
              {cost?.toLocaleString() ?? '-'}
            </Typography>
          </View>
        </View>
      )}
    </Pressable>
  );
}
