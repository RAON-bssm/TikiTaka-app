import CategoryTabs from '@/components/ui/CategoryTabs';
import Typography from '@/components/ui/Typography';
import { DEFAULT_CHARACTER_CONFIG, getPartMeta, type PartMeta } from '@/constants/character/assets';
import { CATEGORY_DEFS, type ColorOption, type ShapeOption } from '@/constants/character/customize';
import { CharacterConfig } from '@/constants/character/types';
import { useCharacterConfig } from '@/hooks/character/useCharacterConfig';
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
    <View className="relative items-center pb-md">
      <Image
        source={require('@/assets/character/footrest.webp')}
        contentFit="contain"
        style={{ position: 'absolute', bottom: 0, width: 100, aspectRatio: 400 / 74 }}
      />
      <Character config={config} size={160} className="-translate-x-[4px] translate-y-[4px]" />
    </View>
    <Pressable className="absolute bottom-0 right-0 items-center justify-center rounded-sm bg-primary-600/80 p-md">
      <Typography variant="h4" className="text-gray-50">
        수정하기
      </Typography>
    </Pressable>
  </View>
);

/** 카테고리 라벨 목록 (탭에 표시할 순서). */
const CATEGORY_LABELS = CATEGORY_DEFS.map((category) => category.label);

/** 색상 스와치 줄 (단색 원, 색상 축이 있는 파츠만) */
const ColorSwatches = ({
  colors,
  onSelect,
}: {
  colors: ColorOption[];
  onSelect: SelectHandler;
}) => (
  <View className="mb-md shrink-0 gap-sm">
    <Typography variant="body3" className="text-gray-400">
      색상
    </Typography>
    <View className="flex-row gap-sm">
      {colors.map((color) => (
        <Pressable
          key={color.id}
          onPress={() => onSelect(color.next)}
          style={{ backgroundColor: color.hex }}
          className={`h-[44px] w-[44px] rounded-full ${
            color.active ? 'border-2 border-primary-600' : ''
          }`}
        />
      ))}
    </View>
  </View>
);

const GRID_GAP = 8;
const MIN_ITEM_WIDTH = 100;

// bbox 주변에 남길 여유. 1.15 = 콘텐츠가 타일의 약 87%를 차지
const BBOX_PADDING = 1.15;
// 점처럼 작은 파츠가 과하게 확대되지 않도록 상한을 둔다
const MAX_SCALE = 3;

/** 파츠 썸네일. 메타(bbox)가 있으면 콘텐츠 영역을 타일 중앙에 확대해서 보여준다. */
const PartThumb = ({
  source,
  meta,
  size,
}: {
  source: number;
  meta: PartMeta | undefined;
  size: number;
}) => {
  // 메타가 없는 파츠는 확대 없이 원본 그대로 (폴백)
  if (!meta) {
    return <Image source={source} contentFit="contain" style={{ width: '100%', height: '100%' }} />;
  }

  const { bbox } = meta;
  const scale = Math.min(
    1 / (bbox.width * BBOX_PADDING),
    1 / (bbox.height * BBOX_PADDING),
    MAX_SCALE,
  );

  // bbox 중심을 타일 중심(0.5)으로 끌어오는 이동량을 픽셀로 환산
  const translateX = (0.5 - (bbox.x + bbox.width / 2)) * size;
  const translateY = (0.5 - (bbox.y + bbox.height / 2)) * size;

  return (
    <Image
      source={source}
      contentFit="contain"
      style={{
        width: '100%',
        height: '100%',
        // 배열 뒤쪽이 먼저 적용된다. scale을 앞에 둬야 translate가 확대 전 좌표 기준이 된다
        transform: [{ scale }, { translateX }, { translateY }],
      }}
    />
  );
};

const ShapeGrid = ({ shapes, onSelect }: { shapes: ShapeOption[]; onSelect: SelectHandler }) => {
  // 박스 너비를 측정해 열 수를 유동적으로 계산한다.
  // (작은 폰은 2칸, 보통 3칸, 큰 화면은 4칸+) — 남는 여백 없이 칸 크기를 딱 맞춘다.
  const [width, setWidth] = useState(0);
  const columns = Math.max(1, Math.floor((width + GRID_GAP) / (MIN_ITEM_WIDTH + GRID_GAP)));
  // 소수 폭은 픽셀 반올림 시 합이 컨테이너를 넘어 마지막 칸이 밀릴 수 있으므로 내림한다.
  const itemSize = Math.floor((width - GRID_GAP * (columns - 1)) / columns);

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      contentContainerClassName="flex-row flex-wrap"
      contentContainerStyle={{ gap: GRID_GAP }}
    >
      {width > 0 &&
        shapes.map((shape) => {
          const meta = getPartMeta(shape.source);
          return (
            <Pressable
              key={shape.id}
              onPress={() => onSelect(shape.next)}
              style={{ width: itemSize, height: itemSize }}
              // 밝은 파츠만 어두운 배경에 올린다. 메타가 없으면 밝은 배경으로 폴백
              className={`items-center justify-center overflow-hidden rounded-lg ${
                meta?.isDark === false ? 'bg-gray-700' : 'bg-gray-100'
              } ${shape.active ? 'border-2 border-primary-600' : ''}`}
            >
              {shape.source != null && (
                <PartThumb source={shape.source} meta={meta} size={itemSize} />
              )}
            </Pressable>
          );
        })}
    </ScrollView>
  );
};

/**
 * 캐릭터 꾸미기 편집기.
 *
 * config 상태를 소유하며 미리보기(상단)와 파츠 선택(하단)이 이를 공유한다.
 * 라우트 화면은 헤더 등 껍데기만 두고 이 컴포넌트를 배치하면 된다.
 */
export default function CharacterCustomizer({
  initialConfig = DEFAULT_CHARACTER_CONFIG,
}: {
  initialConfig?: CharacterConfig;
}) {
  // config는 훅이 소유하며, 변경 시마다 기기에 자동 저장되고 진입 시 저장값으로 복원된다.
  const { config, setConfig, isLoaded } = useCharacterConfig(initialConfig);
  const [selectedLabel, setSelectedLabel] = useState(CATEGORY_LABELS[0]);
  const category = CATEGORY_DEFS.find((c) => c.label === selectedLabel) ?? CATEGORY_DEFS[0];
  const shapes = category.buildShapes(config);
  const colors = category.buildColors?.(config);

  // 저장된 config를 불러오기 전에는 기본값이 잠깐 보이지 않도록 렌더를 보류한다.
  if (!isLoaded) {
    return <View className="flex-1" />;
  }

  return (
    <View className="flex-1 gap-2xl">
      <CharacterPreview config={config} />

      <View className="flex-1">
        <CategoryTabs tabs={CATEGORY_LABELS} selected={selectedLabel} onSelect={setSelectedLabel} />

        <View className="-mx-lg flex-1 rounded-t-md border-2 border-b-0 border-primary-600 bg-white p-lg">
          {colors && <ColorSwatches colors={colors} onSelect={setConfig} />}
          <ShapeGrid shapes={shapes} onSelect={setConfig} />
        </View>
      </View>
    </View>
  );
}
