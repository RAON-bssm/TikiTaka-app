import { useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import Typography from '../Typography';

interface Props {
  label?: string;
  placeholder?: string;
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
}

const Dropdown = ({ label, placeholder, options, value, onChange }: Props) => {
  const [selectedValue, setSelectedValue] = useState(value || '');
  return (
    <View className="flex flex-col gap-xs w-full">
      <Typography variant="h3" className="text-gray-700">
        {label}
      </Typography>
      <Pressable className="flex flex-row items-center justify-between gap-auto w-full p-md rounded-sm border border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-500 font-sans text-sm focus:outline-none focus:border-primary-500">
        {selectedValue ? (
          <Typography variant="body2" className="text-gray-900">
            {selectedValue}
          </Typography>
        ) : (
          <Typography variant="body2" className="text-gray-500">
            {placeholder}
          </Typography>
        )}
        <Image
          source={require('@/assets/icons/chevron-down.svg')}
          style={{ width: 16, height: 16, resizeMode: 'contain' }}
        />
      </Pressable>
    </View>
  );
};
export default Dropdown;
