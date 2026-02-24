import Link from 'next/link';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import SurfacePanel from '@/components/ui/surface-panel';
import type {
  MentoringRequestPanelActions,
  MentoringRequestRowViewModel,
} from '@/types/mentoring/management-request-panel-view';

interface MentoringRequestListProps {
  rows: MentoringRequestRowViewModel[];
  actions: Pick<MentoringRequestPanelActions, 'toRequestDetailHref'>;
}

export default function MentoringRequestList({
  rows,
  actions,
}: MentoringRequestListProps) {
  return (
    <SurfacePanel radius="lg" overflow="hidden">
      <div className="border-border-subtle grid grid-cols-[120px_200px_1fr_140px] gap-200 border-b bg-background-alternative px-300 py-150">
        <div className="font-designer-14b text-text-default">상태</div>
        <div className="font-designer-14b text-text-default">신청자</div>
        <div className="font-designer-14b text-text-default">멘토링 일정</div>
        <div className="font-designer-14b text-text-default text-right">
          신청 정보
        </div>
      </div>

      <div className="divide-border-subtle divide-y">
        {rows.map((row) => {
          return (
            <div
              key={row.id}
              className="hover:bg-background-alternative grid grid-cols-[120px_200px_1fr_140px] gap-200 px-300 py-200 transition-colors"
            >
              <div className="flex items-start pt-[2px]">
                <Badge color={row.statusColor} shape="round">
                  {row.statusLabel}
                </Badge>
              </div>

              <div className="flex flex-col gap-50">
                <p className="font-designer-15b text-text-default">
                  {row.menteeName}
                </p>
                <Badge color="blue" shape="round" className="w-fit">
                  {row.methodLabel}
                </Badge>
                {row.menteeRole && (
                  <p className="font-designer-13r text-text-subtle">
                    {row.menteeRole}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-75">
                <div className="flex items-center gap-75">
                  <span className="font-designer-13m text-text-subtle">
                    최근본
                  </span>
                  <span className="font-designer-14r text-text-default">
                    {row.requestedAtText}
                  </span>
                </div>
                <div className="flex items-center gap-75">
                  <span className="font-designer-13m text-text-subtle">
                    수락일
                  </span>
                  <span className="font-designer-14r text-text-default">
                    {row.preferredScheduleText}
                  </span>
                </div>
              </div>

              <div className="flex items-start justify-end pt-[2px]">
                <Link href={actions.toRequestDetailHref(row.id)}>
                  <Button size="small" color="outlined">
                    신청 상세
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </SurfacePanel>
  );
}
