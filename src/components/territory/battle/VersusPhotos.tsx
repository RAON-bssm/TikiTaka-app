import { Text, View } from 'react-native';

import { palette } from '@/constants/colors';
import BattlePhotoCard from './BattlePhotoCard';
import { TILT } from './tilt';

const BADGE_SHADOW = `0px 4px 12px ${palette.gray[800]}4D`;

interface Fighter {
  uri: string | undefined;
  name: string;
  score?: number | string;
}

interface Props {
  me: Fighter;
  rival: Fighter;
  /** 결과가 나왔을 때만 넘긴다. */
  winner?: 'me' | 'rival';
}

export default function VersusPhotos({ me, rival, winner }: Props) {
  return (
    <View className="flex-row gap-xl px-sm pt-md">
      <BattlePhotoCard
        {...me}
        tone="me"
        tilt="left"
        win={winner === 'me'}
        dimmed={winner === 'rival'}
      />
      <BattlePhotoCard
        {...rival}
        tone="rival"
        tilt="right"
        win={winner === 'rival'}
        dimmed={winner === 'me'}
      />
      {/* 아래 점수 줄 높이만큼 올려 사진 가운데에 맞춘다. */}
      <View pointerEvents="none" className="absolute inset-0 items-center justify-center pb-3xl">
        <View
          className="h-[56px] w-[56px] items-center justify-center rounded-full border-4 border-white bg-gray-800"
          style={[TILT.sticker, { boxShadow: BADGE_SHADOW }]}
        >
          <Text className="font-title text-xl text-white">VS</Text>
        </View>
      </View>
    </View>
  );
}
