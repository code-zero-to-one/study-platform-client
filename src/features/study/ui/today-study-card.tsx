'use client';

import { useEffect, useState } from 'react';
import UserProfileModal from '@/features/my-page/ui/user-profile-modal';
import { getStatusBadge } from '@/features/study/ui/status-badge-map';
import { getCookie } from '@/shared/tanstack-query/cookie';
// TODO: FSD 의 import 바운더리를 넘어서 import 해야하는데,
// 해당 UI를 shared 등으로 빼던지 수정 필요
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

  const matchedUserId = isInterviewee
    ? todayStudyData.interviewerId
    : todayStudyData.intervieweeId;

  const matchedUserImage = isInterviewee
    ? todayStudyData.interviewerImage
    : todayStudyData.intervieweeImage;

  const matchedUsername = isInterviewee
    ? todayStudyData.interviewerName
    : todayStudyData.intervieweeName;

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
        <InfoBox label="스터디 조">
          {`${todayStudyData.studySpaceId} 조`}
        </InfoBox>
        <InfoBox label={isInterviewee ? '면접관' : '면접자'}>
          <UserProfileModal
            memberId={matchedUserId}
            trigger={
              <div className="border-border-default bg-background-default flex items-center gap-100 rounded-full border px-100 py-50">
                <UserAvatar image={matchedUserImage} />
                <span id="testuuiie" className="font-designer-14m">
                  {matchedUsername}
                </span>
              </div>
            }
          />
        </InfoBox>
        <InfoBox label="오늘의 면접 주제">{todayStudyData.subject}</InfoBox>
        <InfoBox label="진행 현황">
          {getStatusBadge(todayStudyData.progressStatus ?? 'PENDING')}
        </InfoBox>
      </div>

      <div className="rounded-100 bg-background-alternative flex flex-col gap-150 px-300 py-150">
        <div className="text-text-subtle font-designer-14r">피드백</div>
        <p className="leading-relaxed">{todayStudyData.feedback ?? '-'}</p>
      </div>
    </section>
  );

  function InfoBox({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) {
    return (
      <div className="rounded-100 bg-background-alternative flex min-h-[64px] flex-row items-center justify-between gap-150 px-300 py-150">
        <span className="font-designer-14r text-text-subtle">{label}</span>
        <span className="font-designer-16m text-text-default">{children}</span>
      </div>
    );
  }
}
