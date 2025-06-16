'use client';

import { useState } from 'react';
import { useDailyStudyDetailQuery } from '@/features/study/model/use-study-query';
import UserAvatar from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import TodayStudyModal from './today-study-modal';
import { StudyProgressStatus } from '../api/types';

interface Props {
  date: Date;
}

const statusBadgeMap: Partial<Record<StudyProgressStatus, React.ReactNode>> = {
  BEFORE_PROGRESSED: <Badge color="default">시작 전</Badge>,
  PENDING: <Badge color="incomplete">보류</Badge>,
  IN_PROGRESS: <Badge color="incomplete">진행중</Badge>,
  COMPLETE: <Badge color="completed">완료</Badge>,
  ABSENT: <Badge color="incomplete">불참</Badge>,
};

export default function TodayStudyCard({ date }: Props) {
  const [mode] = useState<'ready' | 'done'>('ready');

  const dailyId = 1; // 일단 하드코딩, 나중에 useParams나 Zustand로 대체 가능
  const { data, isLoading, error } = useDailyStudyDetailQuery(dailyId);

  if (isLoading) return <div>로딩 중...</div>;
  if (error || !data) return <div>에러 발생</div>;

  return (
    <section className='w-full flex flex-col gap-150'>
      <div className='flex justify-between items-start mb-4'>
        <h3 className='font-bold-h5 text-text-strong'>오늘의 스터디</h3>
        <TodayStudyModal mode={mode} />
      </div>

      <div className='grid grid-cols-2 gap-100 mb-4'>
        <InfoBox label='스터디 조' value="2조" />
        <InfoBox label='면접자' value={
          <div className='flex items-center px-100 py-50 gap-100 border border-border-default rounded-full bg-background-default'>
            <UserAvatar image={''} />
            <span className='font-designer-14m'>{data.interviewer}</span>
          </div>
        } />
        <InfoBox label='오늘의 면접 주제' value={data.subject} />
        <InfoBox label='진행 현황' value={getStatusBadge(data.progressStatus)} />
      </div>

      <div className='flex flex-col px-300 py-150 gap-150 rounded-100 bg-background-alternative'>
        <div className='text-text-subtle font-designer-14r'>피드백</div>
        <p className='leading-relaxed'>{data.feedback ?? '-'}</p>
      </div>
    </section>
  );

  function InfoBox({ label, value }: { label: string; value: React.ReactNode }) {
    return (
      <div className='flex flex-row items-center px-300 py-150 gap-150 min-h-[64px] justify-between rounded-100 bg-background-alternative'>
        <span className='font-designer-14r text-text-subtle'>{label}</span>
        <span className='font-designer-16m text-text-default'>{value}</span>
      </div>
    );
  }

  function getStatusBadge(status: StudyProgressStatus) {
    return statusBadgeMap[status] ?? null;
  }

}
