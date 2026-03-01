import { format } from 'date-fns';
import { useGetMissionEvaluationGrades } from '@/hooks/queries/evaluation-api';
import {
  MemberProgress,
  MissionProgressHistory,
} from '@/types/api/group-study.types';
import { formatToKST } from '@/utils/time';

export default function MissionProgressHistoryList({
  missionProgressHistory,
}: Pick<MemberProgress, 'missionProgressHistory'>) {
  const { data } = useGetMissionEvaluationGrades();
  const MAX_POINTS = missionProgressHistory.length * 4.5;
  const points = missionProgressHistory.reduce((acc, curr) => {
    return acc + data?.find((grade) => grade.code === curr.grade)?.score || 0;
  }, 0);

  return (
    <div className="flex flex-col gap-400">
      <div className="flex flex-col gap-200">
        <div className="font-designer-16b flex items-center gap-100">
          <span className="text-text-default">미션 평가</span>
          <span className="text-text-brand">
            {points}점 / {MAX_POINTS}점
          </span>
        </div>

        {missionProgressHistory.length > 0 ? (
          <ul className="flex flex-col gap-200">
            {missionProgressHistory.map((item) => (
              <MissionProgressHistoryItem key={item.id} history={item} />
            ))}
          </ul>
        ) : (
          <div className="rounded-100 bg-background-alternative flex h-[130px] flex-col items-center justify-center gap-100">
            <span className="font-designer-14b text-text-subtle">
              미션 평가 내역이 없습니다.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function MissionProgressHistoryItem({
  history,
}: {
  history: MissionProgressHistory;
}) {
  return (
    <li key={history.id} className="rounded-100 flex items-start gap-200">
      <div className="bg-background-alternative rounded-50 font-designer-20b text-text-default flex h-[60px] w-[60px] shrink-0 flex-col items-center justify-center">
        <span className="font-designer-20b text-text-default">A -</span>
        <span className="font-designer-14r text-icon-subtlest">(4.0)</span>
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
