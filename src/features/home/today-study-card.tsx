import UserCell from '@/entities/user/ui/UserCell';
import { Badge } from '@/shared/ui/badge';
import Button from '@/shared/ui/button';
import CreateIcon from 'public/icons/create.svg'

interface TodayStudyCardProps {
  teamName: string;
  interviewer: {
    name: string;
    img?: string;
  };
  topic: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'NOT_STARTED';
  feedback: string;
}

const getBoxClass = (direction: 'row' | 'col' = 'row') =>
  `flex flex-${direction} px-300 py-150 gap-150 min-h-[64px] justify-between rounded-100 bg-background-alternative ${direction === 'row' ? 'items-center' : ''
  }`;

const getStatusBadge = (status: TodayStudyCardProps['status']) => {
  switch (status) {
    case 'IN_PROGRESS':
      return <Badge color="incomplete">진행중</Badge>;
    case 'COMPLETED':
      return <Badge color="completed">완료</Badge>;
    case 'NOT_STARTED':
      return <Badge color="default">미완료</Badge>;
    default:
      return null;
  }
};

export default function TodayStudyCard({
  teamName,
  interviewer,
  topic,
  status,
  feedback,
}: TodayStudyCardProps) {
  const labelClass = "font-designer-14r text-text-subtle";
  const valueClass = "font-semibold text-sm text-gray-800";

  return (
    <section className="w-full flex flex-col gap-150">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold-h5 text-text-strong">오늘의 스터디</h3>
        <Button icon={<CreateIcon />} iconPosition="left" size="medium">
          작성하기
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-100 mb-4">
        <div className={getBoxClass('row')}>
          <span className={labelClass}>스터디 조</span>
          <span className={valueClass}>{teamName}</span>
        </div>
        <div className={getBoxClass('row')}>
          <span className={labelClass}>면접자</span>
          <div className="flex items-center px-100 py-50 gap-75 border border-border-default rounded-full bg-background-default">
            <UserCell name={interviewer.name} img={interviewer.img} />
          </div>
        </div>
        <div className={getBoxClass('row')}>
          <span className={labelClass}>오늘의 면접 주제</span>
          <span className={valueClass}>{topic}</span>
        </div>
        <div className={getBoxClass('row')}>
          <span className={labelClass}>진행 현황</span>
          {getStatusBadge(status)}
        </div>
      </div>

      <div className={getBoxClass('col')}>
        <div className="text-gray-500 font-medium mb-1">피드백</div>
        <p className="leading-relaxed">
          {feedback}
        </p>
      </div>
    </section>
  );
}