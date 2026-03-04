import { Suspense } from 'react';
import ArchiveTab from '@/components/archive/archive-tab';
import CommunityTab from '@/components/balance-game/community-tab';
import HallOfFameTab from '@/components/hall-of-fame/hall-of-fame-tab';
import StudyTab from '@/components/schedule/home-study-tab';
import StudyHistoryTab from '@/components/study-history/study-history-tab';
import type { HomeTab } from '@/features/home/model/home-page-search-params';
import { getServerCookie } from '@/utils/server-cookie';
import { isNumeric } from '@/utils/validation';

interface HomePageServerContentProps {
  activeTab: HomeTab;
}

export default async function HomePageServerContent({
  activeTab,
}: HomePageServerContentProps) {
  const isHistoryTab = activeTab === 'history';
  const memberIdString = isHistoryTab
    ? await getServerCookie('memberId')
    : null;
  const canViewHistory = !!memberIdString && isNumeric(memberIdString);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'study':
        return <StudyTab />;
      case 'history':
        return canViewHistory ? <StudyHistoryTab /> : <StudyTab />;
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
    <Suspense
      fallback={
        <div className="text-text-subtlest py-800 text-center">로딩 중...</div>
      }
    >
      {renderTabContent()}
    </Suspense>
  );
}
