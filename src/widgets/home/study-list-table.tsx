import { getStatusBadge } from '@/features/study/lib/ui/status-badge-map';
import { useDailyStudiesQuery } from '@/features/study/model/use-study-query';
import UserAvatar from '@/shared/ui/avatar';
import TableList from '@/shared/ui/table';
import LinkIcon from 'public/icons/Link.svg';
import { DailyStudy } from '../../features/study/api/types';

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

interface Props {
  date: Date;
}

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
    '면접 주제': row.subject,
    피드백: (
      <p className="text-text-default line-clamp-2 max-w-[300px] text-sm">
        {row.feedback ?? '-'}
      </p>
    ),
    '진행 상태': getStatusBadge(row.progressStatus),
    '참고 자료': row.link ? (
      <a href={row.link} target="_blank" rel="noopener noreferrer">
        <LinkIcon className="h-4 w-4" />
      </a>
    ) : (
      <LinkIcon color={'gray'} className="h-4 w-4" />
    ),
  };
}

export default function StudyListSection({ date }: Props) {
  const offset = date.getTimezoneOffset() * 60000;
  const dateOffset = new Date(date.getTime() - offset);

  const studyDate = dateOffset.toISOString().split('T')[0];

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
