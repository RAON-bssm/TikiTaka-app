import ChevronDownIcon from '@/assets/icons/chevron-down.svg';
import { useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import Typography from '../Typography';

const LIST_GAP = 4;
const LIST_MAX_HEIGHT = 280;
const SCREEN_MARGIN = 48;

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
  const { height: windowHeight } = useWindowDimensions();

  // 선택지가 많으면 화면 밖으로 넘치므로, 남은 공간이 더 넓은 쪽으로 펼치고 그 안에서 스크롤한다.
  const triggerBottom = triggerLayout.y + triggerLayout.height + LIST_GAP;
  const spaceBelow = windowHeight - triggerBottom - SCREEN_MARGIN;
  const spaceAbove = triggerLayout.y - LIST_GAP - SCREEN_MARGIN;
  const opensUp = spaceBelow < LIST_MAX_HEIGHT && spaceAbove > spaceBelow;
  const listMaxHeight = Math.min(LIST_MAX_HEIGHT, opensUp ? spaceAbove : spaceBelow);

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
      <Typography variant="h3" className="text-gray-600">
        {label}
      </Typography>
      <Pressable
        ref={triggerRef}
        onPress={openDropdown}
        className="flex flex-row items-center justify-between gap-auto w-full p-md rounded-sm border border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 font-sans text-sm focus:outline-none focus:border-gray-500"
      >
        {selectedValue ? (
          <Typography variant="body2" className="text-gray-800">
            {selectedValue}
          </Typography>
        ) : (
          <Typography variant="body2" className="text-gray-400">
            {placeholder}
          </Typography>
        )}
        <ChevronDownIcon width={16} height={16} />
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

        <ScrollView
          style={{
            position: 'absolute',
            ...(opensUp
              ? { bottom: windowHeight - triggerLayout.y + LIST_GAP }
              : { top: triggerBottom }),
            left: triggerLayout.x,
            width: triggerLayout.width,
            maxHeight: listMaxHeight,
          }}
          className="bg-white rounded-sm border border-gray-200"
          contentContainerClassName="flex flex-col gap-sm p-sm"
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          {options.map((option, idx) => (
            <Pressable
              key={idx}
              onPress={() => onSelectOption(option)}
              className="bg-white p-sm rounded-md w-full"
            >
              <Typography variant="body2" className="text-gray-800">
                {option}
              </Typography>
            </Pressable>
          ))}
        </ScrollView>
      </Modal>
    </View>
  );
}
