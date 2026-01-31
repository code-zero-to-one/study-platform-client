import StudyCard from '@/features/study/one-to-one/schedule/ui/study-card';

export default function StudyTab() {
  return (
    <div className="flex flex-col gap-500">
      {/* 기존 컴포넌트들을 그대로 사용 - 100% 안전 */}
      <StudyCard />
    </div>
  );
}
