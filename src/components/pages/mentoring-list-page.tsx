import { FlaskConical } from 'lucide-react';
import Link from 'next/link';
import MentorProfileList from '@/components/mentoring/mentor-profile-list';
import Button from '@/components/ui/button';

export default function MentoringListPage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-200 py-400 sm:px-300 sm:py-500 xl:px-400 xl:py-600">
      <header className="mb-300 flex flex-wrap items-start justify-between gap-150 sm:mb-400">
        <div>
          <h1 className="font-designer-24b text-text-default mb-100">
            1:1 멘토링
          </h1>
          <p className="font-designer-14r text-text-subtle">
            현직 멘토를 탐색하고 쪽지/15분 전화/온라인/대면 상담 방식별 가격을
            비교한 뒤 바로 신청할 수 있어요.
          </p>
        </div>

        <Link href="/mentoring/temp">
          <Button
            color="outlined"
            size="small"
            icon={<FlaskConical className="h-14 w-14" />}
          >
            임시 검증 페이지
          </Button>
        </Link>
      </header>

      <MentorProfileList />
    </div>
  );
}
