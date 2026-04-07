'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

export default function StudyReviewTabNav() {
  const pathname = usePathname();
  const router = useRouter();

  const tabClassName =
    'font-designer-16m px-400 py-200 text-text-subtle cursor-pointer';
  const pathClassName =
    'font-designer-16b border-b-2 border-text-default text-text-default';

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <nav className="flex border-b border-border-subtle">
      <button
        type="button"
        onClick={() => router.push('/my-study-review/one-to-one')}
        className={cn(
          tabClassName,
          isActive('/my-study-review/one-to-one') && pathClassName,
        )}
      >
        1:1 스터디
      </button>
      <button
        type="button"
        onClick={() => router.push('/my-study-review/group')}
        className={cn(
          tabClassName,
          isActive('/my-study-review/group') && pathClassName,
        )}
      >
        그룹 스터디
      </button>
      <button
        type="button"
        onClick={() => router.push('/my-study-review/mentor')}
        className={cn(
          tabClassName,
          isActive('/my-study-review/mentor') && pathClassName,
        )}
      >
        멘토 스터디
      </button>
    </nav>
  );
}
