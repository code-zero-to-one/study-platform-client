import { Info, RotateCcw, UserRoundPlus } from 'lucide-react';
import TextActionButton from '@/components/common/ui/text-action-button';

interface MentorRegistrationHeaderProps {
  onOpenGuide: () => void;
  onReopenEntryOnboarding: () => void;
}

export default function MentorRegistrationHeader({
  onOpenGuide,
  onReopenEntryOnboarding,
}: MentorRegistrationHeaderProps) {
  return (
    <header className="mb-250 flex flex-col gap-150 sm:flex-row sm:items-start sm:justify-between sm:gap-200">
      <div>
        <div className="mb-75 flex items-center gap-100">
          <UserRoundPlus className="text-text-brand h-24 w-24" />
          <h1 className="font-designer-28b text-text-default">멘토링 설정</h1>
        </div>
        <p className="font-designer-14r text-text-subtle">
          입력한 정보는 멘토링 목록/상세/신청 화면에 즉시 반영됩니다.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-100 self-start sm:justify-end">
        <TextActionButton
          tone="subtle"
          weight="regular"
          icon={<RotateCcw className="h-14 w-14" />}
          onClick={onReopenEntryOnboarding}
        >
          온보딩 다시보기
        </TextActionButton>
        <TextActionButton
          tone="subtle"
          weight="regular"
          icon={<Info className="h-14 w-14" />}
          onClick={onOpenGuide}
        >
          멘토링 안내
        </TextActionButton>
      </div>
    </header>
  );
}
