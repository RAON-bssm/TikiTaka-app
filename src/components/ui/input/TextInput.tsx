import { View } from 'react-native';
import Typography from '../Typography';

interface Props {
  label?: string;
  placeholder?: string;
}

const TextInput = ({ label, placeholder }: Props) => {
  return (
    <View className="flex flex-col gap-xs">
      <Typography variant="h3" className="text-gray-700">
        {label}
      </Typography>
      <input
        type="text"
        placeholder={placeholder}
        className="flex p-md rounded-sm border border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-500 font-sans text-sm focus:outline-none focus:border-primary-500"
      />
    </View>
  );
};
export default TextInput;
