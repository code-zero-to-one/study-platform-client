import { Suspense } from 'react';
import TabNavigation from '@/components/home/tab-navigation';
import StudyTab from '@/features/study/one-to-one/schedule/ui/home-study-tab';
import HallOfFameTab from '@/features/study/one-to-one/hall-of-fame/ui/hall-of-fame-tab';
import ArchiveTab from '@/features/study/one-to-one/archive/ui/archive-tab';
import CommunityTab from '@/features/study/one-to-one/balance-game/ui/community-tab';
import StudyHistoryTab from '@/features/study/one-to-one/history/ui/study-history-tab';

interface HomeContentProps {
  activeTab: string;
}

export default function HomeContent({ activeTab }: HomeContentProps) {
  const renderTabContent = () => {
    switch (activeTab) {
      case 'study':
        return <StudyTab />;
      case 'history':
        return <StudyHistoryTab />;
      case 'ranking':
        return <HallOfFameTab />;
      case 'archive':
        return <ArchiveTab />;
      case 'community':
        return <CommunityTab />;
      default:
        return <StudyTab />;
    }
  };

  return (
    <>
      <TabNavigation activeTab={activeTab} />
      <Suspense
        fallback={
          <div className="text-text-subtlest py-800 text-center">
            로딩 중...
          </div>
        }
      >
        {renderTabContent()}
      </Suspense>
    </>
  );
}
