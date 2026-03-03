import { type ReactNode } from 'react';

interface MentorDirectoryHeaderProps {
  actions?: ReactNode;
}

export default function MentorDirectoryHeader({
  actions,
}: MentorDirectoryHeaderProps) {
  return (
    <header className="mb-300 flex flex-wrap items-start justify-between gap-150 sm:mb-400">
      <div>
        <h1 className="font-designer-24b text-text-default mb-100">
          1:1 멘토링
        </h1>
        <p className="font-designer-14r text-text-subtle">
          현직 멘토를 탐색하고 쪽지/간편/심층/대면 상담 방식별 가격을 비교한 뒤
          바로 신청할 수 있어요.
        </p>
      </div>
      {actions}
    </header>
  );
}
