import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import { useState } from 'react';
import { View } from 'react-native';

const SLIDES = [
  {
    id: '1',
    lines: [
      { text: '환영해요!', highlight: false },
      { text: '사용자님', highlight: true },
    ],
  },
  {
    id: '2',
    lines: [
      { text: '우리가 남긴', highlight: false },
      { text: '우리 동네를', highlight: true },
      { text: '살펴볼까요?', highlight: false },
    ],
  },
];

export default function Onboarding() {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      console.log('온보딩 완료');
    } else {
      setIndex(index + 1);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-1 justify-center items-center px-lg">
        {slide.lines.map((line, i) => (
          <Typography
            key={i}
            variant="display"
            className={line.highlight ? 'text-primary-600' : 'text-gray-800'}
          >
            {line.text}
          </Typography>
        ))}
      </View>

      <View className="gap-xl px-lg pb-4xl">
        <View className="flex-row gap-sm justify-center">
          {Array.from({ length: SLIDES.length }).map((_, i) => (
            <View
              key={i}
              className={`w-2 h-2 rounded-full ${i === index ? 'bg-primary-600' : 'bg-gray-300'}`}
            />
          ))}
        </View>
        <View className="w-full">
          <Button content={isLast ? '시작하기' : '다음'} onclick={handleNext} />
        </View>
      </View>
    </View>
  );
}
