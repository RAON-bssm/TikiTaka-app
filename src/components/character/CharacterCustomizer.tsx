import Typography from '@/components/ui/Typography';
import { DEFAULT_CHARACTER_CONFIG } from '@/constants/character/assets';
import {
  CATEGORY_DEFS,
  COLOR_HEX,
  type ColorOption,
  type ShapeOption,
} from '@/constants/character/customize';
import { CharacterConfig } from '@/constants/character/types';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Character from './Character';

/** 선택 시 교체된 config를 상위로 올려주는 핸들러 */
type SelectHandler = (config: CharacterConfig) => void;

/** 캐릭터 미리보기 (실제 캐릭터 컴포넌트로 합성) */
const CharacterPreview = ({ config }: { config: CharacterConfig }) => (
  <View className="relative w-full items-center">
    <Character config={config} size={160} />
    <View className="-mt-md h-[24px] w-[180px] rounded-full bg-secondary-100" />
    <Pressable className="absolute bottom-0 right-0 items-center justify-center rounded-sm bg-primary-600/80 p-md">
      <Typography variant="h4" className="text-gray-100">
        수정하기
      </Typography>
    </Pressable>
  </View>
);

/** 카테고리 탭 줄 (가로 스크롤) */
const CategoryTabs = ({
  selectedIndex,
  onSelect,
}: {
  selectedIndex: number;
  onSelect: (index: number) => void;
}) => (
  // 탭 줄은 내용 높이만 차지하고, 남는 높이는 아래 카드가 모두 채운다
  <View className="shrink-0">
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-sm"
    >
      {CATEGORY_DEFS.map((category, index) => {
        const active = index === selectedIndex;
        return (
          <Pressable
            key={category.label}
            onPress={() => onSelect(index)}
            className={`w-[60px] items-center rounded-t-lg py-sm ${
              active ? 'bg-primary-600' : 'bg-secondary-100'
            }`}
          >
            <Typography
              variant={active ? 'h4' : 'body3'}
              className={active ? 'text-gray-50' : 'text-primary-600'}
            >
              {category.label}
            </Typography>
          </Pressable>
        );
      })}
    </ScrollView>
  </View>
);

/** 색상 스와치 줄 (단색 원, 색상 축이 있는 파츠만) */
const ColorSwatches = ({
  colors,
  onSelect,
}: {
  colors: ColorOption[];
  onSelect: SelectHandler;
}) => (
  <View className="mb-md shrink-0 gap-sm">
    <Typography variant="body3" className="text-gray-500">
      색상
    </Typography>
    <View className="flex-row gap-sm">
      {colors.map((color) => (
        <Pressable
          key={color.id}
          onPress={() => onSelect(color.next)}
          style={{ backgroundColor: COLOR_HEX[color.id] ?? '#DDE2EC' }}
          className={`h-[44px] w-[44px] rounded-full ${
            color.active ? 'border-2 border-primary-600' : ''
          }`}
        />
      ))}
    </View>
  </View>
);

/** 모양 선택 그리드 (실제 파츠 에셋 썸네일) */
const ShapeGrid = ({ shapes, onSelect }: { shapes: ShapeOption[]; onSelect: SelectHandler }) => (
  <ScrollView
    className="flex-1"
    showsVerticalScrollIndicator={false}
    contentContainerClassName="flex-row flex-wrap gap-sm"
  >
    {shapes.map((shape) => (
      <Pressable
        key={shape.id}
        onPress={() => onSelect(shape.next)}
        className={`aspect-square basis-[30%] items-center justify-center overflow-hidden rounded-lg bg-gray-200 ${
          shape.active ? 'border-2 border-primary-600' : ''
        }`}
      >
        {shape.source != null && (
          <Image
            source={shape.source}
            contentFit="contain"
            style={{ width: '100%', height: '100%' }}
          />
        )}
      </Pressable>
    ))}
  </ScrollView>
);

/**
 * 캐릭터 꾸미기 편집기.
 *
 * config 상태를 소유하며 미리보기(상단)와 파츠 선택(하단)이 이를 공유한다.
 * 라우트 화면은 헤더 등 껍데기만 두고 이 컴포넌트를 배치하면 된다.
 */
export default function CharacterCustomizer() {
  const [config, setConfig] = useState<CharacterConfig>(DEFAULT_CHARACTER_CONFIG);
  const [selected, setSelected] = useState(0);
  const category = CATEGORY_DEFS[selected];
  const shapes = category.buildShapes(config);
  const colors = category.buildColors?.(config);

  return (
    <View className="flex-1 gap-2xl">
      <CharacterPreview config={config} />

      {/* 카테고리 탭 + 파츠 그리드 */}
      <View className="flex-1">
        <CategoryTabs selectedIndex={selected} onSelect={setSelected} />

        <View className="flex-1 rounded-md border-2 border-primary-600 bg-gray-50 p-lg">
          {colors && <ColorSwatches colors={colors} onSelect={setConfig} />}
          <ShapeGrid shapes={shapes} onSelect={setConfig} />
        </View>
      </View>
    </View>
  );
}
