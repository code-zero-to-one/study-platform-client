import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MaterialIcon } from '@/components/pages/class/_components/material-icon';
import { VIBE_COURSE } from '@/components/pages/class/_data/courses';

interface ClassDetailRouteProps {
  params: Promise<{ courseSlug: string }>;
}

export default async function ClassDetailRoute({
  params,
}: ClassDetailRouteProps) {
  const { courseSlug } = await params;

  if (courseSlug !== VIBE_COURSE.slug) {
    notFound();
  }

  return (
    <div className="bg-background-alternative min-h-screen">
      <div className="mx-auto w-full max-w-page px-600 pt-700 pb-1400">
        <Link
          href="/class"
          className="font-designer-13m text-text-subtle hover:text-text-default inline-flex items-center gap-50"
        >
          <MaterialIcon name="arrow_back" size={16} />
          클래스 목록
        </Link>

        <div className="bg-background-default border-border-subtle rounded-200 mt-300 border p-700">
          <span className="bg-rose-100 text-rose-700 font-designer-12b inline-flex items-center rounded-full px-150 py-25">
            준비 중
          </span>
          <h1 className="font-bold-h2 text-text-strong mt-200">
            {VIBE_COURSE.title}
          </h1>
          <p className="font-designer-16r text-text-subtle mt-100">
            {VIBE_COURSE.tagline}
          </p>
          <p className="font-designer-14r text-text-subtle mt-300">
            코스 상세 페이지(히어로 / 결과물 캐러셀 / 5일 커리큘럼 / 혜택 스택 /
            FAQ / 환불 정책 / 최종 CTA)는 다음 라운드에서 구현됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
