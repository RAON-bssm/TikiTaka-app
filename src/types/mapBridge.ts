// 웹 레포(TikiTaka-webview)의 src/bridge/bridge.ts와 동기화 필요
// 규약 원본: 웹 레포 docs/map-web-plan.md 4장. 한쪽을 바꾸면 다른 쪽도 같이 바꾼다.

export const BRIDGE_VERSION = 1;

export type LatLng = { lat: number; lng: number };

export interface CharacterConfig {
  body: string;
  eyes: string;
  eyesColor: string;
  mouth: string;
  hairBack: string;
  hairFront: string;
  hairColor: string;
  clothing?: string;
  accessory?: string;
}

export type PartUrlMap = Record<string, string>;

export interface MapCharacter {
  id: string;
  name: string;
  config: CharacterConfig;
  kind: 'npc' | 'user';
}

export interface Neighborhood {
  locationId: number;
  cityName: string;
  name: string;
  center?: LatLng;
}

export interface PlacedSticker {
  id: string;
  stickerId: string;
  position: LatLng;
  rotation: number;
  scale: number;
}

export type ToWeb =
  | {
      v: 1;
      type: 'init';
      neighborhood: Neighborhood;
      characters: MapCharacter[];
      partUrls: PartUrlMap;
    }
  | { v: 1; type: 'setNeighborhood'; neighborhood: Neighborhood; characters: MapCharacter[] }
  | { v: 1; type: 'upsertCharacters'; characters: MapCharacter[]; partUrls?: PartUrlMap }
  | { v: 1; type: 'showBubble'; characterId: string; text: string; durationMs?: number }
  | { v: 1; type: 'focusCharacter'; characterId: string }
  | { v: 1; type: 'setStickers'; stickers: PlacedSticker[]; stickerUrls: Record<string, string> }
  | { v: 1; type: 'setEditMode'; enabled: boolean };

export type MapErrorCode = 'SDK_LOAD_FAILED' | 'GEOCODE_FAILED' | 'UNKNOWN';

export type ToRN =
  | { v: 1; type: 'ready' }
  | { v: 1; type: 'mapLoaded' }
  | { v: 1; type: 'characterTap'; characterId: string }
  | { v: 1; type: 'mapError'; code: MapErrorCode; message?: string }
  /** 개발용 */
  | { v: 1; type: 'log'; level: 'info' | 'warn' | 'error'; message: string }
  // (추후) 스티커
  | { v: 1; type: 'stickersChanged'; stickers: PlacedSticker[] };
