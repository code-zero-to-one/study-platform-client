import { ExternalLink } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { CurriculumSummaryItem } from '@/features/study/group/api/group-study-types';

interface CurriculumSummarySectionProps {
  curriculumSummary: CurriculumSummaryItem[];
}

export default function CurriculumSummarySection({
  curriculumSummary,
}: CurriculumSummarySectionProps) {
  const pathname = usePathname();
  if (!curriculumSummary?.length) return null;

  const weekCount = Math.max(...curriculumSummary.map((item) => item.weekNum));

  const handleClickCurriculum = (id: number) => {
    window.open(`${pathname}?tab=mission&missionId=${id}`, '_blank');
  };

  return (
    <div className="rounded-150 flex w-[335px] flex-col border border-[#D5D7DA] bg-white px-300 py-400">
      <div className="mb-300 flex items-center gap-100">
        <p className="font-designer-20b">커리큘럼 요약</p>
        <span className="font-designer-16r text-[#A4A7AE]">{weekCount}주</span>
      </div>

      <div className="flex flex-col gap-150">
        {curriculumSummary.map((item) => (
          <div
            key={item.missionId}
            className="rounded-100 flex items-center gap-150 border border-[#E9EAEB] px-200 py-300"
          >
            <span className="font-designer-15m w-250 shrink-0 text-center text-[#A4A7AE]">
              {item.weekNum}
            </span>
            <span className="font-designer-15m text-text-default flex-1 leading-snug">
              {item.title}
            </span>
            <ExternalLink
              onClick={() => handleClickCurriculum(item.missionId)}
              className="h-[18px] w-[18px] shrink-0 cursor-pointer text-[#A4A7AE]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
