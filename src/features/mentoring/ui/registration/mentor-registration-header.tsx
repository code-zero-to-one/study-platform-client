import { FlaskConical, Info, UserRoundPlus } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/button';
import TextActionButton from '@/components/ui/text-action-button';

interface MentorRegistrationHeaderProps {
  onOpenGuide: () => void;
}

export default function MentorRegistrationHeader({
  onOpenGuide,
}: MentorRegistrationHeaderProps) {
  return (
    <header className="mb-250 flex flex-col gap-150 sm:flex-row sm:items-start sm:gap-200">
      <div>
        <div className="mb-75 flex items-center gap-100">
          <UserRoundPlus className="text-text-brand h-24 w-24" />
          <h1 className="font-designer-28b text-text-default">멘토링 설정</h1>
        </div>
        <p className="font-designer-14r text-text-subtle">
          입력한 정보는 멘토링 목록/상세/신청 화면에 즉시 반영됩니다.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-100 self-start sm:self-auto">
        <Link href="/mentoring/scroll-card-playground">
          <Button
            color="outlined"
            size="small"
            icon={<FlaskConical className="h-14 w-14" />}
          >
            연습 페이지
          </Button>
        </Link>
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
