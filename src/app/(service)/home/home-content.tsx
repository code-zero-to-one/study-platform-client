import { Suspense } from 'react';
import ArchiveTab from '@/components/archive/archive-tab';
import CommunityTab from '@/components/balance-game/community-tab';
import HallOfFameTab from '@/components/hall-of-fame/hall-of-fame-tab';
import TabNavigation from '@/components/home/tab-navigation';
import StudyTab from '@/components/schedule/home-study-tab';
import StudyHistoryTab from '@/components/study-history/study-history-tab';
import { getServerCookie } from '@/utils/server-cookie';
import { isNumeric } from '@/utils/validation';

interface HomeContentProps {
  activeTab: string;
}

export default async function HomeContent({ activeTab }: HomeContentProps) {
  const isHistoryTab = activeTab === 'history';
  const memberIdStr = isHistoryTab ? await getServerCookie('memberId') : null;
  const isLoggedIn = !!memberIdStr && isNumeric(memberIdStr);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'study':
        return <StudyTab />;
      case 'history':
        return isLoggedIn ? <StudyHistoryTab /> : <StudyTab />;
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
