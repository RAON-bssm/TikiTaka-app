import { Pressable, View } from 'react-native';

interface Props {
  onPress: () => void;
}

/** 촬영 버튼: 흰색 링 안에 오렌지 원. */
export default function ShutterButton({ onPress }: Props) {
  return (
    <Pressable onPress={onPress} hitSlop={12}>
      {({ pressed }) => (
        <View className="w-[70px] h-[70px] items-center justify-center rounded-full border-4 border-white">
          <View
            className={`w-[54px] h-[54px] rounded-full bg-primary-600 ${pressed ? 'opacity-70' : ''}`}
          />
        </View>
      )}
    </Pressable>
  );
}
