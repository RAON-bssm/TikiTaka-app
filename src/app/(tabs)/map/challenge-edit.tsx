import { router, useLocalSearchParams } from 'expo-router';

import PhotoEditor from '@/components/camera/PhotoEditor';

/** `challenge-camera`가 넘긴 값을 그대로 받아, 편집한 사진으로 `purpose`별 확인 화면에 간다. */
type Params = {
  dongCode: string;
  purpose?: 'challenge' | 'setup' | 'retake';
  uri: string;
  lat?: string;
  lng?: string;
  adjective?: string;
  noun?: string;
  criteria?: string;
};

export default function ChallengeEditScreen() {
  const params = useLocalSearchParams<Params>();
  const purpose = params.purpose ?? 'challenge';

  const goToConfirm = (uri: string) => {
    if (purpose === 'challenge') {
      router.push({
        pathname: '/map/challenge-confirm',
        params: { dongCode: params.dongCode, uri, lat: params.lat, lng: params.lng },
      });
    } else {
      router.push({
        pathname: '/map/territory/defense-confirm',
        params: {
          dongCode: params.dongCode,
          purpose,
          uri,
          ...(params.adjective && { adjective: params.adjective }),
          ...(params.noun && { noun: params.noun }),
          ...(params.criteria && { criteria: params.criteria }),
        },
      });
    }
  };

  return <PhotoEditor uri={params.uri} onDone={goToConfirm} />;
}
