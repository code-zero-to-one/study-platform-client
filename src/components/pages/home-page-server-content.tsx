import { Suspense } from 'react';
import type { HomeTab } from '@/features/home/model/home-page-search-params';
import ArchiveTab from '@/features/study/one-to-one/archive/ui/archive-tab';
import CommunityTab from '@/features/study/one-to-one/balance-game/ui/community-tab';
import HallOfFameTab from '@/features/study/one-to-one/hall-of-fame/ui/hall-of-fame-tab';
import StudyHistoryTab from '@/features/study/one-to-one/history/ui/study-history-tab';
import StudyTab from '@/features/study/one-to-one/schedule/ui/home-study-tab';
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
