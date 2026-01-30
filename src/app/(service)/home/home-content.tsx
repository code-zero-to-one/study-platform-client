'use client';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import TabNavigation from '@/components/home/tab-navigation';
import StudyCard from '@/features/study/schedule/ui/study-card';
import Banner from '@/widgets/home/banner';

// 탭 컴포넌트들을 동적으로 로드 (성능 최적화)
const StudyTab = dynamic(() => import('@/components/home/tabs/study-tab'), {
  loading: () => (
    <div className="flex flex-col gap-500">
      <Banner />
      <StudyCard />
    </div>
  ),
  ssr: false,
});

const HallOfFameTab = dynamic(
  () => import('@/components/home/tabs/hall-of-fame-tab'),
  {
    loading: () => (
      <div className="text-text-subtlest py-800 text-center">로딩 중...</div>
    ),
    ssr: false,
  },
);

const ArchiveTab = dynamic(() => import('@/components/home/tabs/archive-tab'), {
  loading: () => (
    <div className="text-text-subtlest py-800 text-center">로딩 중...</div>
  ),
  ssr: false,
});

const CommunityTab = dynamic(
  () => import('@/components/home/tabs/community-tab'),
  {
    loading: () => (
      <div className="text-text-subtlest py-800 text-center">로딩 중...</div>
    ),
    ssr: false,
  },
);

const StudyHistoryTab = dynamic(
  () => import('@/components/home/tabs/study-history-tab'),
  {
    loading: () => (
      <div className="text-text-subtlest py-800 text-center">로딩 중...</div>
    ),
    ssr: false,
  },
);

function HomeContentInner() {
  const searchParams = useSearchParams();
  const activeTab = searchParams?.get('tab') || 'study'; // 기본값을 'study'로 설정

  // 이제 항상 탭 시스템을 사용
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
        // 알 수 없는 탭이면 기본값으로 폴백
        return <StudyTab />;
    }
  };

  return (
    <>
      {/* 탭 네비게이션 */}
      <TabNavigation activeTab={activeTab} />

      {/* 탭 콘텐츠 */}
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

export default function HomeContent() {
  return (
    <Suspense
      fallback={
        <>
          <Banner />
          <StudyCard />
        </>
      }
    >
      <HomeContentInner />
    </Suspense>
  );
}
