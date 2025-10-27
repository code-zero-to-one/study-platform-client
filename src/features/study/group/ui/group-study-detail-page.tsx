'use client';

import { useState } from 'react';

import { getCookie } from '@/shared/tanstack-query/cookie';
import MoreMenu from '@/shared/ui/dropdown/more-menu';
import Tabs from '@/shared/ui/tabs';
import GroupStudyMemberList from './group-study-member-list';
import StudyInfoSection from './study-info-section';
import { useGroupStudyMyStatusQuery } from '../model/use-group-study-my-status-query';
import { useGroupStudyDetailQuery } from '../model/use-study-query';

type ActiveTab = 'intro' | 'members' | 'channel';

export default function StudyDetailPage({ id: groupStudyId }: { id: number }) {
  const [active, setActive] = useState<ActiveTab>('intro');

  const tabs = [
    { label: '스터디 소개', value: 'intro' },
    { label: '참가자', value: 'members' },
    { label: '채널', value: 'channel' },
  ];

  const { data: studyDetail, isLoading } =
    useGroupStudyDetailQuery(groupStudyId);
  const { data: myStatus } = useGroupStudyMyStatusQuery(groupStudyId);

  if (isLoading) return;

  // 참가자, 채널 탭 접근 가능 여부 = 스터디 참가자 또는 방장만 가능
  const isLeader =
    studyDetail.basicInfo.leader.memberId === Number(getCookie('memberId'));
  const isMember =
    myStatus?.status === 'APPROVED' || myStatus?.status === 'KICKED';

  return (
    <div className="m-auto flex w-full max-w-[1164px] flex-col gap-400 py-500">
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
            { label: '수정하기', value: 'edit', onMenuClick: () => {} },
            { label: '삭제하기', value: 'remove', onMenuClick: () => {} },
          ]}
        />
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
        <GroupStudyMemberList groupStudyId={groupStudyId} />
      )}
      {active === 'channel' && <div>채널 내용</div>}
    </div>
  );
}
