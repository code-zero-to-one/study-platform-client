import Link from 'next/link';
import Badge from '@/components/common/ui/badge';
import Button from '@/components/common/ui/button';
import SurfacePanel from '@/components/common/ui/surface-panel';
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
      {' '}
      <div className="border-border-subtle bg-background-alternative grid grid-cols-[120px_200px_1fr_180px] gap-200 border-b px-300 py-150">
        {' '}
        <div className="font-designer-14b text-text-default">상태</div>{' '}
        <div className="font-designer-14b text-text-default">신청자</div>{' '}
        <div className="font-designer-14b text-text-default">접수 정보</div>{' '}
        <div className="text-right font-designer-14b text-text-default">
          {' '}
          다음 행동{' '}
        </div>{' '}
      </div>{' '}
      <div className="divide-border-subtle divide-y">
        {' '}
        {rows.map((row) => {
          return (
            <div
              key={row.id}
              className="hover:bg-background-alternative grid grid-cols-[120px_200px_1fr_180px] gap-200 px-300 py-200 transition-colors"
            >
              {' '}
              <div className="flex items-start pt-[2px]">
                {' '}
                <Badge color={row.statusColor} shape="round">
                  {' '}
                  {row.statusLabel}{' '}
                </Badge>{' '}
              </div>{' '}
              <div className="flex flex-col gap-50">
                {' '}
                <p className="font-designer-15b text-text-default">
                  {' '}
                  {row.menteeName}{' '}
                </p>{' '}
                <div className="flex flex-wrap gap-50">
                  {' '}
                  <Badge color="blue" shape="round" className="w-fit">
                    {' '}
                    {row.methodLabel}{' '}
                  </Badge>{' '}
                  <Badge
                    color={row.paymentStatusColor}
                    shape="round"
                    className="w-fit"
                  >
                    {' '}
                    {row.paymentStatusLabel}{' '}
                  </Badge>{' '}
                  {row.attentionLabel && row.attentionColor ? (
                    <Badge
                      color={row.attentionColor}
                      shape="round"
                      className="w-fit"
                    >
                      {' '}
                      {row.attentionLabel}{' '}
                    </Badge>
                  ) : null}{' '}
                </div>{' '}
                {row.menteeRole && (
                  <p className="font-designer-13r text-text-subtle">
                    {' '}
                    {row.menteeRole}{' '}
                  </p>
                )}{' '}
              </div>{' '}
              <div className="flex flex-col gap-75">
                {' '}
                <div className="flex items-center gap-75">
                  {' '}
                  <span className="font-designer-13m text-text-subtle">
                    {' '}
                    {row.requestedAtLabel}{' '}
                  </span>{' '}
                  <span className="font-designer-14r text-text-default">
                    {' '}
                    {row.requestedAtText}{' '}
                  </span>{' '}
                </div>{' '}
                <div className="flex items-center gap-75">
                  {' '}
                  <span className="font-designer-13m text-text-subtle">
                    {' '}
                    {row.preferredScheduleLabel}{' '}
                  </span>{' '}
                  <span className="font-designer-14r text-text-default">
                    {' '}
                    {row.preferredScheduleText}{' '}
                  </span>{' '}
                </div>{' '}
              </div>{' '}
              <div className="flex flex-col items-end gap-75 pt-[2px] text-right">
                {' '}
                <Link href={actions.toRequestDetailHref(row.id)}>
                  {' '}
                  <Button size="small" color="outlined">
                    {' '}
                    {row.actionLabel}{' '}
                  </Button>{' '}
                </Link>{' '}
                <p className="leading-relaxed font-designer-12r text-text-subtle">
                  {' '}
                  {row.actionDescription}{' '}
                </p>{' '}
              </div>{' '}
            </div>
          );
        })}{' '}
      </div>{' '}
    </SurfacePanel>
  );
}
