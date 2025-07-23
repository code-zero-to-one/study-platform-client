'use client';

import { useEffect, useState } from 'react';
import { getStatusBadge } from '@/features/study/ui/status-badge-map';
import { getCookie } from '@/shared/tanstack-query/cookie';
import UserAvatar from '@/shared/ui/avatar';
import StudyDoneModal from './study-done-modal';
import StudyReadyModal from './study-ready-modal';
import { useDailyStudyDetailQuery } from '../model/use-study-query';

export default function TodayStudyCard({ studyDate }: { studyDate: string }) {
  const [memberId, setMemberId] = useState<number | null>(null);

  useEffect(() => {
    const id = getCookie('memberId');
    setMemberId(id ? Number(id) : null);
  }, []);

  const { data: todayStudyData } = useDailyStudyDetailQuery(studyDate);

  if (!todayStudyData) return null;

  const isInterviewee = memberId === todayStudyData.intervieweeId;

  return (
    <section className="flex w-full flex-col gap-150">
      <div className="mb-4 flex items-start justify-between">
        <h3 className="font-bold-h5 text-text-strong">오늘의 스터디</h3>
        {memberId !== null &&
          (isInterviewee ? (
            <StudyReadyModal studyDate={studyDate} data={todayStudyData} />
          ) : (
            <StudyDoneModal studyDate={studyDate} data={todayStudyData} />
          ))}
      </div>

      <div className="mb-4 grid grid-cols-2 gap-100">
        <InfoBox
          label="스터디 조"
          value={`${todayStudyData.studySpaceId} 조`}
        />
        <InfoBox
          label="면접자"
          value={
            <div className="border-border-default bg-background-default flex items-center gap-100 rounded-full border px-100 py-50">
              <UserAvatar image={todayStudyData.interviewerImage} />
              <span className="font-designer-14m">
                {todayStudyData.interviewerName}
              </span>
            </div>
          }
        />
        <InfoBox label="오늘의 면접 주제" value={todayStudyData.subject} />
        <InfoBox
          label="진행 현황"
          value={getStatusBadge(todayStudyData.progressStatus)}
        />
      </div>

      <div className="rounded-100 bg-background-alternative flex flex-col gap-150 px-300 py-150">
        <div className="text-text-subtle font-designer-14r">피드백</div>
        <p className="leading-relaxed">{todayStudyData.feedback ?? '-'}</p>
      </div>
    </section>
  );

  function InfoBox({
    label,
    value,
  }: {
    label: string;
    value: React.ReactNode;
  }) {
    return (
      <div className="rounded-100 bg-background-alternative flex min-h-[64px] flex-row items-center justify-between gap-150 px-300 py-150">
        <span className="font-designer-14r text-text-subtle">{label}</span>
        <span className="font-designer-16m text-text-default">{value}</span>
      </div>
    );
  }
}
