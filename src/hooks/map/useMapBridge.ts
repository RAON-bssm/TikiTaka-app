import { useEffect, useRef, useState } from 'react';
import type WebView from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';

import {
  BRIDGE_VERSION,
  type MapCharacter,
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
  onCharacterTap?: (characterId: string) => void;
}

/**
 * 지도 WebView와의 브리지. 웹이 `ready`를 보내기 전에 보낸 메시지는 유실되므로
 * `ready`를 받은 뒤에만 보내고, WebView가 다시 로드되면(`ready` 재수신) `init`도 다시 보낸다.
 */
export function useMapBridge({
  neighborhood,
  characters = [],
  partUrls = {},
  onCharacterTap,
}: Options) {
  const webViewRef = useRef<WebView>(null);
  const isReady = useRef(false);
  const sentLocationId = useRef<number | null>(null);
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

  const onMessage = (event: WebViewMessageEvent) => {
    const message = parseMessage(event.nativeEvent.data);
    if (!message) return;

    switch (message.type) {
      case 'ready':
        isReady.current = true;
        sentLocationId.current = null;
        sendInit();
        break;
      case 'mapLoaded':
        setStatus('loaded');
        break;
      case 'mapError':
        if (__DEV__) console.warn('[map]', message.code, message.message);
        setStatus('error');
        break;
      case 'characterTap':
        onCharacterTap?.(message.characterId);
        break;
      case 'log':
        if (__DEV__) console[message.level]('[map]', message.message);
        break;
      default:
        break;
    }
  };

  /** WebView 자체의 로드 실패(네트워크·HTTP 에러) */
  const fail = () => setStatus('error');

  /** 실패 후 재시도, 또는 WebView 프로세스가 종료됐을 때 다시 띄운다. */
  const reload = () => {
    isReady.current = false;
    sentLocationId.current = null;
    setStatus('loading');
    webViewRef.current?.reload();
  };

  return { webViewRef, status, onMessage, fail, reload };
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
