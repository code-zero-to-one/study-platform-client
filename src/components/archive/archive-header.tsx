import { LibraryBig } from 'lucide-react';
import SectionHeader from '@/components/common/ui/section-header';

export default function ArchiveHeader() {
  return (
    <SectionHeader
      title="제로원 아카이브"
      icon={<LibraryBig className="text-text-brand h-8 w-8" />}
      description="제로원 아카이브는 스터디 멤버들이 공유한 자료를 모아볼 수 있는 공간입니다."
    />
  );
}
