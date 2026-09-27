// 파츠 id를 `종류-이름`으로 바꾸기 전의 id. 서버 상품명·기기 저장본에 옛 id가 남아 있을 수 있어
// 읽는 쪽에서 새 id로 바꾼다. 서버 시드와 저장본이 모두 새 id로 바뀌면 이 파일을 지운다.
const LEGACY_PART_IDS: Record<string, string> = {
  body01: 'body-01',
  body02: 'body-02',
  mouth01: 'mouth-01',
  mouth02: 'mouth-02',
  clothing01: 'clothing-01',
  clothing02: 'clothing-02',
  clothing03: 'clothing-03',
  clothing04: 'clothing-04',
  clothing05: 'clothing-05',
  clothing06: 'clothing-06',
  'red-glasses': 'accessory-red-glasses',
  'red-glasses-hair-pin': 'accessory-red-glasses-hair-pin',
  plaster: 'accessory-plaster',
  glasses: 'accessory-glasses',
  eyes01: 'eyes-01',
  bob: 'hair-back-bob',
  long: 'hair-back-long',
  puff: 'hair-back-puff',
  short: 'hair-back-short',
  'side-bob': 'hair-back-side-bob',
  'side-tail': 'hair-back-side-tail',
  'low-tail': 'hair-back-low-tail',
  'low-pigtails': 'hair-back-low-pigtails',
  'side-wave': 'hair-back-side-wave',
  wave: 'hair-back-wave',
  basic: 'hair-front-basic',
};

export function toPartId(id: string): string {
  return LEGACY_PART_IDS[id] ?? id;
}
