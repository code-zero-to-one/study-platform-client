import { Suspense } from 'react';
import StudyTab from '@/components/group-study/schedule/home-study-tab';
import ArchiveTab from '@/components/one-to-one/archive/archive-tab';
import CommunityTab from '@/components/one-to-one/balance-game/community-tab';
import HallOfFameTab from '@/components/one-to-one/hall-of-fame/hall-of-fame-tab';
import StudyHistoryTab from '@/components/one-to-one/history/study-history-tab';
import { isAuthenticatedMemberSessionState } from '@/features/auth/model/auth-session';
import { readServerAuthSession } from '@/features/auth/model/server-auth-session';
import type { HomeTab } from '@/features/home/model/home-page-search-params';
import { AUTH_SESSION_STATES } from '@/types/auth/domain';

interface HomePageServerContentProps {
  activeTab: HomeTab;
}

export default async function HomePageServerContent({
  activeTab,
}: HomePageServerContentProps) {
  const isHistoryTab = activeTab === 'history';
  const { sessionState } = isHistoryTab
    ? await readServerAuthSession()
    : { sessionState: AUTH_SESSION_STATES.ANONYMOUS };
  const canViewHistory = isAuthenticatedMemberSessionState(sessionState);

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
