import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import Character from '@/components/character/Character';
import Typography from '@/components/ui/Typography';
import type { GotchaPull } from '@/constants/market';

// RN Text에는 text-stroke가 없어, 같은 글자를 4방향으로 1px씩 밀어 겹쳐 외곽선처럼 보이게 한다.
const OUTLINE_OFFSETS = [
  { width: 0, height: -1 },
  { width: 0, height: 1 },
  { width: -1, height: 0 },
  { width: 1, height: 0 },
] as const;

/** 밝은 글로우 위에서도 이름이 보이도록 외곽선을 두른다. */
function OutlinedItemName({ name }: { name: string }) {
  return (
    <View className="z-10 -mb-sm">
      {OUTLINE_OFFSETS.map((offset, i) => (
        <Text
          key={i}
          aria-hidden
          className="absolute font-title text-xl text-gray-800"
          style={{ transform: [{ translateX: offset.width }, { translateY: offset.height }] }}
        >
          {name}
        </Text>
      ))}
      <Text className="font-title text-xl text-white">{name}</Text>
    </View>
  );
}

interface Props {
  result: GotchaPull;
  /** 5회 뽑기 진행 표시. 1회 뽑기면 생략. */
  progress?: { current: number; total: number };
  /** 아무 곳이나 탭하면 호출. 다음 결과로 넘기거나 마지막이면 닫는다. */
  onDismiss: () => void;
}

export default function Gotcha({ result, progress, onDismiss }: Props) {
  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <Pressable className="flex-1 items-center justify-center bg-gray-400/50" onPress={onDismiss}>
        <View className="items-center justify-center">
          {/* 반투명 원 3겹으로 라디얼 글로우를 흉내 낸다 */}
          <View className="absolute h-[340px] w-[340px] rounded-full bg-white/30" />
          <View className="absolute h-[260px] w-[260px] rounded-full bg-white/50" />
          <View className="absolute h-[190px] w-[190px] rounded-full bg-white/70" />

          <Animated.View entering={ZoomIn.springify()} className="items-center">
            <OutlinedItemName name={result.item.name} />

            <Character config={result.preview} size={230} />

            {progress ? (
              <Typography variant="body1" className="text-gray-500">
                {progress.current} / {progress.total}
              </Typography>
            ) : null}
          </Animated.View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
