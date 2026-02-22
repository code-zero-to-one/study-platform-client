'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import { MessageCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import InquiryModal from '@/components/modals/inquiry-modal';
import MoreMenu from '@/components/ui/dropdown/more-menu';
import FloatingInfoBar from '@/components/ui/floating-info-bar';
import Tabs from '@/components/ui/tabs';
import { STUDY_DETAIL_TABS, StudyTabValue } from '@/config/constants';
import { useGetGroupStudyMyStatus } from '@/hooks/queries/group-study-member-api';
import { useToastStore } from '@/stores/use-toast-store';
import { useLeaderStore } from '@/stores/useLeaderStore';
import { Leader } from '../../features/study/group/api/group-study-types';
import ChannelSection from '../../features/study/group/channel/ui/lounge-section';

import {
  useCompleteGroupStudyMutation,
  useDeleteGroupStudyMutation,
  useGroupStudyDetailQuery,
} from '../../features/study/group/model/use-study-query';
import ConfirmDeleteModal from '../../features/study/group/ui/confirm-delete-modal';
import GroupStudyFormModal from '../../features/study/group/ui/group-study-form-modal';
import GroupStudyMemberList from '../lists/study-member-list';
import StudyInfoSection from '../section/group-study-info-section';
import InquirySection from '../section/inquiry-section';
import LoungePlaceholder from '../section/lounge-placeholder';
import MissionSection from '../section/mission-section';

type ActionKey = 'end' | 'delete'; // 필요 시 'edit' 등 추가

interface StudyDetailPageProps {
  groupStudyId: number;
  memberId?: number;
}

export default function StudyDetailPage({
  groupStudyId,
  memberId,
}: StudyDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setLeaderInfo = useLeaderStore((state) => state.setLeaderInfo);
  const showToast = useToastStore((state) => state.showToast);

  const tabFromUrl = searchParams.get('tab') as StudyTabValue | null;

  const { data: studyDetail, isLoading } =
    useGroupStudyDetailQuery(groupStudyId);

  const leaderId = studyDetail?.basicInfo.leader.memberId;

  const isLeader = leaderId === memberId;

  // 리더 정보를 Zustand store에 저장
  useEffect(() => {
    if (studyDetail?.basicInfo.leader) {
      setLeaderInfo(studyDetail.basicInfo.leader as Leader);
    }
  }, [studyDetail?.basicInfo.leader, setLeaderInfo]);

  const [active, setActive] = useState<StudyTabValue>(tabFromUrl || 'intro');

  useEffect(() => {
    const t = searchParams.get('tab') as StudyTabValue | null;
    if (t) setActive(t);
  }, [searchParams]);

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
              setShowModal(false);
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
              showToast('스터디가 삭제되었습니다.');
              router.push('/group-study');
            },
            onError: () => {
              showToast('스터디 삭제에 실패하였습니다.', 'error');
            },
            onSettled: () => {
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
        onOpenChange={() => setShowStudyFormModal(!showStudyFormModal)}
      />

      {/* 플로팅 정보 바 */}
      <div className="mt-500 w-[1164px]">
        <FloatingInfoBar
          currentViewers={12}
          currentMembers={studyDetail.basicInfo.approvedCount ?? 0}
          maxMembers={studyDetail.basicInfo.maxMembersCount}
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
        tabs={STUDY_DETAIL_TABS.map((tab) => {
          // 비회원/미가입자에게 참가자·라운지는 locked 상태로 표시
          const isLocked =
            !isLeader &&
            !isMember &&
            (tab.value === 'members' || tab.value === 'lounge');

          return {
            ...tab,
            locked: isLocked,
            tooltip: isLocked ? '스터디 가입하여 확인' : undefined,
          };
        })}
        activeTab={active}
        onChange={(value: StudyTabValue) => {
          setActive(value);

          // 탭 변경 시 URL 파라미터 초기화 및 탭 값 설정
          router.replace(`?tab=${value}`);

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
          onMissionClick={(missionId) => {
            setActive('mission');
            const params = new URLSearchParams(searchParams.toString());
            params.set('tab', 'mission');
            params.set('missionId', String(missionId));
            router.replace(`?${params.toString()}`);
          }}
        />
      )}
      {active === 'members' && (
        <GroupStudyMemberList
          groupStudyId={groupStudyId}
          leaderId={studyDetail.basicInfo.leader.memberId}
          myApplicationStatus={myApplicationStatus}
        />
      )}

      {active === 'mission' && (
        <MissionSection
          groupStudyId={groupStudyId}
          isMember={isLeader || isMember}
        />
      )}
      {active === 'lounge' &&
        (isLeader || isMember ? (
          <ChannelSection
            groupStudyId={groupStudyId}
            memberId={memberId}
            myApplicationStatus={myApplicationStatus}
          />
        ) : (
          <LoungePlaceholder />
        ))}
      {active === 'inquiry' && (
        <InquirySection
          studyId={groupStudyId}
          studyTitle={studyDetail?.detailInfo.title || ''}
          currentUserId={memberId}
          isMentor={isLeader}
          isAdmin={false}
        />
      )}

      {/* 플로팅 문의하기 버튼 */}
      <InquiryModal
        studyId={groupStudyId}
        studyTitle={studyDetail?.detailInfo.title || ''}
        isGroupStudy={true}
        onRedirectToInquiry={() => {
          setActive('inquiry');
          router.replace('?tab=inquiry');
        }}
        trigger={
          <button
            className="fixed right-600 bottom-600 z-50 flex items-center gap-100 rounded-full bg-[#FF4C61] px-300 py-200 shadow-lg transition-all hover:bg-[#E63950] hover:shadow-xl"
            aria-label="스터디 문의하기"
          >
            <MessageCircle className="h-200 w-200 text-white" />
            <span className="font-designer-16b text-white">
              스터디 문의하기
            </span>
          </button>
        }
      />
    </div>
  );
}
