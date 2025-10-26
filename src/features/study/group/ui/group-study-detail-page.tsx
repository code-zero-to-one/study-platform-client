'use client';

import { useState } from 'react';

import MoreMenu from '@/shared/ui/dropdown/more-menu';
import Tabs from '@/shared/ui/tabs';
import ConfirmDeleteModal from './confirm-delete-modal';
import StudyInfoSection from './study-info-section';
import ChannelSection from '../channel/ui/channel-section';
import { useGroupStudyDetailQuery } from '../model/use-study-query';

type ActiveTab = 'intro' | 'members' | 'channel';

type ActionKey = 'end' | 'delete'; // 필요 시 'edit' 등 추가

export default function StudyDetailPage({ id: groupStudyId }: { id: number }) {
  const [active, setActive] = useState<ActiveTab>('intro');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [action, setAction] = useState<ActionKey | null>(null);

  const tabs = [
    { label: '스터디 소개', value: 'intro' },
    { label: '참가자', value: 'members' },
    { label: '채널', value: 'channel' },
  ];

  const { data: studyDetail, isLoading } =
    useGroupStudyDetailQuery(groupStudyId);

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
        // deleteStudy({ groupStudyId }, { onSuccess: () => setShowModal(false) });
        console.log('스터디 삭제 요청:', groupStudyId);
        setShowModal(false);
      },
    },
  };

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
        <MoreMenu
          options={[
            { label: '스터디 수정하기', value: 'edit', onMenuClick: () => {} },
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
      </div>

      {/** 탭리스트 */}
      <Tabs
        tabs={tabs}
        activeTab={active}
        onChange={(value: ActiveTab) => setActive(value)}
      />
      {active === 'intro' && (
        <StudyInfoSection study={studyDetail!} groupStudyId={groupStudyId} />
      )}
      {active === 'members' && <div>참가자 목록</div>}
      {active === 'channel' && (
        <ChannelSection
          groupStudyId={groupStudyId}
          leader={studyDetail.basicInfo.leader}
        />
      )}
    </div>
  );
}
