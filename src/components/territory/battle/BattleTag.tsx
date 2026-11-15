import { View } from 'react-native';

import Typography from '@/components/ui/Typography';
import { TILT } from './tilt';

export type BattleTone = 'me' | 'rival' | 'neutral';

const TONE_BG: Record<BattleTone, string> = {
  me: 'bg-primary-600',
  rival: 'bg-secondary-500',
  neutral: 'bg-gray-700',
};

interface Props {
  label: string;
  tone?: BattleTone;
}

export default function BattleTag({ label, tone = 'me' }: Props) {
  return (
    <View className={`self-start rounded-sm px-md py-xs ${TONE_BG[tone]}`} style={TILT.left}>
      <Typography variant="title3" className="text-white">
        {label}
      </Typography>
    </View>
  );
}
