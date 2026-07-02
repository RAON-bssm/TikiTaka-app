import InfoIcon from '@/assets/icons/info.svg';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import Button from '../ui/Button';
import Typography from '../ui/Typography';

const GRADIENT_COLORS = ['#FFFFFF', '#FFD5BE'] as const;

interface Props {
  score: number;
  onCheck?: () => void;
}

export default function AiScoreCheckCard({ score, onCheck }: Props) {
  return (
    <View className="relative overflow-hidden rounded-md p-lg">
      <LinearGradient
        colors={GRADIENT_COLORS}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View className="items-center justify-center p-2xl">
        <View className="items-center gap-sm">
          <Typography
            variant="display"
            className="text-primary-600 text-[64px] leading-[72px] font-bold"
          >
            {score}
          </Typography>
          <Button content="AI 점수 확인하기" size="sm" onclick={onCheck} />
        </View>
      </View>
      <View className="absolute right-sm top-sm">
        <InfoIcon width={24} height={24} color="#C4CCDA" />
      </View>
    </View>
  );
}
