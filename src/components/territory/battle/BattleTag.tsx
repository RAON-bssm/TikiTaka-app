import { Text, View } from 'react-native';

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
      {/* Typography는 font-bold를 깔아 font-title과 충돌하므로 제목 폰트는 Text로 쓴다(Topic과 같다). */}
      <Text className="font-title text-md text-white">{label}</Text>
    </View>
  );
}
