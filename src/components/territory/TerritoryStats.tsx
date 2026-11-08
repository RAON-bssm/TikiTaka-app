import { View } from 'react-native';

import Typography from '@/components/ui/Typography';

interface Props {
  /** 내 땅 화면처럼 방어 점수를 따로 크게 보여 주는 곳에서는 뺀다. */
  defenseScore?: number;
  landPrice: number;
  toll: number;
  className?: string;
}

export default function TerritoryStats({
  defenseScore,
  landPrice,
  toll,
  className = 'rounded-sm bg-gray-50',
}: Props) {
  return (
    <View className={`flex-row border border-gray-200 py-md ${className}`}>
      {defenseScore !== undefined && (
        <>
          <Stat label="방어 점수" value={defenseScore} highlight />
          <View className="w-[1px] bg-gray-200" />
        </>
      )}
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
