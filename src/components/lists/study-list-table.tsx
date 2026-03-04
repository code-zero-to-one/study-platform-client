'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import UserAvatar from '@/components/common/ui/avatar';
import TableList from '@/components/common/ui/table';
import { getStatusBadge } from '@/components/interview/status-badge-map';
import { useDailyStudiesQuery } from '@/hooks/queries/use-schedule-query';
import { DailyStudy } from '@/types/api/schedule.types';
import LinkIcon from 'public/icons/Link.svg';

const headers = [
  '조',
  '지원자',
  '면접관',
  '면접 주제',
  '피드백',
  '진행 상태',
  '참고 자료',
] as const;
type Header = (typeof headers)[number];

function mapDailyStudyToDisplayData(
  row: DailyStudy,
  index: number,
): Record<Header, React.ReactNode> {
  return {
    조: index + 1,
    지원자: (
      <div className="flex items-center gap-150 px-100 py-50">
        <UserAvatar image={row.intervieweeImage} />
        <span className="font-designer-14m whitespace-nowrap">
          {row.interviewee}
        </span>
      </div>
    ),
    면접관: (
      <div className="flex items-center gap-150 px-100 py-50">
        <UserAvatar image={row.interviewerImage} />
        <span className="font-designer-14m whitespace-nowrap">
          {row.interviewer}
        </span>
      </div>
    ),
    '면접 주제': row.subject || '-',
    피드백: row.feedback || '-',
    '진행 상태': getStatusBadge(row.progressStatus),
    '참고 자료': row.link ? (
      <a
        href={row.link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          sendGTMEvent({
            event: 'study_reference_link_click',
            study_date: row.studyDate || '',
            interviewee: row.interviewee,
            location: 'home',
          });
        }}
      >
        <LinkIcon className="h-4 w-4" />
      </a>
    ) : (
      <LinkIcon color={'gray'} className="h-4 w-4" />
    ),
  };
}

function MockStudyListSection() {
  const displayData: Record<Header, React.ReactNode>[] = [
    {
      조: 1,
      지원자: (
        <div className="flex items-center gap-150 px-100 py-50">
          <UserAvatar image="" />
          <span className="font-designer-14m whitespace-nowrap">지원자</span>
        </div>
      ),
      면접관: (
        <div className="flex items-center gap-150 px-100 py-50">
          <UserAvatar image="" />
          <span className="font-designer-14m whitespace-nowrap">면접관</span>
        </div>
      ),
      '면접 주제': '네트워크 기초',
      피드백: '-',
      '진행 상태': getStatusBadge('IN_PROGRESS'),
      '참고 자료': <LinkIcon className="h-4 w-4" />,
    },
  ];

  return (
    <section className="w-full">
      <h3 className="font-bold-h5 pb-150">오늘의 스터디 리스트</h3>
      <TableList headers={headers} data={displayData} />
    </section>
  );
}

function RealStudyListSection({ studyDate }: { studyDate: string }) {
  const { data, isLoading, error } = useDailyStudiesQuery({
    cursor: 0,
    pageSize: 10,
    studyDate,
  });

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러 발생</div>;
  if (!data) return null;

  const displayData: Record<Header, React.ReactNode>[] = data.items.map(
    mapDailyStudyToDisplayData,
  );

  return (
    <section className="w-full">
      <h3 className="font-bold-h5 pb-150">오늘의 스터디 리스트</h3>
      <TableList headers={headers} data={displayData} />
    </section>
  );
}

export default function StudyListSection({
  studyDate,
  tutorialMode,
}: {
  studyDate: string;
  tutorialMode?: boolean;
}) {
  return tutorialMode ? (
    <MockStudyListSection />
  ) : (
    <RealStudyListSection studyDate={studyDate} />
  );
}
