import {
  AxiosError,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import { TERRITORY_CITY } from '@/constants/territory/region';
import { DONGS } from '@/constants/territory/dongs';
import type { Location } from '@/types/location';
import type {
  AssignedBy,
  ChallengeResult,
  CurrentCycle,
  DefensePhotoResult,
  DevelopResult,
  Development,
  DongPreference,
  MissionChange,
  MyTerritory,
  Representative,
  TeamRank,
  TerritoryDetail,
  TerritorySummary,
} from '@/types/territory';
import type { UserInfo } from '@/types/user';
import client from '../client';
import { queryClient } from '../queryClient';
import { territoryKeys, userKeys } from '../queryKeys';
import {
  getTerritoryMockSettings,
  isTerritoryMockActive,
  setTerritoryMockSettings,
  type TerritoryMockSettings,
} from './territoryMockStore';

/**
 * 개발 빌드 전용 가짜 땅따먹기 서버. `/api/territory/*` 요청만 가로채고 나머지는 실제 서버로 보낸다.
 * 서버 명세(`src/types/territory.ts`)의 형식·에러 메시지를 흉내 내지만 규칙 수치는 임의값이다.
 */

const TOLL_RATE = 0.1;
const DEVELOPMENT_COST = 300;
const DEVELOPMENT_PROBABILITY = 0.49;
const DEVELOPMENT_GAIN = 400;
const DAILY_DEVELOPMENTS = 5;
const MAX_OWNED = 5;
const NETWORK_DELAY_MS = 200;
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const ADJECTIVES = ['노을 지는', '반짝이는', '오래된', '시원한', '알록달록한', '조용한', '따뜻한'];
const NOUNS = ['바다', '골목', '간판', '계단', '나무', '시장', '자전거'];
const NAMES = ['민준', '서연', '도윤', '하은', '지호', '수아', '예준', '지유', '시우', '하린'];

interface MockOwner {
  id: string;
  name: string;
  locationId: number;
}

interface MockLand {
  territoryId: number;
  dongCode: number;
  dongName: string;
  locationId: number;
  owner?: MockOwner;
  blocked: boolean;
  defenseScore: number;
  landPrice: number;
  developmentValue: number;
  adjective?: string;
  noun?: string;
  criteria?: string;
  pendingAdjective?: string;
  pendingNoun?: string;
  pendingCriteria?: string;
  photo?: string;
  developments: Development[];
}

interface MockWorld {
  key: string;
  lands: Map<number, MockLand>;
  preferences: number[];
  myCodes: number[];
  assigned: boolean;
  phase: TerritoryMockSettings['phase'];
  challenges: Map<string, ChallengeResult>;
  remainingDevelopments: number;
  nextId: number;
}

let locations: Location[] = [];
let world: MockWorld | null = null;

/** 동 목록은 구 이름만 있어, 미리보기 화면이 받은 동네 목록으로 구 id를 잇는다. */
export function setMockLocations(next: Location[]) {
  locations = next.filter((location) => location.city_name === TERRITORY_CITY);
}

export function getMockLocations(): Location[] {
  return locations;
}

function locationIdOf(gu: string): number {
  return locations.find((location) => location.location_name === gu)?.location_id ?? 0;
}

function me(): { id: string; name: string; point: number } {
  const info = queryClient.getQueryData<UserInfo>(userKeys.me());
  return { id: info?.user_id ?? 'mock-me', name: info?.user_name ?? '나', point: info?.point ?? 0 };
}

/** 같은 설정이면 매번 같은 땅이 나오도록 동 코드로 값을 정한다. */
function seeded(code: number, salt: number): number {
  const x = Math.sin(code * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function pick<T>(items: readonly T[], code: number, salt: number): T {
  return items[Math.floor(seeded(code, salt) * items.length)];
}

function photoUrl(code: number, version = 0) {
  return `https://picsum.photos/seed/tikitaka-${code}-${version}/720/540`;
}

function missionFields(code: number, version = 0) {
  return {
    adjective: pick(ADJECTIVES, code, 8),
    noun: pick(NOUNS, code, 9),
    criteria: '미션 대상이 사진 가운데에 잘 보여야 해요',
    photo: photoUrl(code, version),
  };
}

function teammate(code: number, locationId: number): MockOwner {
  return {
    id: `mock-user-${code}`,
    name: `${pick(NAMES, code, 3)}${(code % 90) + 10}`,
    locationId,
  };
}

/** 단계와 관계없는 땅 바탕. 내 땅은 대표 발표 때(`assignRepresentatives`) 정한다. */
function buildWorld(current: TerritoryMockSettings): MockWorld {
  const lands = new Map<number, MockLand>();
  let blockedPlaced = false;

  DONGS.forEach((dong, index) => {
    const locationId = locationIdOf(dong.gu);
    const isTeamGu = dong.gu === current.teamGu;
    const roll = seeded(dong.code, 1);

    let owner: MockOwner | undefined;
    let blocked = false;
    if (roll >= 0.12) {
      // 우리 구 땅 일부는 다른 팀에 빼앗긴 상태로 둔다.
      const stolen = isTeamGu && roll > 0.8;
      const ownerGu = stolen ? pick(locations, dong.code, 2)?.location_name : dong.gu;
      owner = teammate(dong.code, ownerGu ? locationIdOf(ownerGu) : locationId);
      if (!isTeamGu && !blockedPlaced && roll > 0.5) {
        blocked = true;
        blockedPlaced = true;
      }
    }

    lands.set(dong.code, {
      territoryId: index + 1,
      dongCode: dong.code,
      dongName: dong.name,
      locationId,
      owner,
      blocked,
      defenseScore: owner ? 60 + Math.floor(seeded(dong.code, 5) * 36) : 0,
      landPrice: 1000 + Math.floor(seeded(dong.code, 6) * 40) * 100,
      developmentValue: Math.floor(seeded(dong.code, 7) * 5) * 400,
      ...(owner && missionFields(dong.code)),
      developments: [],
    });
  });

  return {
    key: worldKey(current),
    lands,
    preferences: [],
    myCodes: [],
    assigned: false,
    phase: current.phase,
    challenges: new Map(),
    remainingDevelopments: DAILY_DEVELOPMENTS,
    nextId: 1,
  };
}

/**
 * 대표 발표. 희망 동을 1지망부터 내 땅으로 배정하고, 모자라면 남은 우리 구 동으로 채운다.
 * 첫 땅은 세팅 전, 둘째 땅은 대기 미션이 있는 상태로 두어 두 흐름을 모두 볼 수 있게 한다.
 */
function assignRepresentatives(state: MockWorld, current: TerritoryMockSettings) {
  const myself = me();
  const teamId = locationIdOf(current.teamGu);
  const teamCodes = DONGS.filter((dong) => dong.gu === current.teamGu).map((dong) => dong.code);
  const myCodes = [...new Set([...state.preferences, ...teamCodes])].slice(0, 2);

  for (const code of state.myCodes) {
    const land = state.lands.get(code);
    if (land) land.owner = teammate(code, teamId);
  }
  myCodes.forEach((code, index) => {
    const land = state.lands.get(code);
    if (!land) return;
    land.owner = { id: myself.id, name: myself.name, locationId: teamId };
    land.blocked = false;
    land.pendingAdjective = undefined;
    land.pendingNoun = undefined;
    land.pendingCriteria = undefined;
    if (index === 0) {
      land.adjective = undefined;
      land.noun = undefined;
      land.criteria = undefined;
      land.photo = undefined;
      land.defenseScore = 0;
    } else {
      Object.assign(land, missionFields(code));
      land.defenseScore = 60 + Math.floor(seeded(code, 5) * 36);
      land.pendingAdjective = '비 오는';
      land.pendingNoun = '정류장';
    }
  });

  // 세팅 기간에는 다른 대표 절반도 아직 세팅 전이다.
  if (current.phase === 'setup') {
    for (const land of state.lands.values()) {
      if (!land.owner || myCodes.includes(land.dongCode) || seeded(land.dongCode, 4) >= 0.5) {
        continue;
      }
      land.adjective = undefined;
      land.noun = undefined;
      land.criteria = undefined;
      land.photo = undefined;
      land.defenseScore = 0;
    }
  }

  state.myCodes = myCodes;
  state.assigned = true;
}

/** 서버처럼 땅따먹기가 시작되면 세팅하지 않은 땅에 기본 미션과 점수를 넣는다. */
function fillDefaultMissions(state: MockWorld) {
  for (const land of state.lands.values()) {
    if (!land.owner || land.photo) continue;
    Object.assign(land, missionFields(land.dongCode, state.nextId++));
    land.defenseScore = 60;
  }
}

function worldKey(current: TerritoryMockSettings) {
  return `${current.teamGu}|${locations.length}`;
}

/** 단계를 바꿔도 희망 동·세팅·도전 기록이 이어지도록, 팀이 바뀔 때만 새로 만들고 단계 변화는 여기서 반영한다. */
function getWorld(): MockWorld {
  const current = getTerritoryMockSettings();
  if (!world || world.key !== worldKey(current)) world = buildWorld(current);
  if (world.phase !== current.phase) {
    if (!hasLands(current.phase)) world.assigned = false;
    world.phase = current.phase;
  }
  if (hasLands(current.phase) && !world.assigned) assignRepresentatives(world, current);
  if (current.phase === 'battle') fillDefaultMissions(world);
  return world;
}

const PHASE_ORDER: TerritoryMockSettings['phase'][] = [
  'selection',
  'awaitingPick',
  'setup',
  'battle',
  'none',
];

export function advanceMockPhase() {
  const { phase } = getTerritoryMockSettings();
  const next = PHASE_ORDER[(PHASE_ORDER.indexOf(phase) + 1) % PHASE_ORDER.length];
  if (next === 'selection') world = null;
  updateMockSettings({ phase: next });
}

export function resetMockWorld() {
  world = null;
  void queryClient.invalidateQueries({ queryKey: territoryKeys.all });
}

export function updateMockSettings(patch: Partial<TerritoryMockSettings>) {
  setTerritoryMockSettings(patch);
  void queryClient.invalidateQueries({ queryKey: territoryKeys.all });
}

export function getMockShortcuts() {
  const current = getTerritoryMockSettings();
  const lands = [...getWorld().lands.values()];
  const myself = me();
  const mine = lands.filter((land) => land.owner?.id === myself.id);
  const teamId = locationIdOf(current.teamGu);
  return {
    myDong: mine.find((land) => land.photo)?.dongCode,
    unsetDong: mine.find((land) => !land.photo)?.dongCode,
    pendingDong: mine.find((land) => land.pendingAdjective)?.dongCode,
    rivalDong: lands.find((land) => land.owner && land.owner.locationId !== teamId && !land.blocked)
      ?.dongCode,
    lastChallengeId: [...getWorld().challenges.keys()].pop(),
  };
}

export function setMockPoint(point: number) {
  queryClient.setQueryData<UserInfo>(userKeys.me(), (prev) => (prev ? { ...prev, point } : prev));
}

function hasLands(phase: TerritoryMockSettings['phase']) {
  return phase === 'setup' || phase === 'battle';
}

function kst(offsetMs: number): string {
  return new Date(Date.now() + offsetMs + 9 * HOUR).toISOString().slice(0, 19);
}

function cycle(current: TerritoryMockSettings): CurrentCycle {
  const teamId = locationIdOf(current.teamGu);
  switch (current.phase) {
    case 'none':
      return { round_type: 'NONE', representatives_selected: false };
    case 'selection':
      return {
        cycle_id: 1,
        round_type: 'POINT',
        point_started_at: kst(-1 * DAY),
        ranking_freeze_at: kst(2 * DAY + 3 * HOUR),
        battle_started_at: kst(6 * DAY),
        battle_ended_at: kst(13 * DAY),
        representatives_selected: false,
        my_location_id: teamId,
      };
    case 'awaitingPick':
      return {
        cycle_id: 1,
        round_type: 'POINT',
        point_started_at: kst(-4 * DAY),
        ranking_freeze_at: kst(-1 * HOUR),
        battle_started_at: kst(3 * DAY),
        battle_ended_at: kst(10 * DAY),
        representatives_selected: false,
        my_location_id: teamId,
      };
    case 'setup':
      return {
        cycle_id: 1,
        round_type: 'POINT',
        point_started_at: kst(-5 * DAY),
        ranking_freeze_at: kst(-1 * DAY),
        battle_started_at: kst(1 * DAY + 5 * HOUR),
        battle_ended_at: kst(8 * DAY),
        representatives_selected: true,
        my_location_id: teamId,
      };
    case 'battle':
      return {
        cycle_id: 1,
        round_type: 'BATTLE',
        point_started_at: kst(-8 * DAY),
        ranking_freeze_at: kst(-4 * DAY),
        battle_started_at: kst(-1 * DAY),
        battle_ended_at: kst(5 * DAY + 2 * HOUR),
        representatives_selected: true,
        my_location_id: teamId,
      };
  }
}

function mission(land: MockLand) {
  return land.adjective && land.noun ? `${land.adjective} ${land.noun}` : undefined;
}

function toll(land: MockLand) {
  return Math.round(land.landPrice * TOLL_RATE);
}

function summary(land: MockLand, current: TerritoryMockSettings): TerritorySummary {
  const myself = me();
  const teamId = locationIdOf(current.teamGu);
  const mine = land.owner?.id === myself.id;
  const team = land.owner?.locationId === teamId;
  return {
    territory_id: land.territoryId,
    dong_id: land.territoryId,
    dong_code: land.dongCode,
    dong_name: land.dongName,
    location_id: land.locationId,
    ...(land.owner && {
      owner_id: land.owner.id,
      owner_location_id: land.owner.locationId,
      ...(!land.blocked && { owner_name: land.owner.name }),
    }),
    defense_score: land.defenseScore,
    land_price: land.landPrice,
    mine,
    challengeable: current.phase === 'battle' && !mine && !team,
    blocked: land.blocked,
  };
}

function detail(land: MockLand, current: TerritoryMockSettings): TerritoryDetail {
  const { dong_id: _, ...rest } = summary(land, current);
  return {
    ...rest,
    ...(mission(land) && {
      mission: mission(land),
      mission_adjective: land.adjective,
      mission_noun: land.noun,
    }),
    ...(land.criteria && { scoring_criteria: land.criteria }),
    ...(rest.mine &&
      land.pendingAdjective && {
        pending_adjective: land.pendingAdjective,
        pending_noun: land.pendingNoun,
        ...(land.pendingCriteria && { pending_criteria: land.pendingCriteria }),
      }),
    ...(!land.blocked && land.photo && { defense_photo: land.photo }),
    toll: toll(land),
    development_cost: DEVELOPMENT_COST,
    development_probability: DEVELOPMENT_PROBABILITY,
  };
}

function myTerritory(land: MockLand): MyTerritory {
  return {
    territory_id: land.territoryId,
    dong_code: land.dongCode,
    dong_name: land.dongName,
    location_id: land.locationId,
    ...(mission(land) && {
      mission: mission(land),
      mission_adjective: land.adjective,
      mission_noun: land.noun,
    }),
    ...(land.criteria && { scoring_criteria: land.criteria }),
    ...(land.pendingAdjective && {
      pending_adjective: land.pendingAdjective,
      pending_noun: land.pendingNoun,
      ...(land.pendingCriteria && { pending_criteria: land.pendingCriteria }),
    }),
    ...(land.photo && { defense_photo: land.photo }),
    defense_score: land.defenseScore,
    land_price: land.landPrice,
    development_value: land.developmentValue,
    owner_last_active_at: kst(-2 * HOUR),
  };
}

class MockHttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

function requireLand(code: number, current: TerritoryMockSettings): MockLand {
  const land = hasLands(current.phase) ? getWorld().lands.get(code) : undefined;
  if (!land) throw new MockHttpError(404, '이 동의 땅이 아직 없습니다');
  return land;
}

/** RN FormData는 `_parts`에 [이름, 값] 쌍을 들고 있다. */
function formField(data: unknown, name: string): string | undefined {
  const parts = (data as { _parts?: [string, unknown][] } | undefined)?._parts;
  const value = parts?.find(([key]) => key === name)?.[1];
  return typeof value === 'string' ? value : undefined;
}

function jsonBody(data: unknown): Record<string, unknown> {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return (data as Record<string, unknown>) ?? {};
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function handle(
  method: string,
  path: string,
  config: InternalAxiosRequestConfig,
): Promise<unknown> {
  const current = getTerritoryMockSettings();
  const state = getWorld();
  const myself = me();
  const teamId = locationIdOf(current.teamGu);
  const lands = [...state.lands.values()];
  const dongMatch = path.match(/^\/api\/territory\/dongs\/(\d+)(?:\/(\w[\w-]*))?$/);
  const dongCode = dongMatch ? Number(dongMatch[1]) : undefined;
  const action = dongMatch?.[2];

  if (method === 'get' && path === '/api/territory/cycle/current') return cycle(current);

  if (path === '/api/territory/preferences') {
    if (method === 'put') {
      const codes = (jsonBody(config.data).dong_codes as number[] | undefined) ?? [];
      if (codes.length > 3)
        throw new MockHttpError(400, '희망 동은 최대 3개까지 등록할 수 있습니다');
      if (current.phase !== 'selection' && current.phase !== 'awaitingPick') {
        throw new MockHttpError(409, '희망 동은 대표 선발 전에만 바꿀 수 있습니다');
      }
      const invalid = codes.find(
        (code) => DONGS.find((dong) => dong.code === code)?.gu !== current.teamGu,
      );
      if (invalid) throw new MockHttpError(400, '본진 구의 동만 등록할 수 있습니다');
      state.preferences = codes;
    }
    return {
      preferences: state.preferences.map(
        (code, index): DongPreference => ({
          priority: (index + 1) as DongPreference['priority'],
          dong_id: code,
          dong_code: code,
          dong_name: DONGS.find((dong) => dong.code === code)?.name ?? '',
        }),
      ),
    };
  }

  if (method === 'get' && path === '/api/territory/representatives') {
    const selected = hasLands(current.phase);
    const locationId = (config.params as { locationId?: number } | undefined)?.locationId;
    const assigned: AssignedBy[] = ['PREFERENCE_1', 'PREFERENCE_2', 'PREFERENCE_3', 'RANDOM'];
    const representatives: Representative[] = selected
      ? lands
          .filter(
            (land) => land.owner && (locationId === undefined || land.locationId === locationId),
          )
          .map((land, index) => ({
            rank: index + 1 + (index >= 3 ? 1 : 0), // 탈퇴·차단으로 rank가 건너뛴 경우를 흉내 낸다
            user_id: land.owner!.id,
            user_name: land.blocked ? '차단한 사용자' : land.owner!.name,
            score: 9000 - index * 370,
            location_id: land.locationId,
            dong_id: land.territoryId,
            dong_code: land.dongCode,
            dong_name: land.dongName,
            assigned_by:
              land.owner!.id === myself.id
                ? (assigned[state.preferences.indexOf(land.dongCode)] ?? 'RANDOM')
                : assigned[index % assigned.length],
            mine: land.owner!.id === myself.id,
          }))
      : [];
    return { cycle_id: 1, representatives_selected: selected, representatives };
  }

  if (method === 'get' && path === '/api/territory/dongs') {
    return {
      cycle_id: 1,
      round_type: cycle(current).round_type,
      territories: hasLands(current.phase) ? lands.map((land) => summary(land, current)) : [],
    };
  }

  if (method === 'get' && dongCode !== undefined && !action) {
    return detail(requireLand(dongCode, current), current);
  }

  if (method === 'post' && dongCode !== undefined && action === 'setup') {
    await wait(current.scoringDelayMs);
    const land = requireLand(dongCode, current);
    if (land.owner?.id !== myself.id) throw new MockHttpError(403, '내 땅만 세팅할 수 있습니다');
    if (land.photo) throw new MockHttpError(409, '이미 세팅한 땅입니다');
    land.adjective = formField(config.data, 'adjective');
    land.noun = formField(config.data, 'noun');
    land.criteria = formField(config.data, 'scoringCriteria');
    land.photo = photoUrl(dongCode, state.nextId++);
    land.defenseScore = 55 + Math.floor(Math.random() * 41);
    return defenseResult(land);
  }

  if (method === 'post' && dongCode !== undefined && action === 'challenge') {
    const land = requireLand(dongCode, current);
    if (current.phase !== 'battle') throw new MockHttpError(409, '땅따먹기 기간이 아닙니다');
    if (land.owner?.id === myself.id) throw new MockHttpError(400, '내 땅에는 도전할 수 없습니다');
    if (land.owner?.locationId === teamId) {
      throw new MockHttpError(400, '우리 팀 땅에는 도전할 수 없습니다');
    }
    const owned = lands.filter((item) => item.owner?.id === myself.id).length;
    if (owned >= MAX_OWNED)
      throw new MockHttpError(409, `땅은 최대 ${MAX_OWNED}개까지 가질 수 있습니다`);
    const fee = toll(land);
    if (myself.point < fee) throw new MockHttpError(400, '포인트가 부족합니다');
    await wait(current.scoringDelayMs);

    const score = Math.floor(Math.random() * 101);
    const outcome =
      current.challengeOutcome === 'random'
        ? score > land.defenseScore
          ? 'CAPTURED'
          : 'FAILED'
        : current.challengeOutcome;
    const finalScore =
      outcome === 'CAPTURED'
        ? Math.max(score, land.defenseScore + 1)
        : Math.min(score, Math.max(land.defenseScore - 1, 0));
    const result: ChallengeResult = {
      challenge_id: `mock-challenge-${state.nextId++}`,
      dong_code: land.dongCode,
      dong_name: land.dongName,
      ...(mission(land) && { mission: mission(land) }),
      result: outcome,
      score: finalScore,
      defense_score_at: land.defenseScore,
      toll: fee,
      review:
        outcome === 'CAPTURED'
          ? '미션 대상이 또렷하고 구도가 좋아요.'
          : '미션 대상이 작게 찍혀 점수가 낮아요.',
      created_at: kst(0),
      my_point: myself.point - fee,
    };
    if (outcome === 'CAPTURED') {
      land.owner = { id: myself.id, name: myself.name, locationId: teamId };
      land.blocked = false;
      land.defenseScore = finalScore;
    }
    const { my_point: _, ...stored } = result;
    state.challenges.set(result.challenge_id, stored);
    return result;
  }

  if (method === 'get' && path.startsWith('/api/territory/challenges/')) {
    const found = state.challenges.get(path.split('/').pop() ?? '');
    if (!found) throw new MockHttpError(404, '도전 기록이 없습니다');
    return found;
  }

  if (method === 'post' && dongCode !== undefined && action === 'develop') {
    const land = requireLand(dongCode, current);
    if (current.phase !== 'battle') throw new MockHttpError(409, '땅따먹기 기간이 아닙니다');
    if (land.owner?.locationId !== teamId || land.owner.id === myself.id) {
      throw new MockHttpError(400, '우리 팀 동료의 땅만 개발할 수 있습니다');
    }
    if (state.remainingDevelopments <= 0)
      throw new MockHttpError(409, '오늘은 더 개발할 수 없습니다');
    if (myself.point < DEVELOPMENT_COST) throw new MockHttpError(400, '포인트가 부족합니다');
    const success = Math.random() < DEVELOPMENT_PROBABILITY;
    state.remainingDevelopments -= 1;
    if (success) {
      land.landPrice += DEVELOPMENT_GAIN;
      land.developmentValue += DEVELOPMENT_GAIN;
    }
    land.developments.unshift({
      development_id: state.nextId++,
      user_id: myself.id,
      user_name: myself.name,
      success,
      cost: DEVELOPMENT_COST,
      value_added: success ? DEVELOPMENT_GAIN : 0,
      created_at: kst(0),
      mine: true,
      blocked: false,
    });
    const result: DevelopResult = {
      dong_code: land.dongCode,
      success,
      cost: DEVELOPMENT_COST,
      probability: DEVELOPMENT_PROBABILITY,
      team_gain: success ? DEVELOPMENT_GAIN : 0,
      land_price: land.landPrice,
      next_cost: DEVELOPMENT_COST,
      remaining_today: state.remainingDevelopments,
      my_point: myself.point - DEVELOPMENT_COST,
    };
    return result;
  }

  if (method === 'get' && dongCode !== undefined && action === 'developments') {
    const land = requireLand(dongCode, current);
    return { dong_code: land.dongCode, dong_name: land.dongName, developments: land.developments };
  }

  if (method === 'get' && path === '/api/territory/me') {
    return {
      cycle_id: 1,
      round_type: cycle(current).round_type,
      max_owned: MAX_OWNED,
      territories: hasLands(current.phase)
        ? lands.filter((land) => land.owner?.id === myself.id).map(myTerritory)
        : [],
    };
  }

  if (method === 'patch' && dongCode !== undefined && action === 'mission') {
    const land = requireLand(dongCode, current);
    if (land.owner?.id !== myself.id) throw new MockHttpError(403, '내 땅만 바꿀 수 있습니다');
    const body = jsonBody(config.data);
    land.pendingAdjective = String(body.adjective ?? '');
    land.pendingNoun = String(body.noun ?? '');
    land.pendingCriteria = body.scoring_criteria ? String(body.scoring_criteria) : undefined;
    const change: MissionChange = {
      dong_code: land.dongCode,
      ...(mission(land) && { mission: mission(land) }),
      pending_adjective: land.pendingAdjective,
      pending_noun: land.pendingNoun,
      ...(land.pendingCriteria && { pending_criteria: land.pendingCriteria }),
    };
    return change;
  }

  if (method === 'post' && dongCode !== undefined && action === 'defense-photo') {
    await wait(current.scoringDelayMs);
    const land = requireLand(dongCode, current);
    if (land.owner?.id !== myself.id) throw new MockHttpError(403, '내 땅만 다시 찍을 수 있습니다');
    if (land.pendingAdjective) {
      land.adjective = land.pendingAdjective;
      land.noun = land.pendingNoun;
      land.criteria = land.pendingCriteria;
      land.pendingAdjective = undefined;
      land.pendingNoun = undefined;
      land.pendingCriteria = undefined;
    }
    land.photo = photoUrl(dongCode, state.nextId++);
    land.defenseScore = 50 + Math.floor(Math.random() * 46);
    return defenseResult(land);
  }

  if (method === 'get' && path === '/api/territory/ranking/team') {
    const totals = new Map<number, { total: number; count: number }>();
    for (const land of lands) {
      if (!land.owner || !hasLands(current.phase)) continue;
      const entry = totals.get(land.owner.locationId) ?? { total: 0, count: 0 };
      entry.total += land.landPrice;
      entry.count += 1;
      totals.set(land.owner.locationId, entry);
    }
    const rows = locations
      .map((location) => {
        const entry = totals.get(location.location_id) ?? { total: 0, count: 0 };
        return { location, ...entry };
      })
      .sort((a, b) => b.total - a.total);
    const teams: TeamRank[] = rows.map((row) => ({
      rank: rows.findIndex((other) => other.total === row.total) + 1,
      location_id: row.location.location_id,
      location_name: row.location.location_name,
      total_land_price: row.total,
      owned_dong_count: row.count,
      avg_land_price: row.count ? Math.round(row.total / row.count) : 0,
    }));
    // 실제 서버는 선발 전이면 직전 사이클 확정값을 주지만, 목에는 지난 사이클이 없어 빈 목록을 준다.
    return {
      cycle_id: 1,
      finalized: false,
      my_location_id: teamId,
      teams: hasLands(current.phase) ? teams : [],
    };
  }

  throw new MockHttpError(404, `목 서버에 없는 API입니다: ${method.toUpperCase()} ${path}`);
}

function defenseResult(land: MockLand): DefensePhotoResult {
  return {
    dong_code: land.dongCode,
    mission: mission(land) ?? '',
    mission_adjective: land.adjective ?? '',
    mission_noun: land.noun ?? '',
    ...(land.criteria && { scoring_criteria: land.criteria }),
    defense_photo: land.photo ?? '',
    defense_score: land.defenseScore,
    review: '빛이 고르고 미션 대상이 잘 드러나요.',
  };
}

const mockAdapter: AxiosAdapter = async (config) => {
  const method = (config.method ?? 'get').toLowerCase();
  const path = (config.url ?? '').split('?')[0];
  await wait(NETWORK_DELAY_MS);
  try {
    const data = await handle(method, path, config);
    const response: AxiosResponse = {
      data: { status: 200, message: 'OK (mock)', data },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
    return response;
  } catch (error) {
    const status = error instanceof MockHttpError ? error.status : 500;
    const message = error instanceof Error ? error.message : '목 서버 오류';
    const response: AxiosResponse = {
      data: { status, message, data: null },
      status,
      statusText: message,
      headers: {},
      config,
    };
    throw new AxiosError(message, AxiosError.ERR_BAD_REQUEST, config, null, response);
  }
};

let installed = false;

/**
 * 공용 client에 요청 인터셉터를 하나 붙여, 목 모드일 때 땅따먹기 요청만 가짜 어댑터로 보낸다.
 * client.ts(인증 흐름)는 건드리지 않는다. 개발 빌드에서 미리보기 화면을 열 때 한 번 설치한다.
 */
export function installTerritoryMock() {
  if (!__DEV__ || installed) return;
  installed = true;
  client.interceptors.request.use((config) => {
    if (isTerritoryMockActive() && config.url?.startsWith('/api/territory')) {
      config.adapter = mockAdapter;
    }
    return config;
  });
}
