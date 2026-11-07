import { useEffect, useRef, useState } from 'react';
import type WebView from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';

import {
  BRIDGE_VERSION,
  type MapCharacter,
  type MapTerritory,
  type Neighborhood,
  type PartUrlMap,
  type ToRN,
  type ToWeb,
} from '@/types/mapBridge';

export type MapStatus = 'loading' | 'loaded' | 'error';

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

interface Options {
  /** 아직 불러오는 중이면 null. `ready` 뒤에 값이 들어오면 그때 `init`을 보낸다. */
  neighborhood: Neighborhood | null;
  characters?: MapCharacter[];
  partUrls?: PartUrlMap;
  /** 땅따먹기 땅. 대표 선발 전이나 사이클 밖이면 빈 배열이다. */
  territories?: MapTerritory[];
  onCharacterTap?: (characterId: string) => void;
  onMapTap?: () => void;
  onMapMoveStart?: () => void;
  onDongTap?: (dongCode: number) => void;
  /** 웹이 다시 로드되면 지도 상태가 초기화되므로, 지도가 다시 그려진 이 시점에 포커스 등을 다시 보낸다. */
  onMapLoaded?: () => void;
}

/**
 * 지도 WebView와의 브리지. 웹이 `ready`를 보내기 전에 보낸 메시지는 유실되므로
 * `ready`를 받은 뒤에만 보내고, WebView가 다시 로드되면(`ready` 재수신) `init`도 다시 보낸다.
 */
// 기본값을 렌더마다 새 배열로 만들면 매번 다른 값으로 보여 같은 내용을 계속 다시 보낸다.
const EMPTY_TERRITORIES: MapTerritory[] = [];

export function useMapBridge({
  neighborhood,
  characters = [],
  partUrls = {},
  territories = EMPTY_TERRITORIES,
  onCharacterTap,
  onMapTap,
  onMapMoveStart,
  onDongTap,
  onMapLoaded,
}: Options) {
  const webViewRef = useRef<WebView>(null);
  const isReady = useRef(false);
  const sentLocationId = useRef<number | null>(null);
  /** 웹이 다시 로드되면 칠한 땅도 사라지므로 `ready`마다 다시 보내려고 마지막으로 보낸 값을 기억한다. */
  const sentTerritories = useRef<MapTerritory[] | null>(null);
  const [status, setStatus] = useState<MapStatus>('loading');

  const sendInit = () => {
    if (!isReady.current || !neighborhood) return;
    post(webViewRef.current, { type: 'init', neighborhood, characters, partUrls });
    sentLocationId.current = neighborhood.locationId;
  };

  useEffect(() => {
    if (!isReady.current || !neighborhood) return;
    if (sentLocationId.current === null) {
      post(webViewRef.current, { type: 'init', neighborhood, characters, partUrls });
    } else if (sentLocationId.current !== neighborhood.locationId) {
      post(webViewRef.current, { type: 'setNeighborhood', neighborhood, characters });
    } else {
      return;
    }
    sentLocationId.current = neighborhood.locationId;
  }, [neighborhood, characters, partUrls]);

  useEffect(() => {
    if (!isReady.current || sentLocationId.current === null || characters.length === 0) return;
    post(webViewRef.current, { type: 'upsertCharacters', characters });
  }, [characters]);

  useEffect(() => {
    if (!isReady.current || sentTerritories.current === territories) return;
    post(webViewRef.current, { type: 'setTerritories', territories });
    sentTerritories.current = territories;
  }, [territories]);

  const onMessage = (event: WebViewMessageEvent) => {
    const message = parseMessage(event.nativeEvent.data);
    if (!message) return;

    switch (message.type) {
      case 'ready':
        isReady.current = true;
        sentLocationId.current = null;
        sendInit();
        post(webViewRef.current, { type: 'setTerritories', territories });
        sentTerritories.current = territories;
        break;
      case 'mapLoaded':
        setStatus('loaded');
        onMapLoaded?.();
        break;
      case 'mapError':
        if (__DEV__) console.warn('[map]', message.code, message.message);
        setStatus('error');
        break;
      case 'characterTap':
        onCharacterTap?.(message.characterId);
        break;
      case 'mapTap':
        onMapTap?.();
        break;
      case 'mapMoveStart':
        onMapMoveStart?.();
        break;
      case 'dongTap':
        onDongTap?.(message.dongCode);
        break;
      case 'log':
        if (__DEV__) console[message.level]('[map]', message.message);
        break;
      default:
        break;
    }
  };

  /** `ready` 전이면 버린다. 말풍선 같은 연출은 놓쳐도 되고, 쌓아 두면 다시 로드된 지도에 철 지난 연출이 뜬다. */
  const sendToMap = (message: DistributiveOmit<ToWeb, 'v'>) => {
    if (!isReady.current) return;
    post(webViewRef.current, message);
  };

  /** WebView 자체의 로드 실패(네트워크·HTTP 에러) */
  const fail = () => setStatus('error');

  /** 실패 후 재시도, 또는 WebView 프로세스가 종료됐을 때 다시 띄운다. */
  const reload = () => {
    isReady.current = false;
    sentLocationId.current = null;
    sentTerritories.current = null;
    setStatus('loading');
    webViewRef.current?.reload();
  };

  return { webViewRef, status, onMessage, fail, reload, sendToMap };
}

function post(webView: WebView | null, message: DistributiveOmit<ToWeb, 'v'>) {
  const payload = JSON.stringify({ v: BRIDGE_VERSION, ...message });
  webView?.injectJavaScript(`window.__tikitaka && window.__tikitaka.receive(${payload}); true;`);
}

function parseMessage(data: string): ToRN | null {
  let message: unknown;
  try {
    message = JSON.parse(data);
  } catch {
    return null;
  }
  if (
    typeof message !== 'object' ||
    message === null ||
    (message as { v?: unknown }).v !== BRIDGE_VERSION ||
    typeof (message as { type?: unknown }).type !== 'string'
  ) {
    return null;
  }
  return message as ToRN;
}
