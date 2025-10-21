'use client';

import { useApplicantsByStatusQuery } from '@/features/study/application/model/use-applicant-qeury';
import { useState } from 'react';

import MoreMenu from '@/shared/ui/dropdown/moreMenu';
import Tabs from '@/shared/ui/tabs';
import { useGroupStudyDetailQuery } from '../model/use-study-query';
import StudyInfoSection from './study-info-section';

export default function StudyDetailPage({ id: groupStudyId }: { id: number }) {
  const [active, setActive] = useState('intro');

  const tabs = [
    { label: '스터디 소개', value: 'intro' },
    { label: '참가자', value: 'members' },
    { label: '채널', value: 'channel' },
  ];

  const { data: studyDetail, isLoading } =
    useGroupStudyDetailQuery(groupStudyId);

  const { data: applicants } = useApplicantsByStatusQuery({
    groupStudyId,
    status: 'APPROVED',
  });

  if (isLoading) return;

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
      <Tabs tabs={tabs} activeTab={active} onChange={setActive} />
      {active === 'intro' && (
        <StudyInfoSection
          study={studyDetail!}
          applicants={applicants.pages[0]}
        />
      )}
      {active === 'members' && <div>참가자 목록</div>}
      {active === 'channel' && <div>채널 내용</div>}
    </div>
  );
}
