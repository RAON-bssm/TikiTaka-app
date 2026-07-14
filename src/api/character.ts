import * as SecureStore from 'expo-secure-store';

import type { CharacterConfig } from '@/constants/character/types';

// 캐릭터 꾸미기 config를 기기에 저장하는 키.
// (서버 연동 전까지 프론트에서 변경사항을 영속화하기 위한 로컬 저장)
const CHARACTER_CONFIG_KEY = 'characterConfig';

/** 저장된 캐릭터 config를 불러온다. 없거나 파싱 실패 시 null. */
export async function getSavedCharacter(): Promise<CharacterConfig | null> {
  const raw = await SecureStore.getItemAsync(CHARACTER_CONFIG_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CharacterConfig;
  } catch {
    // 손상된 값이면 무시하고 기본값으로 되돌아가게 한다.
    return null;
  }
}

/** 캐릭터 config를 기기에 저장한다. */
export async function saveCharacter(config: CharacterConfig): Promise<void> {
  await SecureStore.setItemAsync(CHARACTER_CONFIG_KEY, JSON.stringify(config));
}
