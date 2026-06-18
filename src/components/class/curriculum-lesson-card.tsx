import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { TimerIcon } from '@/components/common/ui/icons/course-icons';

interface CurriculumLessonCardProps {
  order: number;
  title: string;
  estimatedMinutes: number;
  isFree?: boolean;
  isActive?: boolean;
}

export function CurriculumLessonCard({
  order,
  title,
  estimatedMinutes,
  isFree,
  isActive,
}: CurriculumLessonCardProps) {
  return (
    <div
      className={cn(
        'flex h-1250 w-full items-center justify-between gap-200 rounded-200 border px-500',
        isActive
          ? 'border-rose-500 bg-background-default'
          : 'border-border-default bg-gray-50',
      )}
    >
      {/* Left: number badge + title + free badge */}
      <div className="flex min-w-0 flex-1 items-center gap-225">
        <div
          className={cn(
            'flex w-550 shrink-0 items-center justify-center rounded-50 p-125',
            isActive ? 'bg-rose-500' : 'bg-gray-400',
          )}
        >
          <span className="font-designer-16b text-center text-white">
            {String(order).padStart(2, '0')}
          </span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-25">
          <p className="font-designer-16b truncate text-gray-600">{title}</p>
          {isFree && (
            <div className="flex gap-75">
              <span className="flex h-300 items-center justify-center rounded-50 bg-rose-400 px-150 font-designer-14b text-white">
                무료
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right: timer + duration */}
      <div
        className={cn(
          'flex shrink-0 items-center gap-25',
          isActive ? 'text-rose-400' : 'text-gray-400',
        )}
      >
        <TimerIcon className="size-300" />
        <span className="font-designer-14r">약 {estimatedMinutes}분 소요</span>
      </div>
    </div>
  );
}
