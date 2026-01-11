import { format } from 'date-fns';
import {
  DiscretionGradeHistory,
  MemberProgress,
} from '@/features/study/group/api/group-study-types';
import { formatToKST } from '@/utils/time';

export default function DiscretionGradeHistoryList({
  discretionGradeHistory,
}: Pick<MemberProgress, 'discretionGradeHistory'>) {
  const MAX_POINTS = 15;
  const totalPoints = discretionGradeHistory.length * 5;

  return (
    <div className="flex flex-col gap-400">
      <div className="flex flex-col gap-200">
        <div className="font-designer-16b flex items-center gap-100">
          <span className="text-text-default">재량 평가</span>
          <span className="text-text-brand">
            {totalPoints}점 / {MAX_POINTS}점
          </span>
        </div>

        {discretionGradeHistory.length > 0 ? (
          <ul className="flex flex-col gap-200">
            {discretionGradeHistory.map((item) => (
              <DiscretionGradeHistoryItem key={item.id} history={item} />
            ))}
          </ul>
        ) : (
          <div className="rounded-100 bg-background-alternative flex h-[130px] flex-col items-center justify-center gap-100">
            <span className="font-designer-14b text-text-subtle">
              재량 평가 내역이 없습니다.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function DiscretionGradeHistoryItem({
  history,
}: {
  history: DiscretionGradeHistory;
}) {
  return (
    <li key={history.id} className="rounded-100 flex items-start gap-200">
      <div className="bg-fill-success-default-default rounded-50 font-designer-20b text-text-inverse flex h-[60px] w-[60px] shrink-0 items-center justify-center">
        +5
      </div>
      <div className="flex h-full flex-col justify-center gap-50">
        <span className="font-designer-15r text-text-default">
          {history.reason}
        </span>
        <span className="font-designer-13r text-text-subtlest">
          {formatToKST(history.acquiredAt)
            ? format(formatToKST(history.acquiredAt)!, 'yyyy.MM.dd HH:mm')
            : '-'}
        </span>
      </div>
    </li>
  );
}
