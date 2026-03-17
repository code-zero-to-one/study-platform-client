'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import Button from '@/components/common/ui/button';
import MoreMenu from '@/components/common/ui/dropdown/more-menu';
import Tabs from '@/components/common/ui/tabs';
import ChannelSection from '@/components/discussion/channel/lounge-section';
import {
  isStudyTabValue,
  STUDY_DETAIL_TABS,
  type StudyTabValue,
} from '@/config/constants';
import { useAuthReady } from '@/features/auth/model/use-auth';
import { useGetGroupStudyMyStatus } from '@/hooks/queries/group-study-member-api';
import { useGetGroupStudyReviewWritten } from '@/hooks/queries/group-study-review-api';
import {
  useCompleteGroupStudyMutation,
  useDeleteGroupStudyMutation,
  useGroupStudyDetailQuery,
} from '@/hooks/queries/use-study-query';
import { useToastStore } from '@/stores/use-toast-store';
import { useLeaderStore } from '@/stores/useLeaderStore';
import type { Leader } from '@/types/api/group-study.types';

import StudyActiveTicker from '../common/ui/study-active-ticker';
import GroupStudyMemberList from '../lists/study-member-list';
import StudyInfoSection from '../section/group-study-info-section';
import InquirySection from '../section/inquiry-section';
import MissionSection from '../section/mission-section';

const ConfirmDeleteModal = dynamic(
  () => import('@/components/common/modals/confirm-delete-modal'),
  { ssr: false },
);

const GroupStudyFormModal = dynamic(
  () => import('@/components/common/modals/group-study-form-modal'),
  { ssr: false },
);

const GroupStudyReviewModal = dynamic(
  () => import('@/components/common/modals/group-study-review-modal'),
  { ssr: false },
);

type ActionKey = 'end' | 'delete'; // 필요 시 'edit' 등 추가

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

interface StudyDetailPageProps {
  groupStudyId: number;
  memberId?: number;
}

export default function StudyDetailPage({
  groupStudyId,
  memberId,
}: StudyDetailPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const setLeaderInfo = useLeaderStore((state) => state.setLeaderInfo);
  const showToast = useToastStore((state) => state.showToast);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const hasAutoOpenedReviewModal = useRef(false);

  const { data: studyDetail, isLoading } =
    useGroupStudyDetailQuery(groupStudyId);

  const { isStudyEnded, isWithinReviewWindow } = useMemo(() => {
    const endDateStr = studyDetail?.basicInfo?.endDate;
    if (!endDateStr)
      return { isStudyEnded: false, isWithinReviewWindow: false };

    const endDate = dayjs(endDateStr).startOf('day');
    const today = dayjs().startOf('day');
    const isEnded = today.isAfter(endDate); // today > endDate (종료일 익일부터)
    const diffDays = today.diff(endDate, 'day');

    return {
      isStudyEnded: isEnded,
      isWithinReviewWindow: isEnded && diffDays <= 7,
    };
  }, [studyDetail?.basicInfo?.endDate]);

  const leaderId = studyDetail?.basicInfo.leader.memberId;

  const isLeader = leaderId === memberId;

  const isStudyCompleted = studyDetail?.basicInfo?.status === 'COMPLETED';

  const { data: myApplicationStatus, isLoading: isMyStatusLoading } =
    useGetGroupStudyMyStatus({
      groupStudyId,
      isLeader,
    });

  const isApprovedMember = myApplicationStatus?.status === 'APPROVED';

  // 수동 종료(COMPLETED) 시: endDate 기반 윈도우 체크 생략 (백엔드에서 7일 검증)
  // 기간 만료 종료 시: 기존 isWithinReviewWindow(endDate 기준 7일) 유지
  const canWriteReview = isStudyCompleted
    ? isApprovedMember
    : isWithinReviewWindow && isApprovedMember;

  const { data: hasWrittenReview } = useGetGroupStudyReviewWritten(
    groupStudyId,
    {
      enabled: canWriteReview,
    },
  );

  const leader = studyDetail?.basicInfo.leader;

  useEffect(() => {
    if (
      canWriteReview &&
      hasWrittenReview === false &&
      !isLoading &&
      !isMyStatusLoading &&
      !hasAutoOpenedReviewModal.current
    ) {
      hasAutoOpenedReviewModal.current = true;
      setShowReviewModal(true);
    }
  }, [canWriteReview, hasWrittenReview, isLoading, isMyStatusLoading]);

  const tabParam = searchParams.get('tab') ?? undefined;

  const { data: authData } = useAuthReady();
  const isAdmin = authData?.roleIds.includes('ROLE_ADMIN') ?? false;

  // 리더 정보를 Zustand store에 저장
  useEffect(() => {
    if (leader) {
      setLeaderInfo(leader as Leader);
    }
  }, [leader, setLeaderInfo]);
  const [confirmAction, setConfirmAction] = useState<ActionKey | null>(null);
  const [showStudyFormModal, setShowStudyFormModal] = useState<boolean>(false);

  const { mutate: deleteGroupStudy } = useDeleteGroupStudyMutation();
  const { mutate: completeStudy } = useCompleteGroupStudyMutation();

  const handleEndStudy = () => {
    completeStudy(
      { groupStudyId },
      {
        onSuccess: () => {
          sendGTMEvent({
            event: 'group_study_end',
            group_study_id: String(groupStudyId),
          });
          showToast('스터디가 종료되었습니다.');
          router.push('/group-study');
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
            event: 'group_study_delete',
            group_study_id: String(groupStudyId),
          });
          showToast('스터디가 삭제되었습니다.');
          router.push('/group-study');
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
    const requested = isStudyTabValue(tabParam) ? tabParam : 'intro';
    const matched = availableTabs.find((tab) => tab.value === requested);

    return matched && !matched.locked ? requested : 'intro';
  }, [availableTabs, tabParam]);

  // 잠긴 탭으로 직접 진입 시 URL 정규화 (새로고침·공유·뒤로가기 대응)
  useEffect(() => {
    // 권한 판단이 완료되기 전(로딩 중)에는 replace 금지 → flicker 방지
    if (isLoading || isMyStatusLoading) return;

    const currentParam = tabParam ?? undefined;
    const resolvedParam = activeTab === 'intro' ? undefined : activeTab;
    if (currentParam === resolvedParam) return;

    const newUrl = resolvedParam
      ? `${pathname}?tab=${resolvedParam}`
      : pathname;
    router.replace(newUrl, { scroll: false });
  }, [activeTab, isLoading, isMyStatusLoading, pathname, router, tabParam]);

  if (isLoading || !studyDetail) {
    return null;
  }

  return (
    <div className="flex h-full w-full flex-col items-center">
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
        onOpenChange={() => setShowStudyFormModal(!showStudyFormModal)}
      />
      <GroupStudyReviewModal
        open={showReviewModal}
        onOpenChange={setShowReviewModal}
        groupStudyId={groupStudyId}
      />
      {/* 플로팅 정보 바 */}
      <div className={`mt-500 ${DETAIL_CONTENT_WIDTH}`}>
        <StudyActiveTicker
          approvedCount={studyDetail.basicInfo.approvedCount}
          remainingSlot={studyDetail.basicInfo.remainingSlots}
          maxMembersCount={studyDetail.basicInfo.maxMembersCount}
          startDate={studyDetail.basicInfo.startDate}
          viewCount={studyDetail.viewCount}
        />
      </div>
      <div
        className={`mb-500 flex ${DETAIL_CONTENT_WIDTH} items-start justify-between`}
      >
        <div className="flex w-full flex-col gap-150">
          <div className="font-designer-28b flex justify-between text-text-strong">
            {studyDetail?.detailInfo.title}
          </div>
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
              ...(!isStudyCompleted
                ? [
                    {
                      label: '스터디 종료',
                      value: 'end',
                      onMenuClick: () => setConfirmAction('end'),
                    },
                  ]
                : []),
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

      {/** 후기 작성 CTA — 종료 후 7일 이내 미작성 참가자에게 노출 */}
      {canWriteReview && hasWrittenReview === false && (
        <div
          className={`mb-400 ${DETAIL_CONTENT_WIDTH} flex items-center justify-between rounded-150 bg-fill-neutral-subtle-default px-400 py-300`}
        >
          <p className="font-designer-14m text-text-default">
            스터디 경험 후기를 남겨주세요 (종료 후 7일 이내)
          </p>
          <Button
            color="primary"
            size="small"
            onClick={() => setShowReviewModal(true)}
          >
            후기 남기기
          </Button>
        </div>
      )}

      {/** 탭리스트 */}
      <Tabs
        className={DETAIL_CONTENT_WIDTH}
        tabs={availableTabs}
        activeTab={activeTab}
        onChange={(value: StudyTabValue) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set('tab', value);
          router.push(`${pathname}?${params.toString()}`, { scroll: false });

          sendGTMEvent({
            event: 'group_study_tab_change',
            group_study_id: String(groupStudyId),
            tab: value,
          });
        }}
      />
      {activeTab === 'intro' && (
        <StudyInfoSection
          study={studyDetail}
          isLeader={isLeader}
          isMember={isMember}
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
          isLeader={isLeader}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
