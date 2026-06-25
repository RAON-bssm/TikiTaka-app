import { useRef, useState } from 'react';
import { Image, Modal, Pressable, View } from 'react-native';
import Typography from '../Typography';

interface Props {
  label?: string;
  placeholder?: string;
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
}

export default function Dropdown({ label, placeholder, options, value, onChange }: Props) {
  const [selectedValue, setSelectedValue] = useState<string>(value || '');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [triggerLayout, setTriggerLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const triggerRef = useRef<View>(null);

  const onSelectOption = (option: string) => {
    setSelectedValue(option);
    onChange?.(option);
    setIsOpen(false);
  };

  const openDropdown = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setTriggerLayout({ x, y, width, height });
      setIsOpen(true);
    });
  };

  return (
    <View className="flex flex-col gap-xs w-full">
      <Typography variant="h3" className="text-gray-700">
        {label}
      </Typography>
      <Pressable
        ref={triggerRef}
        onPress={openDropdown}
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

      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          onPress={() => setIsOpen(false)}
          style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
        />

        <View
          style={{
            position: 'absolute',
            top: triggerLayout.y + triggerLayout.height + 4,
            left: triggerLayout.x,
            width: triggerLayout.width,
          }}
          className="flex flex-col gap-sm bg-white rounded-sm border border-gray-300 p-sm"
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
      </Modal>
    </View>
  );
}
