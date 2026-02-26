'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import MoreMenu from '@/components/ui/dropdown/more-menu';
import StudyActiveTicker from '@/components/ui/study-active-ticker';
import Tabs from '@/components/ui/tabs';
import { STUDY_DETAIL_TABS, StudyTabValue } from '@/config/constants';
import {
  GroupStudyFullResponse,
  Leader,
} from '@/features/study/group/api/group-study-types';
import { useGetGroupStudyMyStatus } from '@/hooks/queries/group-study-member-api';
import { useToastStore } from '@/stores/use-toast-store';
import { useLeaderStore } from '@/stores/useLeaderStore';
import ChannelSection from '../../features/study/group/channel/ui/lounge-section';
import {
  useCompleteGroupStudyMutation,
  useDeleteGroupStudyMutation,
  useGroupStudyDetailQuery,
} from '../../features/study/group/model/use-study-query';
import ConfirmDeleteModal from '../../features/study/group/ui/confirm-delete-modal';
import GroupStudyFormModal from '../../features/study/group/ui/group-study-form-modal';
import GroupStudyMemberList from '../lists/study-member-list';
import InquirySection from '../section/inquiry-section';
import MissionSection from '../section/mission-section';
import PremiumStudyInfoSection from '../section/premium-study-info-section';

type ActionKey = 'end' | 'delete';

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
  const activeTab = (searchParams.get('tab') as StudyTabValue) || 'intro';

  const {
    data: studyDetail,
    isLoading,
    refetch: refetchStudyDetail,
  } = useGroupStudyDetailQuery(groupStudyId);

  const leaderId = studyDetail?.basicInfo.leader.memberId;

  const isLeader = leaderId === memberId;

  // 리더 정보를 Zustand store에 저장
  useEffect(() => {
    if (studyDetail?.basicInfo.leader) {
      setLeaderInfo(studyDetail.basicInfo.leader as Leader);
    }
  }, [studyDetail?.basicInfo.leader, setLeaderInfo]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [action, setAction] = useState<ActionKey | null>(null);
  const [showStudyFormModal, setShowStudyFormModal] = useState<boolean>(false);

  const { data: myApplicationStatus } = useGetGroupStudyMyStatus({
    groupStudyId,
    isLeader,
  });

  const { mutate: deleteGroupStudy } = useDeleteGroupStudyMutation();
  const { mutate: completeStudy } = useCompleteGroupStudyMutation();

  const ModalContent = {
    end: {
      title: '스터디를 종료하시겠어요?',
      content: (
        <>
          종료 후에는 더 이상 모집/활동이 불가합니다.
          <br />이 동작은 되돌릴 수 없습니다.
        </>
      ),
      confirmText: '스터디 종료',
      onConfirm: () => {
        completeStudy(
          { groupStudyId },
          {
            onSuccess: () => {
              sendGTMEvent({
                event: 'premium_study_end',
                group_study_id: String(groupStudyId),
              });
              showToast('스터디가 종료되었습니다.');
            },
            onSettled: () => {
              setShowModal(false);
              router.push('/premium-study');
            },
          },
        );
      },
    },
    delete: {
      title: '스터디를 삭제하시겠어요?',
      content: (
        <>
          삭제 시 모든 데이터가 영구적으로 제거됩니다.
          <br />이 동작은 되돌릴 수 없습니다.
        </>
      ),
      confirmText: '스터디 삭제',
      onConfirm: () => {
        deleteGroupStudy(
          { groupStudyId },
          {
            onSuccess: () => {
              sendGTMEvent({
                event: 'premium_study_delete',
                group_study_id: String(groupStudyId),
              });
              showToast('스터디가 삭제되었습니다.');
            },
            onError: () => {
              showToast('스터디 삭제에 실패하였습니다.', 'error');
            },
            onSettled: () => {
              refetchStudyDetail().catch(() => {});
              router.push('/premium-study');
              setShowModal(false);
            },
          },
        );
      },
    },
  };

  // 참가자, 채널 탭 접근 가능 여부 = 스터디 참가자 또는 방장만 가능
  const isMember =
    myApplicationStatus?.status === 'APPROVED' ||
    myApplicationStatus?.status === 'KICKED';

  if (isLoading || !studyDetail) {
    return <div>로딩중...</div>;
  }

  return (
    <div className="flex h-full w-full flex-col items-center">
      <ConfirmDeleteModal
        open={showModal}
        onOpenChange={() => setShowModal(!showModal)}
        title={ModalContent[action]?.title}
        content={ModalContent[action]?.content}
        confirmText={ModalContent[action]?.confirmText}
        onConfirm={ModalContent[action]?.onConfirm}
      />
      <GroupStudyFormModal
        open={showStudyFormModal}
        mode="edit"
        groupStudyId={groupStudyId}
        classification="PREMIUM_STUDY"
        onOpenChange={() => setShowStudyFormModal(!showStudyFormModal)}
      />

      {/* 플로팅 정보 바 */}
      <div className="mt-500 w-[1164px]">
        <StudyActiveTicker
          approvedCount={studyDetail.basicInfo.approvedCount}
          maxMembersCount={studyDetail.basicInfo.maxMembersCount}
          startDate={studyDetail.basicInfo.startDate}
        />
      </div>
      <div className="mb-500 flex w-[1164px] items-start justify-between">
        <div className="flex w-full flex-col gap-150">
          <p className="font-designer-28b text-[#181D27]">
            {studyDetail?.detailInfo.title}
          </p>
          <p className="font-designer-18r text-[#252B37]">
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
                onMenuClick: () => {
                  setAction('end');
                  setShowModal(true);
                },
              },
              {
                label: '스터디 삭제',
                value: 'delete',
                onMenuClick: () => {
                  setAction('delete');
                  setShowModal(true);
                },
              },
            ]}
            iconSize={35}
          />
        )}
      </div>

      {/** 탭리스트 */}
      <Tabs
        className="w-[1164px]"
        tabs={STUDY_DETAIL_TABS.filter(
          (tab) => tab.value === 'intro' || isLeader || isMember,
        )}
        activeTab={activeTab}
        onChange={(value: StudyTabValue) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set('tab', value);
          router.push(`${pathname}?${params.toString()}`, { scroll: false });
          sendGTMEvent({
            event: 'premium_study_tab_change',
            group_study_id: String(groupStudyId),
            tab: value,
          });
        }}
      />
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
        <MissionSection groupStudyId={groupStudyId} />
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
        />
      )}
    </div>
  );
}
