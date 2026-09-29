import * as SecureStore from 'expo-secure-store';

import { toPartId } from '@/constants/character/legacyIds';
import type { CharacterConfig } from '@/constants/character/types';

const CHARACTER_CONFIG_KEY = 'characterConfig';

/** 없거나 손상된 값이면 null(→ 기본값 사용). */
export async function getSavedCharacter(): Promise<CharacterConfig | null> {
  const raw = await SecureStore.getItemAsync(CHARACTER_CONFIG_KEY);
  if (!raw) return null;
  try {
    const config = JSON.parse(raw) as CharacterConfig;
    return {
      ...config,
      body: toPartId(config.body),
      eyes: toPartId(config.eyes),
      mouth: toPartId(config.mouth),
      hairBack: toPartId(config.hairBack),
      hairFront: toPartId(config.hairFront),
      clothing: config.clothing && toPartId(config.clothing),
      accessory: config.accessory && toPartId(config.accessory),
      hairColor: config.hairColor.toUpperCase(),
      eyesColor: config.eyesColor.toUpperCase(),
    };
  } catch {
    return null;
  }
}

export async function saveCharacter(config: CharacterConfig): Promise<void> {
  await SecureStore.setItemAsync(CHARACTER_CONFIG_KEY, JSON.stringify(config));
}

/** 계정 단위가 아니라 기기 단위 키라, 로그아웃 때 지우지 않으면 다음 계정에 이전 캐릭터가 보인다. */
export async function clearSavedCharacter(): Promise<void> {
  await SecureStore.deleteItemAsync(CHARACTER_CONFIG_KEY);
}
