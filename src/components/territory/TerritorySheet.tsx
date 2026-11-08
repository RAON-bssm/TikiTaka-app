import { useRef, useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';

import ArrowForwardIcon from '@/assets/icons/arrow-forward-ios.svg';
import { getApiErrorMessage } from '@/api/error';
import BlockUserDialog from '@/components/block/BlockUserDialog';
import UserCharacter from '@/components/character/UserCharacter';
import ReportDialog, { type ReportTarget } from '@/components/report/ReportDialog';
import Button from '@/components/ui/Button';
import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Skeleton from '@/components/ui/feedback/Skeleton';
import MoreMenu from '@/components/ui/MoreMenu';
import { useToast } from '@/components/ui/Toast';
import Typography from '@/components/ui/Typography';
import TerritoryStats from './TerritoryStats';
import { palette } from '@/constants/colors';
import { useDevelopTerritory } from '@/hooks/territory/useDevelopTerritory';
import { useTeamName } from '@/hooks/territory/useTeamName';
import type { TerritoryPhase } from '@/hooks/territory/useTerritoryPhase';
import { useTerritory } from '@/hooks/territory/useTerritory';
import type { TerritoryDetail } from '@/types/territory';

interface Props {
  dongCode: number;
  phase: TerritoryPhase | undefined;
  myPoint: number | undefined;
  /** 내 팀(사이클 시작 때의 본진) 구 이름. 사진은 이 구 안에서만 찍을 수 있다. */
  myGu: string | undefined;
  /** 내 팀(본진 구) id. 우리 팀 땅이면 도전 대신 개발한다. */
  myLocationId: number | undefined;
  ownedCount: number;
  maxOwned: number | undefined;
  onChallenge: (territory: TerritoryDetail) => void;
  onInsufficientPoint: (territory: TerritoryDetail) => void;
  /** 내용(땅 정보 또는 에러)이 처음 그려질 때, WebView 아래 끝에서 시트가 가리는 높이를 알린다. */
  onFirstLayout?: (height: number) => void;
}

/**
 * 지도를 가리지 않도록 Modal이 아니라 지도 위에 띄운다(ChatPanel과 같은 방식).
 * 빈 지도 탭·뒤로가기·탭 이동으로 닫히고, 닫는 처리는 지도 화면이 맡는다.
 */
export default function TerritorySheet({
  dongCode,
  phase,
  myPoint,
  myGu,
  myLocationId,
  ownedCount,
  maxOwned,
  onChallenge,
  onInsufficientPoint,
  onFirstLayout,
}: Props) {
  const { data: territory, isLoading, isError, refetch } = useTerritory(dongCode);
  const reported = useRef<'loaded' | 'error'>(undefined);
  const content = territory ? 'loaded' : isError ? 'error' : undefined;

  // 불러오지 못해도 높이를 알려야 지도가 그 동을 강조하고 시트 위로 옮긴다.
  // 내용이 바뀌어도 높이가 같으면 onLayout이 다시 오지 않으므로, 아래 View를 내용별 key로 새로 마운트해 항상 한 번 더 받는다.
  const handleLayout = (event: LayoutChangeEvent) => {
    if (!content || reported.current === content) return;
    reported.current = content;
    onFirstLayout?.(Math.ceil(event.nativeEvent.layout.height));
  };

  return (
    <View
      key={content ?? 'loading'}
      onLayout={handleLayout}
      className="absolute bottom-0 left-0 right-0 gap-2xl rounded-t-lg border border-gray-100 bg-white px-xl pb-xl pt-md"
    >
      <View className="h-[4px] w-[40px] self-center rounded-full bg-gray-400" />
      {isLoading ? (
        <SheetSkeleton />
      ) : isError || !territory ? (
        <ErrorRetry message="땅 정보를 불러오지 못했어요." onRetry={() => void refetch()} />
      ) : (
        <TerritoryContent
          territory={territory}
          phase={phase}
          myPoint={myPoint}
          myGu={myGu}
          myLocationId={myLocationId}
          ownedCount={ownedCount}
          maxOwned={maxOwned}
          onChallenge={onChallenge}
          onInsufficientPoint={onInsufficientPoint}
        />
      )}
    </View>
  );
}

type ContentProps = Omit<Props, 'dongCode' | 'onFirstLayout'> & { territory: TerritoryDetail };

function TerritoryContent({
  territory,
  phase,
  myPoint,
  myGu,
  myLocationId,
  ownedCount,
  maxOwned,
  onChallenge,
  onInsufficientPoint,
}: ContentProps) {
  const teamName = useTeamName();
  const { showToast } = useToast();
  const { mutate: develop, isPending: isDeveloping } = useDevelopTerritory();
  const [reportTarget, setReportTarget] = useState<ReportTarget>();
  const [blockTarget, setBlockTarget] = useState<{ userId: string; userName: string }>();
  const guName = teamName(territory.location_id);
  const ownerTeam = teamName(territory.owner_location_id);
  const hasOwner = territory.owner_id !== undefined;

  const action = getAction({ territory, phase, myPoint, ownedCount, maxOwned });
  // 개발은 남의 땅이 아니라 우리 팀 동료의 땅에 포인트를 넣어 팀 땅값을 올린다.
  const canDevelop =
    phase === 'battle' &&
    hasOwner &&
    !territory.mine &&
    myLocationId !== undefined &&
    territory.owner_location_id === myLocationId;
  const developProbability = Math.round(territory.development_probability * 100);
  const lacksDevelopPoint = myPoint !== undefined && myPoint < territory.development_cost;

  const handleDevelop = () => {
    if (isDeveloping) return;
    develop(territory.dong_code, {
      onSuccess: (result) => {
        const remaining = `오늘 ${result.remaining_today}번 더 할 수 있어요`;
        showToast(
          result.success
            ? `개발 성공! 땅값이 ${result.team_gain.toLocaleString()} 올랐어요 · ${remaining}`
            : `개발에 실패했어요 · ${remaining}`,
        );
      },
      onError: (error) => showToast(getApiErrorMessage(error, '개발하지 못했어요')),
    });
  };

  const ownerId = territory.owner_id;
  const ownerName = territory.owner_name;
  const canReport = !!ownerId && !!ownerName && !territory.mine && !territory.blocked;

  return (
    <>
      <View className="flex-row items-start gap-2xl">
        <View className="flex-1 gap-sm">
          <Typography variant="h1" className="text-gray-800">
            {[guName, territory.dong_name].filter(Boolean).join(' ')}
          </Typography>
          <OwnerLine territory={territory} ownerTeam={ownerTeam} />
        </View>
        {hasOwner && !territory.blocked && territory.owner_id && (
          <UserCharacter userId={territory.owner_id} size={56} />
        )}
        {canReport && (
          <MoreMenu
            items={[
              {
                label: '신고하기',
                onPress: () =>
                  setReportTarget({ type: 'user', userId: ownerId, userName: ownerName }),
              },
              {
                label: '차단하기',
                destructive: true,
                onPress: () => setBlockTarget({ userId: ownerId, userName: ownerName }),
              },
            ]}
          />
        )}
      </View>

      <View className="gap-xs rounded-sm border border-gray-200 bg-white p-md">
        <Typography variant="caption" className="text-primary-600">
          미션
        </Typography>
        <View className="flex-row items-center gap-xs">
          <ArrowForwardIcon width={18} height={18} color={palette.primary[700]} />
          <Typography variant="body3" className="flex-1 text-gray-600">
            {territory.mission ?? '아직 미션이 정해지지 않았어요'}
          </Typography>
        </View>
        {territory.scoring_criteria && (
          <Typography variant="caption" className="text-gray-400">
            {territory.scoring_criteria}
          </Typography>
        )}
      </View>

      <TerritoryStats
        defenseScore={territory.defense_score}
        landPrice={territory.land_price}
        toll={territory.toll}
      />

      <View className="gap-xs">
        {action.kind !== 'disabled' && (
          <Typography variant="caption" className="text-center text-gray-400">
            {`도전할 때마다 통행료 ${territory.toll.toLocaleString()} P를 내요`}
            {myGu ? ` · ${myGu} 안에서 찍은 사진만 인정돼요` : ''}
          </Typography>
        )}
        {canDevelop ? (
          <>
            <Typography variant="caption" className="text-center text-gray-400">
              {`개발비 ${territory.development_cost.toLocaleString()} P · 성공 확률 ${developProbability}% · 실패해도 개발비는 돌려받지 못해요`}
            </Typography>
            <Button
              content={
                isDeveloping
                  ? '개발하는 중...'
                  : lacksDevelopPoint
                    ? '포인트가 부족해요'
                    : '개발해서 팀 땅값 올리기'
              }
              disabled={isDeveloping || lacksDevelopPoint}
              onclick={handleDevelop}
            />
          </>
        ) : (
          <Button
            content={action.label}
            disabled={action.kind === 'disabled'}
            onclick={() => {
              if (action.kind === 'challenge') onChallenge(territory);
              if (action.kind === 'insufficient') onInsufficientPoint(territory);
            }}
          />
        )}
      </View>

      <ReportDialog target={reportTarget} onClose={() => setReportTarget(undefined)} />
      <BlockUserDialog target={blockTarget} onClose={() => setBlockTarget(undefined)} />
    </>
  );
}

function OwnerLine({
  territory,
  ownerTeam,
}: {
  territory: TerritoryDetail;
  ownerTeam: string | undefined;
}) {
  if (territory.owner_id === undefined) {
    return (
      <Typography variant="body3" className="text-gray-400">
        주인 없는 땅
      </Typography>
    );
  }
  const ownerName = territory.mine
    ? '나'
    : territory.blocked
      ? '차단한 사용자'
      : territory.owner_name;
  return (
    <View className="flex-row items-center gap-xs">
      <Typography variant="h4" className="text-gray-500">
        대표
      </Typography>
      <Typography variant="body3" className="text-gray-400">
        {ownerName}
      </Typography>
      {ownerTeam && (
        <>
          <Typography variant="body3" className="text-gray-300">
            ·
          </Typography>
          <Typography variant="body3" className="text-gray-400">
            {`${ownerTeam} 땅`}
          </Typography>
        </>
      )}
    </View>
  );
}

type Action =
  | { kind: 'challenge'; label: string }
  | { kind: 'insufficient'; label: string }
  | { kind: 'disabled'; label: string };

function getAction({
  territory,
  phase,
  myPoint,
  ownedCount,
  maxOwned,
}: Pick<ContentProps, 'territory' | 'phase' | 'myPoint' | 'ownedCount' | 'maxOwned'>): Action {
  if (territory.mine) return { kind: 'disabled', label: '내 땅이에요' };
  if (phase !== 'battle') return { kind: 'disabled', label: '땅따먹기 주간에 도전할 수 있어요' };
  if (!territory.challengeable) return { kind: 'disabled', label: '우리 팀 땅이에요' };
  // 서버도 409로 막지만 통행료 없이 끝나는 요청이라 미리 안내만 한다.
  if (maxOwned !== undefined && ownedCount >= maxOwned) {
    return { kind: 'disabled', label: `땅은 최대 ${maxOwned}개까지 가질 수 있어요` };
  }
  if (myPoint !== undefined && myPoint < territory.toll) {
    return { kind: 'insufficient', label: '도전하기' };
  }
  return { kind: 'challenge', label: '도전하기' };
}

function SheetSkeleton() {
  return (
    <View className="gap-2xl">
      <View className="gap-sm">
        <Skeleton className="h-[28px] w-[160px] rounded-xs" />
        <Skeleton className="h-[17px] w-[120px] rounded-xs" />
      </View>
      <Skeleton className="h-[62px] w-full rounded-sm" />
      <Skeleton className="h-[66px] w-full rounded-sm" />
      <Skeleton className="h-[43px] w-full rounded-sm" />
    </View>
  );
}
