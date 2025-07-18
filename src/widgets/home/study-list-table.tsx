import { useDailyStudiesQuery } from '@/features/study/model/use-study-query';
import UserAvatar from '@/shared/ui/avatar';
import Badge from '@/shared/ui/badge/index';
import TableList from '@/shared/ui/table-list';
import LinkIcon from 'public/icons/Link.svg';
import {
  DailyStudy,
  StudyProgressStatus,
} from '../../features/study/api/types';

const headers = [
  '조',
  '지원자',
  '면접관',
  '면접 주제',
  '피드백',
  '진행 상태',
  '참고 자료',
] as const;

// unused
// type StudyListTableHeader = (typeof headers)[number];

interface Props {
  date: Date;
}

const statusBadgeMap: Partial<Record<StudyProgressStatus, React.ReactNode>> = {
  PENDING: <Badge color="default">시작 전</Badge>,
  IN_PROGRESS: <Badge color="incomplete">진행중</Badge>,
  COMPLETE: <Badge color="completed">완료</Badge>,
  ABSENT: <Badge color="incomplete">불참</Badge>,
};

function mapDailyStudyToDisplayData(row: DailyStudy, index: number) {
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
    '면접 주제': row.subject,
    피드백: (
      <p className="text-text-default line-clamp-2 max-w-[300px] text-sm">
        {row.feedback ?? '-'}
      </p>
    ),
    '진행 상태': statusBadgeMap[row.progressStatus],
    '참고 자료': row.link ? (
      <a href={row.link} target="_blank" rel="noopener noreferrer">
        <LinkIcon className="h-4 w-4 text-blue-500 hover:text-blue-700" />
      </a>
    ) : null,
  };
}

export default function StudyListSection({ date }: Props) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const { data, isLoading, error } = useDailyStudiesQuery({
    cursor: 0,
    pageSize: 10,
    year,
    month,
    day,
  });

  if (isLoading) return <div>로딩 중...</div>;
  // 명확한 에러 상태
  if (error && !data) return <div>에러 발생</div>;

  const displayData: Record<Header, React.ReactNode>[] = data.items.map(
    mapDailyStudyToDisplayData,
  );
  const displayData =
    data.dailyStudyResponses && data.dailyStudyResponses.length
      ? data.dailyStudyResponses.map(mapDailyStudyToDisplayData)
      : [];

  return (
    <section className="w-full">
      <h3 className="font-bold-h5 pb-150">오늘의 스터디 리스트</h3>
      <TableList headers={headers} data={displayData} />
    </section>
  );
}
