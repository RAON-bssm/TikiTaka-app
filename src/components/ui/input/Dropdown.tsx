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
  const [selectedValue, setSelectedValue] = useState<string>(value || '');
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const onSelectOption = (option: string) => {
    setSelectedValue(option);
    setIsOpen(false);
  };
  return (
    <View className="flex flex-col gap-xs w-full relative z-10">
      <Typography variant="h3" className="text-gray-700">
        {label}
      </Typography>
      <Pressable
        onPress={() => setIsOpen(!isOpen)}
        className="flex flex-row items-center justify-between gap-auto w-full p-md rounded-sm border border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-500 font-sans text-sm focus:outline-none focus:border-primary-500"
      >
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

      {isOpen && (
        <View
          className="absolute gap-sm top-full left-0 right-0 mt-xs flex flex-col bg-white rounded-sm
         border border-gray-300 p-sm z-20"
        >
          {options.map((option, idx) => (
            <Pressable
              key={idx}
              onPress={() => onSelectOption(option)}
              className="bg-white p-sm rounded-md w-full"
            >
              <Typography variant="body2" className="text-gray-900">
                {option}
              </Typography>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};
export default Dropdown;
