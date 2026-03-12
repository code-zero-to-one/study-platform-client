import { AlertCircle } from 'lucide-react';
interface MentoringRequestUrgentBannerProps {
  urgentCount: number;
}
export default function MentoringRequestUrgentBanner({
  urgentCount,
}: MentoringRequestUrgentBannerProps) {
  return (
    <div className="rounded-150 bg-background-accent-orange-subtle mb-200 flex items-center gap-100 px-200 py-125">
      {' '}
      <AlertCircle className="h-16 w-16 shrink-0 text-text-warning" />{' '}
      <p className="font-designer-14m text-text-warning">
        {' '}
        <span className="font-designer-14b">{urgentCount}건</span> 새 신청을
        확인하세요{' '}
      </p>{' '}
      <p className="ml-auto font-designer-14m text-text-subtle">
        {' '}
        24시간 안에 1차 확인하고, 48시간이 넘기지 않게 처리해주세요.{' '}
      </p>{' '}
    </div>
  );
}
