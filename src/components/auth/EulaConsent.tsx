import * as WebBrowser from 'expo-web-browser';
import { Pressable, View } from 'react-native';

import CheckIcon from '@/assets/icons/check.svg';
import Typography from '@/components/ui/Typography';
import { PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from '@/constants/legal';

interface Props {
  checked: boolean;
  onToggle: () => void;
}

export default function EulaConsent({ checked, onToggle }: Props) {
  return (
    <Pressable onPress={onToggle} className="flex-row items-center gap-sm active:opacity-70">
      {checked ? (
        <CheckIcon width={20} height={20} />
      ) : (
        <View className="h-lg w-lg rounded-xs border border-gray-300" />
      )}
      <Typography variant="body3" className="text-gray-700">
        <Typography
          variant="body3"
          className="text-primary-600 underline"
          onPress={() => WebBrowser.openBrowserAsync(TERMS_OF_SERVICE_URL)}
        >
          이용약관
        </Typography>
        {' 및 '}
        <Typography
          variant="body3"
          className="text-primary-600 underline"
          onPress={() => WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL)}
        >
          개인정보처리방침
        </Typography>
        {'에 동의합니다 (필수)'}
      </Typography>
    </Pressable>
  );
}
