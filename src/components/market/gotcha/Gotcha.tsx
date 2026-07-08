import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import Character from '@/components/character/Character';
import Typography from '@/components/ui/Typography';
import type { GotchaPull } from '@/constants/market';

interface Props {
  /** 현재 보여줄 뽑기 결과 */
  result: GotchaPull;
  /** 5회 뽑기 진행 표시 (예: 2 / 5). 1회 뽑기면 생략. */
  progress?: { current: number; total: number };
  /** 화면(공백 포함 아무 곳) 탭 시 호출 — 다음 결과로 넘기거나 마지막이면 닫는다. */
  onDismiss: () => void;
}

/**
 * 뽑기 결과 오버레이.
 * 화면 전체를 회색으로 딤 처리하고, 중앙에 흰 글로우 + 아이템을 착용한 캐릭터,
 * 그 위에 아이템 이름을 띄운다. 아무 곳이나 탭하면 사라진다.
 */
export default function Gotcha({ result, progress, onDismiss }: Props) {
  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* 오버레이 전체가 Pressable — 공백 어디를 눌러도 닫힌다 */}
      <Pressable className="flex-1 items-center justify-center bg-gray-400/50" onPress={onDismiss}>
        <View className="items-center justify-center">
          {/* 흰 글로우 — 반투명 원 3겹으로 라디얼 효과 */}
          <View className="absolute h-[340px] w-[340px] rounded-full bg-white/30" />
          <View className="absolute h-[260px] w-[260px] rounded-full bg-white/50" />
          <View className="absolute h-[190px] w-[190px] rounded-full bg-white/70" />

          <Animated.View entering={ZoomIn.springify()} className="items-center">
            {/* 아이템 이름 — 흰 글자 + 그림자로 캐릭터 위에 겹친다 */}
            <Text
              className="z-10 -mb-sm font-title text-xl text-white"
              style={{
                textShadowColor: 'rgba(0, 0, 0, 0.45)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 4,
              }}
            >
              {result.item.name}
            </Text>

            {/* 아이템을 착용한 캐릭터 */}
            <Character config={result.preview} size={230} />

            {/* 5회 뽑기일 때만 진행 표시 */}
            {progress ? (
              <Typography variant="body1" className="text-white">
                {progress.current} / {progress.total}
              </Typography>
            ) : null}
          </Animated.View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
