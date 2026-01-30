import StudyCard from '@/features/study/schedule/ui/study-card';
import Banner from '@/widgets/home/banner';

export default function StudyTab() {
  return (
    <div className="flex flex-col gap-500">
      {/* 기존 컴포넌트들을 그대로 사용 - 100% 안전 */}
      <Banner />
      <StudyCard />
    </div>
  );
}
