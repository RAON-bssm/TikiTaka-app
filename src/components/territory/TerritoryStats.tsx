import { View } from 'react-native';

import Typography from '@/components/ui/Typography';

interface Props {
  defenseScore: number;
  landPrice: number;
  toll: number;
}

export default function TerritoryStats({ defenseScore, landPrice, toll }: Props) {
  return (
    <View className="flex-row rounded-sm border border-gray-200 bg-gray-50 py-md">
      <Stat label="방어 점수" value={defenseScore} highlight />
      <View className="w-[1px] bg-gray-200" />
      <Stat label="땅값" value={landPrice} />
      <View className="w-[1px] bg-gray-200" />
      <Stat label="통행료" value={toll} />
    </View>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <View className="flex-1 items-center gap-sm">
      <Typography variant="caption" className="text-gray-400">
        {label}
      </Typography>
      <Typography variant="h2" className={highlight ? 'text-primary-600' : 'text-gray-600'}>
        {value.toLocaleString()}
      </Typography>
    </View>
  );
}
