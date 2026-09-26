import * as SecureStore from 'expo-secure-store';

import type { CharacterConfig } from '@/constants/character/types';

// 서버 연동 전까지 캐릭터 config를 기기에 영속화하는 키.
const CHARACTER_CONFIG_KEY = 'characterConfig';

/** 없거나 손상된 값이면 null(→ 기본값 사용). */
export async function getSavedCharacter(): Promise<CharacterConfig | null> {
  const raw = await SecureStore.getItemAsync(CHARACTER_CONFIG_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CharacterConfig;
  } catch {
    return null;
  }
}

export async function saveCharacter(config: CharacterConfig): Promise<void> {
  await SecureStore.setItemAsync(CHARACTER_CONFIG_KEY, JSON.stringify(config));
}
