import { AlertCircle } from 'lucide-react';

interface MentoringRequestUrgentBannerProps {
  urgentCount: number;
}

export default function MentoringRequestUrgentBanner({
  urgentCount,
}: MentoringRequestUrgentBannerProps) {
  return (
    <div className="rounded-150 bg-background-accent-orange-subtle mb-200 flex items-center gap-100 px-200 py-125">
      <AlertCircle className="text-text-warning h-16 w-16 shrink-0" />
      <p className="font-designer-14m text-text-warning">
        <span className="font-designer-14b">{urgentCount}건</span>의 새로운
        신청이 있어요
      </p>
      <p className="font-designer-14m text-text-subtle ml-auto">
        24시간 내에 수락/거절 되지 않을 때 재신청됩니다. 24시간 내 미승인 시
        자동 재신청이 3회 작동하며 이후 자동 삭제됩니다.
      </p>
    </div>
  );
}
