'use client';

import { useState } from 'react';
import { useUser } from '@/features/auth/model/use-user';
import ConfirmDeleteModal from './confirm-delete-modal';
import ChannelSection from '../channel/ui/channel-section';
import {
  useDeleteGroupStudyMutation,
  useGroupStudyDetailQuery,
} from '../model/use-study-query';
import { getCookie } from '@/shared/tanstack-query/cookie';
import MoreMenu from '@/shared/ui/dropdown/more-menu';
import Tabs from '@/shared/ui/tabs';
import GroupStudyMemberList from './group-study-member-list';
import StudyInfoSection from './study-info-section';
import { useGroupStudyMyStatusQuery } from '../model/use-group-study-my-status-query';
import { useGroupStudyDetailQuery } from '../model/use-study-query';

type ActiveTab = 'intro' | 'members' | 'channel';

type ActionKey = 'end' | 'delete'; // 필요 시 'edit' 등 추가

export default function StudyDetailPage({ id: groupStudyId }: { id: number }) {
  const [active, setActive] = useState<ActiveTab>('intro');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [action, setAction] = useState<ActionKey | null>(null);
  const { userId } = useUser();

  const tabs = [
    { label: '스터디 소개', value: 'intro' },
    { label: '참가자', value: 'members' },
    { label: '채널', value: 'channel' },
  ];

  const { mutate: deleteGroupStduy } = useDeleteGroupStudyMutation();

  const { data: studyDetail, isLoading } =
    useGroupStudyDetailQuery(groupStudyId);
  const { data: myStatus } = useGroupStudyMyStatusQuery(groupStudyId);

  console.log('studyDetail', studyDetail);

  if (isLoading) return;


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
        // endStudy({ groupStudyId }, { onSuccess: () => setShowModal(false) });
        console.log('스터디 종료 요청:', groupStudyId);
        setShowModal(false);
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
        deleteGroupStduy(
          { groupStudyId },
          { onSuccess: () => setShowModal(false) },
        );
        console.log('스터디 삭제 요청:', groupStudyId);
        setShowModal(false);
      },
    },
  };

  // 참가자, 채널 탭 접근 가능 여부 = 스터디 참가자 또는 방장만 가능
  const isLeader =
    studyDetail.basicInfo.leader.memberId === Number(getCookie('memberId'));
  const isMember =
    myStatus?.status === 'APPROVED' || myStatus?.status === 'KICKED';

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
        {userId === studyDetail.basicInfo.leader.memberId && (
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
            size={35}
          />
        )}
      </div>

      {/** 탭리스트 */}
      <Tabs
        tabs={tabs.filter(
          (tab) => tab.value === 'intro' || isLeader || isMember,
        )}
        activeTab={active}
        onChange={(value: ActiveTab) => setActive(value)}
      />
      {active === 'intro' && (
        <StudyInfoSection study={studyDetail!} groupStudyId={groupStudyId} />
      )}
   {active === 'members' && (
        <GroupStudyMemberList
          groupStudyId={groupStudyId}
          leaderId={studyDetail.basicInfo.leader.memberId}
        />
      )}
      {active === 'channel' && (
        <ChannelSection
          groupStudyId={groupStudyId}
          leader={studyDetail.basicInfo.leader}
        />
      )}
    </div>
  );
}
