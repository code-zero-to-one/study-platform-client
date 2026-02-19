import MentorProfileList from '@/components/mentoring/mentor-profile-list';

export default function MentoringListPage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-200 py-400 sm:px-300 sm:py-500 xl:px-400 xl:py-600">
      <header className="mb-300 sm:mb-400">
        <h1 className="font-designer-24b text-text-default mb-100">
          1:1 멘토링
        </h1>
        <p className="font-designer-14r text-text-subtle">
          현직 멘토를 탐색하고 쪽지/15분 전화/온라인/대면 상담 방식별 가격을
          비교한 뒤 바로 신청할 수 있어요.
        </p>
      </header>

      <MentorProfileList />
    </div>
  );
}
