import { TextInput as RNTextInput, View } from 'react-native';
import Typography from '../Typography';

interface Props {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
}

export default function TextInput({ label, placeholder, value, onChangeText }: Props) {
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
        placeholderTextColor="#9DAABB"
        className="w-full p-md rounded-sm border border-gray-200 bg-white font-sans text-sm text-gray-800 focus:border-primary-500"
      />
    </View>
  );
}
