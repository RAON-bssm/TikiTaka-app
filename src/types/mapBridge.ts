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

/**
 * 땅따먹기 땅 하나. 팀 개념은 앱이 계산해 `tone`으로만 넘긴다.
 * - mine: 내 땅, team: 우리 팀(본진 구) 땅, rival: 다른 팀 땅, neutral: 주인 없는 땅
 * 경계는 웹이 `dongCode`(행정동 코드 adm_cd2)로 번들 GeoJSON에서 찾는다.
 */
export interface MapTerritory {
  dongCode: number;
  tone: 'mine' | 'team' | 'rival' | 'neutral';
  /** 차단한 유저의 땅 */
  blocked?: boolean;
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
  /** persistent: true면 durationMs를 무시하고 hideBubble이나 다음 말풍선이 올 때까지 남긴다 */
  | {
      v: 1;
      type: 'showBubble';
      characterId: string;
      text: string;
      durationMs?: number;
      persistent?: boolean;
    }
  /** 답을 기다리는 동안 '…' 말풍선. showBubble이 오면 교체되고, hideBubble로 지운다 */
  | { v: 1; type: 'showTyping'; characterId: string }
  | { v: 1; type: 'hideBubble'; characterId: string }
  /**
   * 대화 시작. 이 캐릭터로 확대하고 clearFocus가 올 때까지 멈춘다.
   * bottomInsetPx: WebView 아래 끝에서 RN 패널이 가리는 높이(CSS px)
   */
  | { v: 1; type: 'focusCharacter'; characterId: string; bottomInsetPx?: number }
  /** 대화 종료. 멈춤을 풀어 다시 돌아다니게 한다 */
  | { v: 1; type: 'clearFocus' }
  | { v: 1; type: 'setStickers'; stickers: PlacedSticker[]; stickerUrls: Record<string, string> }
  | { v: 1; type: 'setEditMode'; enabled: boolean }
  /** 땅따먹기 땅 전체를 바꿔 칠한다. 빈 배열이면 지운다. */
  | { v: 1; type: 'setTerritories'; territories: MapTerritory[] }
  /**
   * 고른 동을 강조하고 RN 시트에 가리지 않는 곳으로 옮긴다. dongCode가 없으면 강조를 푼다.
   * bottomInsetPx: WebView 아래 끝에서 RN 시트가 가리는 높이(CSS px)
   */
  | { v: 1; type: 'selectDong'; dongCode?: number; bottomInsetPx?: number };

export type MapErrorCode = 'SDK_LOAD_FAILED' | 'GEOCODE_FAILED' | 'UNKNOWN';

export type ToRN =
  | { v: 1; type: 'ready' }
  | { v: 1; type: 'mapLoaded' }
  | { v: 1; type: 'characterTap'; characterId: string }
  /** 캐릭터가 아닌 빈 지도를 탭함(드래그·핀치 제외) */
  | { v: 1; type: 'mapTap' }
  /** 사용자가 드래그·핀치로 지도를 움직이기 시작함. focusCharacter 확대처럼 웹이 스스로 움직일 때는 보내지 않는다 */
  | { v: 1; type: 'mapMoveStart' }
  | { v: 1; type: 'mapError'; code: MapErrorCode; message?: string }
  /** 땅따먹기 동을 탭함. 캐릭터 위를 탭하면 characterTap이 먼저다. 동을 탭하면 mapTap은 보내지 않는다. */
  | { v: 1; type: 'dongTap'; dongCode: number }
  /** 개발용 */
  | { v: 1; type: 'log'; level: 'info' | 'warn' | 'error'; message: string }
  // (추후) 스티커
  | { v: 1; type: 'stickersChanged'; stickers: PlacedSticker[] };
