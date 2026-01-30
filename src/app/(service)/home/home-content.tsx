import { Suspense } from 'react';
import TabNavigation from '@/components/home/tab-navigation';
import StudyTab from '@/components/home/tabs/study-tab';
import HallOfFameTab from '@/components/home/tabs/hall-of-fame-tab';
import ArchiveTab from '@/components/home/tabs/archive-tab';
import CommunityTab from '@/components/home/tabs/community-tab';
import StudyHistoryTab from '@/components/home/tabs/study-history-tab';

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
