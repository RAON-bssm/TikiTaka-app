import { TextInput as RNTextInput, View, type TextInputProps } from 'react-native';
import Typography from '../Typography';

interface Props {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  /** 입력값을 그대로 비교해야 할 때(닉네임 확인 등) 자동 대문자·자동 수정을 끈다. */
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoCorrect?: boolean;
}

export default function TextInput({
  label,
  placeholder,
  value,
  onChangeText,
  autoCapitalize,
  autoCorrect,
}: Props) {
  return (
    <View className="flex flex-col gap-xs w-full">
      {label ? (
        <Typography variant="h3" className="text-gray-600">
          {label}
        </Typography>
      ) : null}
      <RNTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        placeholderTextColor="#9DAABB"
        className="w-full p-md rounded-sm border border-gray-200 bg-white font-sans text-sm text-gray-800 focus:border-primary-500"
      />
    </View>
  );
}
