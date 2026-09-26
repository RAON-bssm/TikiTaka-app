import CategoryTabs from '@/components/ui/CategoryTabs';
import { useToast } from '@/components/ui/Toast';
import Typography from '@/components/ui/Typography';
import { DEFAULT_CHARACTER_CONFIG, getPartMeta, type PartMeta } from '@/constants/character/assets';
import { CATEGORY_DEFS, type ColorOption, type ShapeOption } from '@/constants/character/customize';
import { CharacterConfig } from '@/constants/character/types';
import { PRODUCT_TYPE_TO_PART_KEY } from '@/constants/market';
import { useCharacterConfig } from '@/hooks/character/useCharacterConfig';
import { useEquipCharacter } from '@/hooks/equipment/useEquipCharacter';
import { useProducts } from '@/hooks/product/useProducts';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Character from './Character';

type SelectHandler = (config: CharacterConfig) => void;

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

const CATEGORY_LABELS = CATEGORY_DEFS.map((category) => category.label);

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

/** 메타(bbox)가 있으면 콘텐츠 영역을 타일 중앙에 확대해서 보여준다. */
const PartThumb = ({
  source,
  meta,
  size,
}: {
  source: number;
  meta: PartMeta | undefined;
  size: number;
}) => {
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

const ShapeGrid = ({
  shapes,
  onSelect,
  lockedIds,
  onPressLocked,
}: {
  shapes: ShapeOption[];
  onSelect: SelectHandler;
  lockedIds: Set<string>;
  onPressLocked: () => void;
}) => {
  // 측정한 너비로 열 수를 정하고 남는 여백 없이 칸 크기를 맞춘다.
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
          const locked = lockedIds.has(shape.id);
          return (
            <Pressable
              key={shape.id}
              onPress={() => (locked ? onPressLocked() : onSelect(shape.next))}
              style={{ width: itemSize, height: itemSize }}
              // 밝은 파츠만 어두운 배경에 올린다. 메타가 없으면 밝은 배경으로 폴백
              className={`items-center justify-center overflow-hidden rounded-lg ${
                meta?.isDark === false ? 'bg-gray-700' : 'bg-gray-100'
              } ${shape.active ? 'border-2 border-primary-600' : ''}`}
            >
              {shape.source != null && (
                <View className={`h-full w-full ${locked ? 'opacity-30' : ''}`}>
                  <PartThumb source={shape.source} meta={meta} size={itemSize} />
                </View>
              )}
              {locked && (
                <View className="absolute bottom-xs rounded-full bg-gray-800/70 px-sm py-xs">
                  <Typography variant="caption" className="text-white">
                    미보유
                  </Typography>
                </View>
              )}
            </Pressable>
          );
        })}
    </ScrollView>
  );
};

export default function CharacterCustomizer({
  initialConfig = DEFAULT_CHARACTER_CONFIG,
}: {
  initialConfig?: CharacterConfig;
}) {
  // config는 훅이 기기에 자동 저장하고 진입 시 복원한다.
  const { config, setConfig, isLoaded } = useCharacterConfig(initialConfig);
  const equipCharacter = useEquipCharacter();
  const { data: products } = useProducts();
  const { showToast } = useToast();
  const [selectedLabel, setSelectedLabel] = useState(CATEGORY_LABELS[0]);
  const category = CATEGORY_DEFS.find((c) => c.label === selectedLabel) ?? CATEGORY_DEFS[0];
  const shapes = category.buildShapes(config);
  const colors = category.buildColors?.(config);
  // 상점 목록은 서버가 보유 상품을 걸러 주므로, 여기 있는 파츠가 곧 아직 안 산 파츠다.
  // 기본 파츠는 상품이 아니라 목록에 없어 잠기지 않는다. 목록을 못 받으면 잠그지 않는다.
  const lockedIds = new Set(
    (products ?? [])
      .filter((product) => PRODUCT_TYPE_TO_PART_KEY[product.product_type] === category.group)
      .map((product) => product.product_name),
  );

  const handleSelect = (next: CharacterConfig) => {
    setConfig(next);
    void equipCharacter(next);
  };

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
          {colors && <ColorSwatches colors={colors} onSelect={handleSelect} />}
          <ShapeGrid
            shapes={shapes}
            onSelect={handleSelect}
            lockedIds={lockedIds}
            onPressLocked={() => showToast('상점에서 구매하면 입을 수 있어요')}
          />
        </View>
      </View>
    </View>
  );
}
