import UserAvatar from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge/index';
import TableList from '@/shared/ui/TableList';
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

interface RawStudy {
  interviewer: string;
  interviewee: string;
  subject: string;
  feedBack: string | undefined;
  progressStatus: string;
  link: string;
}

interface StudyListSectionProps {
  rawData: RawStudy[];
}

const statusBadgeMap: Record<string, React.ReactNode> = {
  COMPLETED: <Badge color="completed">완료</Badge>,
  INCOMPLETE: <Badge color="incomplete">미완료</Badge>,
  IN_PROGRESS: <Badge color="default">진행 중</Badge>,
  NOT_STARTED: <Badge color="default">시작 전</Badge>,
};

function mapDailyStudyToDisplayData(
  row: RawStudy,
  index: number,
): Record<Header, React.ReactNode> {
  const interviewee = { name: row.interviewee, img: '' };
  const interviewer = { name: row.interviewer, img: '' };

  return {
    조: index + 1,
    지원자: (
      <div className="flex items-center gap-150 px-100 py-50">
        <UserAvatar image={interviewee.img} />
        <span className="font-designer-14m">{interviewee.name}</span>
      </div>
    ),
    면접관: (
      <div className="flex items-center gap-150 px-100 py-50">
        <UserAvatar image={interviewer.img} />
        <span className="font-designer-14m">{interviewer.name}</span>
      </div>
    ),
    '면접 주제': row.subject,
    피드백: (
      <p className="text-text-default line-clamp-2 max-w-[300px] text-sm">
        {row.feedBack ?? '-'}
      </p>
    ),
    '진행 상태': statusBadgeMap[row.progressStatus] ?? row.progressStatus,
    '참고 자료': row.link ? (
      <a href={row.link} target="_blank" rel="noopener noreferrer">
        <LinkIcon className="h-4 w-4 text-blue-500 hover:text-blue-700" />
      </a>
    ) : null,
  };
}

export default function StudyListSection({ rawData }: StudyListSectionProps) {
  const displayData: Record<Header, React.ReactNode>[] = rawData.map(
    mapDailyStudyToDisplayData,
  );

  return (
    <section className="w-full">
      <h3 className="font-bold-h5 pb-150">오늘의 스터디 리스트</h3>
      <TableList headers={headers} data={displayData} />
    </section>
  );
}
