'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import MoreMenu from '@/components/common/ui/dropdown/more-menu';
import { Skeleton } from '@/components/common/ui/loading-skeleton';
import StudyActiveTicker from '@/components/common/ui/study-active-ticker';
import Tabs from '@/components/common/ui/tabs';
import ChannelSection from '@/components/discussion/channel/lounge-section';
import GroupStudyMemberList from '@/components/lists/study-member-list';
import InquirySection from '@/components/section/inquiry-section';
import MissionSection from '@/components/section/mission-section';
import PremiumStudyInfoSection from '@/components/section/premium-study-info-section';
import {
  isStudyTabValue,
  STUDY_DETAIL_TABS,
  type StudyTabValue,
} from '@/config/constants';
import { useAuthReady } from '@/features/auth/model/use-auth';
import { useGetGroupStudyMyStatus } from '@/hooks/queries/group-study-member-api';
import {
  useGetGroupStudyReviewAvailability,
  useGetGroupStudyReviewWritten,
} from '@/hooks/queries/group-study-review-api';
import {
  useCompleteGroupStudyMutation,
  useDeleteGroupStudyMutation,
  useGroupStudyDetailQuery,
} from '@/hooks/queries/use-study-query';
import { useToastStore } from '@/stores/use-toast-store';
import { useLeaderStore } from '@/stores/useLeaderStore';
import type {
  GroupStudyFullResponse,
  Leader,
} from '@/types/api/group-study.types';

const ConfirmDeleteModal = dynamic(
  () => import('@/components/common/modals/confirm-delete-modal'),
  { ssr: false },
);

const GroupStudyReviewModal = dynamic(
  () => import('@/components/common/modals/group-study-review-modal'),
  { ssr: false },
);

const StudyCompletionModal = dynamic(
  () => import('@/components/common/modals/study-completion-modal'),
  { ssr: false },
);

const GroupStudyFormModal = dynamic(
  () => import('@/components/common/modals/group-study-form-modal'),
  { ssr: false },
);

type ActionKey = 'end' | 'delete';

const DETAIL_CONTENT_WIDTH = 'w-full max-w-study-content px-400';

const MEMBER_ONLY_TABS = new Set(['members', 'lounge']);

const END_MODAL_CONTENT = (
  <>
    종료 후에는 더 이상 모집/활동이 불가합니다.
    <br />이 동작은 되돌릴 수 없습니다.
  </>
);

const DELETE_MODAL_CONTENT = (
  <>
    삭제 시 모든 데이터가 영구적으로 제거됩니다.
    <br />이 동작은 되돌릴 수 없습니다.
  </>
);

interface PremiumStudyDetailPageProps {
  groupStudyId: number;
  memberId?: number;
}

export default function PremiumStudyDetailPage({
  groupStudyId,
  memberId,
}: PremiumStudyDetailPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const setLeaderInfo = useLeaderStore((state) => state.setLeaderInfo);
  const showToast = useToastStore((state) => state.showToast);
  const [isPending, startTransition] = useTransition();
  const tabParam = searchParams.get('tab') ?? undefined;
  const requestedTab = isStudyTabValue(tabParam) ? tabParam : 'intro';

  const { data: studyDetail, isLoading } =
    useGroupStudyDetailQuery(groupStudyId);

  const leaderId = studyDetail?.basicInfo.leader.memberId;
  const leader = studyDetail?.basicInfo.leader;

  const isLeader = leaderId === memberId;
  const { data: authData } = useAuthReady();
  const isAdmin = authData?.roleIds.includes('ROLE_ADMIN') ?? false;
  const shouldFetchMyStatus = leaderId !== undefined && !isLeader;

  // 리더 정보를 Zustand store에 저장
  useEffect(() => {
    if (leader) {
      setLeaderInfo(leader as Leader);
    }
  }, [leader, setLeaderInfo]);
  const [confirmAction, setConfirmAction] = useState<ActionKey | null>(null);
  const [showStudyFormModal, setShowStudyFormModal] = useState<boolean>(false);

  const { data: myApplicationStatus, isLoading: isMyApplicationStatusLoading } =
    useGetGroupStudyMyStatus({
      groupStudyId,
      isLeader: !shouldFetchMyStatus,
    });

  // 후기 모달 — PARTICIPANT 스터디원에게 자동 표시 (날짜 계산은 백엔드 위임)
  const isParticipantMember = myApplicationStatus?.status === 'APPROVED';
  const isCompleted = studyDetail?.basicInfo?.status === 'COMPLETED';
  const shouldCheckAvailability =
    !!memberId && isParticipantMember && isCompleted;

  // 백엔드 realEndTime 기준으로 후기 작성 가능 여부 확인 (수동 완료 시나리오 대응)
  const { data: availability } = useGetGroupStudyReviewAvailability(
    groupStudyId,
    { enabled: shouldCheckAvailability },
  );

  const { data: reviewWritten } = useGetGroupStudyReviewWritten(groupStudyId, {
    enabled: shouldCheckAvailability && availability?.available === true,
  });

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const hasAutoOpenedReviewRef = useRef(false);

  useEffect(() => {
    if (
      shouldCheckAvailability &&
      availability?.available &&
      reviewWritten === false &&
      !hasAutoOpenedReviewRef.current
    ) {
      hasAutoOpenedReviewRef.current = true;
      setShowReviewModal(true);
    }
  }, [shouldCheckAvailability, availability, reviewWritten]);

  const { mutate: deleteGroupStudy } = useDeleteGroupStudyMutation();
  const { mutate: completeStudy } = useCompleteGroupStudyMutation();

  const handleEndStudy = () => {
    completeStudy(
      { groupStudyId },
      {
        onSuccess: () => {
          sendGTMEvent({
            event: 'premium_study_end',
            group_study_id: String(groupStudyId),
          });
          showToast('스터디가 종료되었습니다.');
          router.push('/premium-study');
        },
        onError: () => {
          showToast('스터디 종료에 실패하였습니다.', 'error');
        },
        onSettled: () => {
          setConfirmAction(null);
        },
      },
    );
  };

  const handleDeleteStudy = () => {
    deleteGroupStudy(
      { groupStudyId },
      {
        onSuccess: () => {
          sendGTMEvent({
            event: 'premium_study_delete',
            group_study_id: String(groupStudyId),
          });
          showToast('스터디가 삭제되었습니다.');
          router.push('/premium-study');
        },
        onError: () => {
          showToast('스터디 삭제에 실패하였습니다.', 'error');
        },
        onSettled: () => {
          setConfirmAction(null);
        },
      },
    );
  };

  const MODAL_CONFIG: Record<
    ActionKey,
    {
      title: string;
      content: React.ReactNode;
      confirmText: string;
      onConfirm: () => void;
    }
  > = {
    end: {
      title: '스터디를 종료하시겠어요?',
      content: END_MODAL_CONTENT,
      confirmText: '스터디 종료',
      onConfirm: handleEndStudy,
    },
    delete: {
      title: '스터디를 삭제하시겠어요?',
      content: DELETE_MODAL_CONTENT,
      confirmText: '스터디 삭제',
      onConfirm: handleDeleteStudy,
    },
  };

  // 참가자, 채널 탭 접근 가능 여부 = 스터디 참가자 또는 방장만 가능
  // KICKED 상태도 포함: 강퇴 후에도 기존 활동 내역 열람 보장
  const isMember =
    myApplicationStatus?.status === 'APPROVED' ||
    myApplicationStatus?.status === 'KICKED';

  const availableTabs = useMemo(
    () =>
      STUDY_DETAIL_TABS.map((tab) => {
        const locked =
          MEMBER_ONLY_TABS.has(tab.value) && !isLeader && !isMember;

        return {
          ...tab,
          locked,
          lockedTooltip: locked ? '스터디 가입하여 확인' : undefined,
        };
      }),
    [isLeader, isMember],
  );

  const activeTab = useMemo(() => {
    const hasAccessToRequestedTab = availableTabs.some(
      (tab) => tab.value === requestedTab,
    );

    return hasAccessToRequestedTab ? requestedTab : 'intro';
  }, [availableTabs, requestedTab]);

  useEffect(() => {
    const isAccessResolved =
      leaderId !== undefined &&
      (!shouldFetchMyStatus || !isMyApplicationStatusLoading);
    if (!isAccessResolved) {
      return;
    }

    const nextTabParam = activeTab === 'intro' ? undefined : activeTab;
    if (tabParam === nextTabParam) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    if (nextTabParam) {
      params.set('tab', nextTabParam);
    } else {
      params.delete('tab');
    }

    const nextQueryString = params.toString();
    router.replace(
      nextQueryString ? `${pathname}?${nextQueryString}` : pathname,
      {
        scroll: false,
      },
    );
  }, [
    activeTab,
    isMyApplicationStatusLoading,
    leaderId,
    pathname,
    router,
    searchParams,
    shouldFetchMyStatus,
    tabParam,
  ]);

  if (isLoading || !studyDetail) {
    return (
      <div className="flex w-full flex-col items-center">
        <div className="mt-500 w-full max-w-study-content px-400">
          <Skeleton className="mb-300 h-600 rounded-150" />
          <Skeleton className="mb-150 h-300 w-3/4" />
          <Skeleton className="h-200 w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center">
      {/* 후기 작성 모달 — availability API 기준 미작성 시 자동 오픈 */}
      {shouldCheckAvailability && availability?.available && studyDetail && (
        <GroupStudyReviewModal
          open={showReviewModal}
          onOpenChange={setShowReviewModal}
          groupStudyId={groupStudyId}
          detailInfo={studyDetail.detailInfo}
          basicInfo={studyDetail.basicInfo}
          onSubmitSuccess={() =>
            setTimeout(() => setShowCompletionModal(true), 300)
          }
        />
      )}
      <StudyCompletionModal
        open={showCompletionModal}
        onOpenChange={setShowCompletionModal}
      />
      <ConfirmDeleteModal
        open={confirmAction !== null}
        onOpenChange={() => setConfirmAction(null)}
        title={confirmAction ? MODAL_CONFIG[confirmAction].title : undefined}
        content={
          confirmAction ? MODAL_CONFIG[confirmAction].content : undefined
        }
        confirmText={
          confirmAction ? MODAL_CONFIG[confirmAction].confirmText : undefined
        }
        onConfirm={
          confirmAction ? MODAL_CONFIG[confirmAction].onConfirm : undefined
        }
      />
      <GroupStudyFormModal
        open={showStudyFormModal}
        mode="edit"
        groupStudyId={groupStudyId}
        classification="PREMIUM_STUDY"
        onOpenChange={(open) => setShowStudyFormModal(open)}
      />

      {/* 플로팅 정보 바 */}
      <div className={`mt-500 ${DETAIL_CONTENT_WIDTH}`}>
        <StudyActiveTicker
          approvedCount={studyDetail.basicInfo.approvedCount}
          maxMembersCount={studyDetail.basicInfo.maxMembersCount}
          startDate={studyDetail.basicInfo.startDate}
          viewCount={studyDetail.viewCount}
        />
      </div>
      <div
        className={`mb-500 flex ${DETAIL_CONTENT_WIDTH} items-start justify-between`}
      >
        <div className="flex w-full flex-col gap-150">
          <p className="font-designer-28b text-text-strong">
            {studyDetail?.detailInfo.title}
          </p>
          <p className="font-designer-18r text-text-default">
            {studyDetail?.detailInfo.summary}
          </p>
        </div>
        {isLeader && (
          <MoreMenu
            options={[
              {
                label: '스터디 수정하기',
                value: 'edit',
                onMenuClick: () => {
                  setShowStudyFormModal(true);
                },
              },
              {
                label: '스터디 종료',
                value: 'end',
                onMenuClick: () => setConfirmAction('end'),
              },
              {
                label: '스터디 삭제',
                value: 'delete',
                onMenuClick: () => setConfirmAction('delete'),
              },
            ]}
            iconSize={35}
          />
        )}
      </div>

      {/** 탭리스트 */}
      <Tabs
        className={DETAIL_CONTENT_WIDTH}
        tabs={availableTabs}
        activeTab={activeTab}
        onChange={(value: StudyTabValue) => {
          startTransition(() => {
            const params = new URLSearchParams(searchParams.toString());
            params.set('tab', value);
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
            sendGTMEvent({
              event: 'premium_study_tab_change',
              group_study_id: String(groupStudyId),
              tab: value,
            });
          });
        }}
      />
      <div
        className={cn(
          'transition-opacity duration-150',
          isPending && 'opacity-60',
        )}
      >
        {activeTab === 'intro' && (
          <PremiumStudyInfoSection
            study={studyDetail as GroupStudyFullResponse}
          />
        )}
        {activeTab === 'members' && (
          <GroupStudyMemberList
            groupStudyId={groupStudyId}
            leaderId={studyDetail.basicInfo.leader.memberId}
            myApplicationStatus={myApplicationStatus}
          />
        )}
        {activeTab === 'mission' && (
          <MissionSection
            groupStudyId={groupStudyId}
            isMember={isMember}
            isLeader={isLeader}
          />
        )}
        {activeTab === 'lounge' && (
          <ChannelSection
            groupStudyId={groupStudyId}
            memberId={memberId}
            myApplicationStatus={myApplicationStatus}
          />
        )}
        {activeTab === 'inquiry' && (
          <InquirySection
            groupStudyId={groupStudyId}
            isPremium
            isLeader={isLeader}
            isAdmin={isAdmin}
          />
        )}
      </div>
    </div>
  );
}
