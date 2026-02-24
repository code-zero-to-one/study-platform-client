import {
  ArrowRight,
  ClipboardCheck,
  FlaskConical,
  LayoutList,
} from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/button';
import ContactSeedActions from '@/features/mentoring/ui/temp/contact-seed-actions';
import ReviewSeedActions from '@/features/mentoring/ui/temp/review-seed-actions';

const quickLinks = [
  {
    title: '멘토링 목록',
    description: '멘토 탐색, 신청 진입, 임시 버튼 동작 확인',
    href: '/mentoring',
  },
  {
    title: '멘토링 관리',
    description: '수락/거절, 일정 확정, 중복 예약 방지 확인',
    href: '/mentoring-management',
  },
  {
    title: '내 멘토링 후기 관리',
    description: '후기 작성/수정 상태 및 CTA 전이 확인',
    href: '/my-study-review',
  },
  {
    title: '샘플 멘토 상세',
    description: '후기 작성 후 멘토 상세 리뷰/평점 반영 확인',
    href: '/mentoring/101',
  },
  {
    title: '샘플 신청 (쪽지상담)',
    description: '신청 생성 테스트',
    href: '/mentoring/101/apply?type=note',
  },
  {
    title: '샘플 신청 (전화상담)',
    description: '일정형 신청 및 일정 확정 테스트',
    href: '/mentoring/101/apply?type=phone',
  },
] as const;

export default function MentoringTempPage() {
  return (
    <div className="mx-auto w-full max-w-[1040px] px-200 py-400 sm:px-300 sm:py-500 xl:px-400 xl:py-600">
      <header className="rounded-200 border-border-subtle bg-background-default mb-250 border p-300">
        <div className="mb-100 flex items-center gap-75">
          <FlaskConical className="text-text-brand h-16 w-16" />
          <span className="font-designer-13b text-text-brand">
            임시 QA 허브
          </span>
        </div>
        <h1 className="font-designer-24b text-text-default mb-100">
          멘토링 플로우 임시 검증 페이지
        </h1>
        <p className="font-designer-14r text-text-subtle">
          신청 → 수락/거절 → 일정 관리 → 후기 작성까지 빠르게 점검할 수 있도록
          주요 경로를 모았습니다.
        </p>
      </header>

      <ReviewSeedActions />
      <ContactSeedActions />

      <section className="rounded-200 border-border-subtle bg-background-default mb-250 border p-250">
        <div className="mb-125 flex items-center gap-75">
          <ClipboardCheck className="text-text-subtle h-16 w-16" />
          <h2 className="font-designer-18b text-text-default">
            권장 확인 순서
          </h2>
        </div>
        <ol className="font-designer-14r text-text-subtle list-decimal space-y-50 pl-250">
          <li>샘플 신청을 생성합니다.</li>
          <li>멘토링 관리에서 신청을 수락하고 일정을 확정합니다.</li>
          <li>
            마이페이지 후기 화면에서 상태 전이를 확인하고 후기를 등록합니다.
          </li>
          <li>멘토 상세에서 후기/평점 반영을 확인합니다.</li>
        </ol>
      </section>

      <section>
        <div className="mb-125 flex items-center gap-75">
          <LayoutList className="text-text-subtle h-16 w-16" />
          <h2 className="font-designer-18b text-text-default">바로가기</h2>
        </div>

        <div className="grid grid-cols-1 gap-125 md:grid-cols-2">
          {quickLinks.map((item) => (
            <article
              key={item.href}
              className="rounded-150 border-border-subtle bg-background-default border p-200"
            >
              <h3 className="font-designer-16b text-text-default mb-50">
                {item.title}
              </h3>
              <p className="font-designer-13r text-text-subtle mb-150">
                {item.description}
              </p>

              <Link href={item.href}>
                <Button
                  color="outlined"
                  size="small"
                  icon={<ArrowRight className="h-14 w-14" />}
                  iconPosition="right"
                >
                  이동
                </Button>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
