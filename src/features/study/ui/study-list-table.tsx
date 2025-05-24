'use client';

import { useDailyStudiesQuery } from '@/features/study/model/use-study-query';

import UserAvatar from '@/shared/ui/avatar';
import { Badge } from "@/shared/ui/badge/index";
import TableList from "@/shared/ui/table";
import LinkIcon from "public/icons/Link.svg";
import { DailyStudy, StudyProgressStatus } from '../api/types';

const headers = ["조", "지원자", "면접관", "면접 주제", "피드백", "진행 상태", "참고 자료"] as const;
type Header = (typeof headers)[number];

const statusBadgeMap: Partial<Record<StudyProgressStatus, React.ReactNode>> = {
   BEFORE_PROGRESSED: <Badge color="default">시작 전</Badge>,
   PENDING: <Badge color="incomplete">보류</Badge>,
   IN_PROGRESS: <Badge color="incomplete">진행중</Badge>,
   COMPLETE: <Badge color="completed">완료</Badge>,
   ABSENT: <Badge color="incomplete">불참</Badge>,
};

function mapDailyStudyToDisplayData(row: DailyStudy, index: number): Record<Header, React.ReactNode> {
   const interviewee = { name: row.interviewee, img: "" };
   const interviewer = { name: row.interviewer, img: "" };

   return {
      "조": index + 1,
      "지원자":
         <div className="flex items-center px-100 py-50 gap-150">
            <UserAvatar image={interviewee.img} />
            <span className='font-designer-14m'>{interviewee.name}</span>
         </div>,
      "면접관":
         <div className="flex items-center px-100 py-50 gap-150">
            <UserAvatar image={interviewer.img} />
            <span className='font-designer-14m'>{interviewer.name}</span>
         </div>,
      "면접 주제": row.subject,
      "피드백": <p className="max-w-[300px] text-sm text-text-default line-clamp-2">
         {row.feedBack ?? "-"}
      </p>,
      "진행 상태": statusBadgeMap[row.progressStatus],
      "참고 자료": row.link ? (
         <a href={row.link} target="_blank" rel="noopener noreferrer">
            <LinkIcon className="w-4 h-4 text-blue-500 hover:text-blue-700" />
         </a>
      ) : null,
   };
}


export default function StudyListSection() {
   const { data, isLoading, error } = useDailyStudiesQuery({
      cursor: 1,
      pageSize: 10,
      planTime: '2025-05-24',
   });

   if (isLoading) return <div>로딩 중...</div>;
   if (error) return <div>에러 발생</div>;
   if (!data) return null;

   const displayData: Record<Header, React.ReactNode>[] = data.dailyStudyResponses.map(mapDailyStudyToDisplayData);

   return (
      <section className="w-full">
         <h3 className="font-bold-h5 pb-150">오늘의 스터디 리스트</h3>
         <TableList headers={headers} data={displayData} />
      </section>
   );
}
