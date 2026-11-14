import { type DimensionValue, Image, Text, View } from 'react-native';

import Typography from '@/components/ui/Typography';
import { palette } from '@/constants/colors';
import { TILT } from './tilt';

const CARD_SHADOW = `0px 8px 20px ${palette.gray[800]}33`;
const PHOTO_ASPECT_RATIO = 3 / 4;

const TONE_CLASS = {
  me: { band: 'bg-primary-600', score: 'text-primary-600' },
  rival: { band: 'bg-secondary-500', score: 'text-secondary-500' },
} as const;

interface Props {
  uri: string | undefined;
  name: string;
  tone: 'me' | 'rival';
  /** 아직 채점 전이면 '?'처럼 문자열을 넘긴다. */
  score?: number | string;
  tilt?: 'left' | 'right' | 'none';
  /** 한 장만 보여 줄 때 폭. 없으면 flex-1로 옆 카드와 나눈다. */
  width?: DimensionValue;
  win?: boolean;
  dimmed?: boolean;
}

export default function BattlePhotoCard({
  uri,
  name,
  tone,
  score,
  tilt = 'none',
  win = false,
  dimmed = false,
  width,
}: Props) {
  const color = TONE_CLASS[tone];
  return (
    <View
      className={width === undefined ? 'flex-1' : 'self-center'}
      style={[TILT[tilt], width !== undefined && { width }]}
    >
      <View
        className="w-full overflow-hidden rounded-md border-4 border-white bg-gray-200"
        style={{ aspectRatio: PHOTO_ASPECT_RATIO, boxShadow: CARD_SHADOW }}
      >
        {uri ? (
          <Image source={{ uri }} resizeMode="cover" className="h-full w-full" />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="font-title text-3xl text-gray-400">?</Text>
          </View>
        )}
        {dimmed && <View className="absolute inset-0 bg-white/50" />}
        <View className={`absolute bottom-0 left-0 right-0 px-sm py-xs ${color.band}`}>
          <Typography variant="h4" numberOfLines={1} className="text-center text-white">
            {name}
          </Typography>
        </View>
      </View>
      {win && (
        <View
          className="absolute -top-md self-center rounded-full border-2 border-white bg-gray-800 px-md py-xs"
          style={TILT.sticker}
        >
          <Text className="font-title text-md text-white">WIN</Text>
        </View>
      )}
      {score !== undefined && (
        <Text
          className={`mt-sm text-center font-title text-3xl ${dimmed ? 'text-gray-300' : color.score}`}
        >
          {score}
        </Text>
      )}
    </View>
  );
}
