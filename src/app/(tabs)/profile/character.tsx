import Character from '@/components/character/Character';
import BackButton from '@/components/ui/BackButton';
import Header from '@/components/ui/header';
import Typography from '@/components/ui/Typography';
import {
  DEFAULT_CHARACTER_CONFIG,
  getColorOptions,
  getShapeOptions,
  resolveLayerSource,
} from '@/constants/character/assets';
import { CharacterConfig } from '@/constants/character/types';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

/** 그리드에 표시할 파츠 옵션 하나 (썸네일 이미지 + 선택 시 반영될 config) */
interface PartOption {
  id: string;
  source: number | undefined;
  active: boolean;
  next: CharacterConfig;
}

/** 카테고리 탭 정의. 현재 config를 받아 해당 파츠의 선택지들을 만든다. */
interface CategoryDef {
  label: string;
  build: (config: CharacterConfig) => PartOption[];
}

/**
 * 캐릭터 커스터마이징 카테고리.
 *
 * 각 옵션 썸네일은 실제 파츠 에셋(resolveLayerSource)을 그대로 렌더하고,
 * 선택하면 해당 파츠만 교체한 config로 상단 캐릭터가 다시 합성된다.
 */
const CATEGORY_DEFS: CategoryDef[] = [
  {
    label: '머리',
    build: (config) =>
      getShapeOptions('hairBack').map((shape) => ({
        id: shape,
        source: resolveLayerSource(
          { ...config, hairBack: shape },
          { group: 'hairBack', color: 'hairColor' },
        ),
        active: config.hairBack === shape,
        next: { ...config, hairBack: shape },
      })),
  },
  {
    label: '눈',
    build: (config) =>
      getColorOptions('eyes', config.eyes).map((color) => ({
        id: color,
        source: resolveLayerSource(
          { ...config, eyesColor: color },
          { group: 'eyes', color: 'eyesColor' },
        ),
        active: config.eyesColor === color,
        next: { ...config, eyesColor: color },
      })),
  },
  {
    label: '입',
    build: (config) =>
      getShapeOptions('mouth').map((shape) => ({
        id: shape,
        source: resolveLayerSource({ ...config, mouth: shape }, { group: 'mouth' }),
        active: config.mouth === shape,
        next: { ...config, mouth: shape },
      })),
  },
  {
    label: '코스튬',
    build: (config) =>
      getShapeOptions('clothing').map((shape) => ({
        id: shape,
        source: resolveLayerSource({ ...config, clothing: shape }, { group: 'clothing' }),
        active: config.clothing === shape,
        next: { ...config, clothing: shape },
      })),
  },
  {
    label: '몸',
    build: (config) =>
      getShapeOptions('body').map((shape) => ({
        id: shape,
        source: resolveLayerSource({ ...config, body: shape }, { group: 'body' }),
        active: config.body === shape,
        next: { ...config, body: shape },
      })),
  },
  {
    label: '악세서리',
    build: (config) =>
      getShapeOptions('accessory').map((shape) => ({
        id: shape,
        source: resolveLayerSource({ ...config, accessory: shape }, { group: 'accessory' }),
        active: config.accessory === shape,
        next: { ...config, accessory: shape },
      })),
  },
];

export default function CharacterScreen() {
  const [config, setConfig] = useState<CharacterConfig>(DEFAULT_CHARACTER_CONFIG);
  const [selected, setSelected] = useState(0);
  const options = CATEGORY_DEFS[selected].build(config);

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['top']}>
      <View className="flex flex-1 flex-col gap-2xl px-lg pt-lg">
        <Header />
        <BackButton title="캐릭터 꾸미기" />

        {/* 캐릭터 미리보기 (실제 캐릭터 컴포넌트로 합성) */}
        <View className="relative w-full items-center">
          <Character config={config} size={160} />
          <View className="-mt-md h-[24px] w-[180px] rounded-full bg-secondary-100" />
          <Pressable className="absolute bottom-0 right-0 items-center justify-center rounded-sm bg-primary-600/80 p-md">
            <Typography variant="h4" className="text-gray-100">
              수정하기
            </Typography>
          </Pressable>
        </View>

        {/* 카테고리 탭 + 파츠 그리드 */}
        <View className="flex-1">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-sm"
          >
            {CATEGORY_DEFS.map((category, index) => {
              const active = index === selected;
              return (
                <Pressable
                  key={category.label}
                  onPress={() => setSelected(index)}
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

          <View className="flex-1 rounded-md border-2 border-primary-600 bg-gray-50 p-lg">
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerClassName="flex-row flex-wrap gap-sm"
            >
              {options.map((option) => (
                <Pressable
                  key={option.id}
                  onPress={() => setConfig(option.next)}
                  className={`aspect-square basis-[30%] items-center justify-center overflow-hidden rounded-lg bg-gray-200 ${
                    option.active ? 'border-2 border-primary-600' : ''
                  }`}
                >
                  {option.source != null && (
                    <Image
                      source={option.source}
                      contentFit="contain"
                      style={{ width: '100%', height: '100%' }}
                    />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
