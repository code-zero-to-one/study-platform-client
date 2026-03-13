'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import MoreMenu from '@/components/common/ui/dropdown/more-menu';
import Tabs from '@/components/common/ui/tabs';
import ChannelSection from '@/components/discussion/channel/lounge-section';
import {
  isStudyTabValue,
  STUDY_DETAIL_TABS,
  type StudyTabValue,
} from '@/config/constants';
import { useAuthReady } from '@/hooks/common/use-auth';
import { useGetGroupStudyMyStatus } from '@/hooks/queries/group-study-member-api';
import {
  useCompleteGroupStudyMutation,
  useDeleteGroupStudyMutation,
  useGroupStudyDetailQuery,
} from '@/hooks/queries/use-study-query';
import { useToastStore } from '@/stores/use-toast-store';
import { useLeaderStore } from '@/stores/useLeaderStore';
import { Leader } from '@/types/api/group-study.types';

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

type ActionKey = 'end' | 'delete'; // 필요 시 'edit' 등 추가

const DETAIL_CONTENT_WIDTH = 'w-[1164px]';
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

  const tabParam = searchParams.get('tab') ?? undefined;

  const { data: studyDetail, isLoading } =
    useGroupStudyDetailQuery(groupStudyId);

  const leaderId = studyDetail?.basicInfo.leader.memberId;
  const leader = studyDetail?.basicInfo.leader;

  const isLeader = leaderId === memberId;

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

  const { data: myApplicationStatus } = useGetGroupStudyMyStatus({
    groupStudyId,
    isLeader,
  });

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
      STUDY_DETAIL_TABS.map((tab) => ({
        ...tab,
        locked: MEMBER_ONLY_TABS.has(tab.value) && !isLeader && !isMember,
      })),
    [isLeader, isMember],
  );

  const activeTab = useMemo(() => {
    const requested = isStudyTabValue(tabParam) ? tabParam : 'intro';
    const matched = availableTabs.find((tab) => tab.value === requested);

    return matched && !matched.locked ? requested : 'intro';
  }, [availableTabs, tabParam]);

  if (isLoading || !studyDetail) {
    return <div>로딩중...</div>;
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
