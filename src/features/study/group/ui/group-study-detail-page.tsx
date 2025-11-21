'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import MoreMenu from '@/components/ui/dropdown/more-menu';
import Tabs from '@/components/ui/tabs';
import { useLeaderStore } from '@/stores/useLeaderStore';
import ConfirmDeleteModal from './confirm-delete-modal';
import GroupStudyMemberList from './group-study-member-list';
import StudyInfoSection from './study-info-section';
import { GroupStudyDetailResponse, Leader } from '../api/group-study-types';
import ChannelSection from '../channel/ui/channel-section';
import { useGroupStudyMyStatusQuery } from '../model/use-group-study-my-status-query';
import {
  useCompleteGroupStudyMutation,
  useDeleteGroupStudyMutation,
} from '../model/use-study-query';

type ActiveTab = 'intro' | 'members' | 'channel';

type ActionKey = 'end' | 'delete'; // 필요 시 'edit' 등 추가

interface StudyDetailPageProps {
  groupStudyId: number;
  studyDetail: GroupStudyDetailResponse;
  leader: Leader;
  memberId?: number;
}

const TABS = [
  { label: '스터디 소개', value: 'intro' },
  { label: '참가자', value: 'members' },
  { label: '채널', value: 'channel' },
];

export default function StudyDetailPage({
  groupStudyId,
  studyDetail,
  leader,
  memberId,
}: StudyDetailPageProps) {
  const router = useRouter();

  const isLeader = leader.memberId === memberId;

  const [active, setActive] = useState<ActiveTab>('intro');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [action, setAction] = useState<ActionKey | null>(null);

  const setLeaderInfo = useLeaderStore((s) => s.setLeaderInfo);

  const { data: myApplicationStatus } = useGroupStudyMyStatusQuery({
    groupStudyId,
    isLeader,
  });

  useEffect(() => {
    setLeaderInfo(leader);
  }, [leader, setLeaderInfo]);

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
                event: 'group_study_end',
                group_study_id: String(groupStudyId),
              });
              alert('스터디가 종료되었습니다.');
            },
            onSettled: () => {
              setShowModal(false);
              router.push('/study');
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
                event: 'group_study_delete',
                group_study_id: String(groupStudyId),
              });
              alert('스터디가 삭제되었습니다.');
            },
            onError: () => {
              alert('스터디 삭제에 실패하였습니다.');
            },
            onSettled: () => {
              router.push('/study');
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

  return (
    <div className="m-auto flex w-full max-w-[1164px] flex-col gap-400 py-500">
      <ConfirmDeleteModal
        open={showModal}
        onOpenChange={() => setShowModal(!showModal)}
        title={ModalContent[action]?.title}
        content={ModalContent[action]?.content}
        confirmText={ModalContent[action]?.confirmText}
        onConfirm={ModalContent[action]?.onConfirm}
      />

      <div className="flex w-full items-start justify-between">
        <div className="flex w-full flex-col gap-150">
          <p className="font-designer-28b text-[#181D27]">
            {studyDetail?.detailInfo.title}
          </p>
          <p className="font-designer-18r text-[#252B37]">
            {studyDetail?.detailInfo.summary}
          </p>
        </div>
        {memberId === studyDetail.basicInfo.leader.memberId && (
          <MoreMenu
            options={[
              {
                label: '스터디 수정하기',
                value: 'edit',
                onMenuClick: () => {},
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
        tabs={TABS.filter(
          (tab) => tab.value === 'intro' || isLeader || isMember,
        )}
        activeTab={active}
        onChange={(value: ActiveTab) => {
          setActive(value);
          sendGTMEvent({
            event: 'group_study_tab_change',
            group_study_id: String(groupStudyId),
            tab: value,
          });
        }}
      />
      {active === 'intro' && (
        <StudyInfoSection
          study={studyDetail}
          memberId={memberId}
          groupStudyId={groupStudyId}
          isLeader={isLeader}
        />
      )}
      {active === 'members' && (
        <GroupStudyMemberList
          groupStudyId={groupStudyId}
          leaderId={studyDetail.basicInfo.leader.memberId}
          myApplicationStatus={myApplicationStatus}
        />
      )}
      {active === 'channel' && (
        <ChannelSection
          groupStudyId={groupStudyId}
          memberId={memberId}
          myApplicationStatus={myApplicationStatus}
        />
      )}
    </div>
  );
}
