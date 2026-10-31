import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { type LayoutChangeEvent, Pressable, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  type SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import Typography from '@/components/ui/Typography';
import { type Interaction, MAX_TILT } from '@/hooks/camera/usePhotoEditor';

const TICK_GAP = 8;
const RULER_HEIGHT = 20;
const FADE_WIDTH = 48;
const SNAP_RANGE = 1;
const TICKS = Array.from({ length: MAX_TILT * 2 + 1 }, (_, index) => index - MAX_TILT);
const FADE_COLORS = ['white', 'rgba(255, 255, 255, 0)'] as const;

interface Props {
  tilt: SharedValue<number>;
  interaction: Interaction;
}

const Tick = ({ degree }: { degree: number }) => {
  const isMajor = degree % 15 === 0;
  const isMid = degree % 5 === 0;
  const height = isMajor ? 18 : isMid ? 12 : 6;
  return (
    <View
      className={`absolute w-[2px] rounded-full ${
        isMajor ? 'bg-gray-500' : isMid ? 'bg-gray-400' : 'bg-gray-200'
      }`}
      style={{
        left: (degree + MAX_TILT) * TICK_GAP - 1,
        top: (RULER_HEIGHT - height) / 2,
        height,
      }}
    />
  );
};

export default function StraightenDial({ tilt, interaction }: Props) {
  const [width, setWidth] = useState(0);
  const [label, setLabel] = useState(0);

  useAnimatedReaction(
    () => Math.round(tilt.get()),
    (current, previous) => {
      if (current !== previous) runOnJS(setLabel)(current);
    },
  );

  const pan = Gesture.Pan()
    .onBegin(interaction.begin)
    .onChange((event) => {
      const next = tilt.get() - event.changeX / TICK_GAP;
      tilt.set(Math.min(Math.max(next, -MAX_TILT), MAX_TILT));
    })
    .onEnd(() => {
      if (Math.abs(tilt.get()) < SNAP_RANGE) tilt.set(withTiming(0, { duration: 150 }));
    })
    .onFinalize(interaction.end);

  const rulerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -tilt.get() * TICK_GAP }],
  }));

  const handleLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);

  return (
    <View className="gap-md">
      <View className="flex-row items-center justify-between">
        <Typography variant="h4" className="text-gray-700">
          기울기
        </Typography>
        <Pressable
          onPress={() => tilt.set(withTiming(0, { duration: 200 }))}
          disabled={label === 0}
          hitSlop={8}
          className={`min-w-[52px] items-center rounded-full px-md py-xs ${
            label === 0 ? 'bg-gray-50' : 'bg-primary-100'
          }`}
        >
          <Typography variant="h4" className={label === 0 ? 'text-gray-400' : 'text-primary-600'}>
            {label > 0 ? `+${label}°` : `${label}°`}
          </Typography>
        </Pressable>
      </View>

      <GestureDetector gesture={pan}>
        <View className="h-[36px] justify-center overflow-hidden" onLayout={handleLayout}>
          {width > 0 && (
            <Animated.View
              className="absolute"
              style={[
                {
                  left: width / 2 - MAX_TILT * TICK_GAP,
                  width: MAX_TILT * 2 * TICK_GAP + 1,
                  height: RULER_HEIGHT,
                },
                rulerStyle,
              ]}
            >
              {TICKS.map((degree) => (
                <Tick key={degree} degree={degree} />
              ))}
            </Animated.View>
          )}
          <LinearGradient
            pointerEvents="none"
            colors={FADE_COLORS}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: FADE_WIDTH }}
          />
          <LinearGradient
            pointerEvents="none"
            colors={FADE_COLORS}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 0 }}
            style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: FADE_WIDTH }}
          />
          <View pointerEvents="none" className="items-center self-center">
            <View className="h-[8px] w-[8px] rounded-full bg-primary-600" />
            <View className="h-[28px] w-[3px] rounded-full bg-primary-600" />
          </View>
        </View>
      </GestureDetector>
    </View>
  );
}
