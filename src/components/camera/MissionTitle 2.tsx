import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  title: string;
}

/** 상단 미션 타이틀 + 오렌지 그라데이션 오버레이. */
export default function MissionTitle({ title }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="none" className="absolute left-0 right-0 top-0">
      <LinearGradient
        colors={['#FF7F3A', 'rgba(255, 127, 58, 0)']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 140 }}
      />
      <View className="items-center" style={{ paddingTop: insets.top + 12 }}>
        <Text className="font-title text-xl text-white">{title}</Text>
      </View>
    </View>
  );
}
