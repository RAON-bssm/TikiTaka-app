import { Pressable, Text, View } from 'react-native';

interface Props {
  content: string;
  onclick?: () => void;
  disabled?: boolean;
  tone?: 'me' | 'rival';
}

const TONE_CLASS = {
  me: { edge: 'bg-primary-800', face: 'bg-primary-600' },
  rival: { edge: 'bg-secondary-700', face: 'bg-secondary-500' },
} as const;

// 면이 아래 테두리(pb-xs = 4px) 위로 내려앉는다.
const PRESSED_STYLE = { transform: [{ translateY: 4 }] };

export default function BattleButton({ content, onclick, disabled = false, tone = 'me' }: Props) {
  const color = TONE_CLASS[tone];
  return (
    <View className={`rounded-md pb-xs ${disabled ? 'bg-gray-200' : color.edge}`}>
      <Pressable onPress={onclick} disabled={disabled} accessibilityRole="button">
        {({ pressed }) => (
          <View
            style={pressed ? PRESSED_STYLE : undefined}
            className={`items-center justify-center rounded-md px-lg py-lg ${
              disabled ? 'bg-gray-100' : color.face
            }`}
          >
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              className={`font-title text-xl ${disabled ? 'text-gray-400' : 'text-white'}`}
            >
              {content}
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}
