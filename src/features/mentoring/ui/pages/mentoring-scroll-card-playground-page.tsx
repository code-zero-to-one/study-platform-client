import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import ScrollFollowCardDemo from '@/features/mentoring/ui/temp/scroll-follow-card-demo';
import Button from '@/components/common/ui/button';

const practiceMemos = [
  '스크롤 감도를 바꿀 때는 CARD_FOLLOW_RATIO 값만 먼저 조절',
  '카드 최대 이동량은 CARD_MAX_OFFSET으로 제한',
  '방향 아이콘/문구는 getScrollDirection으로 바로 테스트 가능',
] as const;

export default function MentoringScrollCardPlaygroundPage() {
  return (
    <div className="bg-background-default min-h-[100dvh]">
      <main className="mx-auto w-full max-w-[1120px] px-200 py-400 sm:px-300 sm:py-500 xl:px-400 xl:py-600">
        <header className="rounded-200 border-border-subtle bg-background-alternative mb-250 border p-300">
          <div className="mb-100 flex items-center gap-75">
            <Sparkles className="text-text-brand h-16 w-16" />
            <span className="font-designer-13b text-text-brand">
              프론트엔드 연습용
            </span>
          </div>
          <h1 className="font-designer-24b text-text-default mb-75">
            스크롤 추적 카드 임시 페이지
          </h1>
          <p className="font-designer-14r text-text-subtle mb-150">
            장난감처럼 스크롤 애니메이션을 테스트하는 완전 별도 연습 공간입니다.
          </p>
          <Link href="/mentoring/become-mentor">
            <Button
              color="outlined"
              size="small"
              icon={<ArrowLeft className="h-14 w-14" />}
            >
              멘토링 설정으로 돌아가기
            </Button>
          </Link>
        </header>

        <ScrollFollowCardDemo />

        <section className="rounded-200 border-border-subtle bg-background-default border p-250">
          <h2 className="font-designer-18b text-text-default mb-100">
            빠른 튜닝 메모
          </h2>
          <ul className="space-y-75">
            {practiceMemos.map((memo) => (
              <li
                key={memo}
                className="rounded-125 border-border-subtle bg-background-alternative font-designer-14m text-text-default border px-150 py-125"
              >
                {memo}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
