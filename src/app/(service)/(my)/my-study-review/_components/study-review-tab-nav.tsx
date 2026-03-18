'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

export default function StudyReviewTabNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="flex border-b border-border-subtle">
      <button
        type="button"
        onClick={() => router.push('/my-study-review/one-to-one')}
        className={cn(
          'font-designer-16m px-400 py-200 text-text-subtle',
          pathname.startsWith('/my-study-review/one-to-one') &&
            'font-designer-16b border-b-2 border-text-default text-text-default',
        )}
      >
        1:1 스터디
      </button>
      <button
        type="button"
        onClick={() => router.push('/my-study-review/group')}
        className={cn(
          'font-designer-16m px-400 py-200 text-text-subtle',
          pathname.startsWith('/my-study-review/group') &&
            'font-designer-16b border-b-2 border-text-default text-text-default',
        )}
      >
        그룹 스터디
      </button>
      <button
        type="button"
        onClick={() => router.push('/my-study-review/mentor')}
        className={cn(
          'font-designer-16m px-400 py-200 text-text-subtle',
          pathname.startsWith('/my-study-review/mentor') &&
            'font-designer-16b border-b-2 border-text-default text-text-default',
        )}
      >
        멘토 스터디
      </button>
    </nav>
  );
}
