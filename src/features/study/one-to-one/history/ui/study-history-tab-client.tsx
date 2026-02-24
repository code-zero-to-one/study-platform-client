'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import SectionShell from '@/components/ui/section-shell';
import { GetMyStudyHistoryParams } from '@/features/study/one-to-one/history/api/get-my-study-history';
import { useMyStudyHistoryQuery } from '@/features/study/one-to-one/history/model/use-my-study-history-query';
import { useScrollToHomeContentOnChange } from '@/hooks/use-scroll-to-home-content';
import { PageableResponse, StudyHistoryContent } from '@/types/one-to-one-study/study-history';
import StudyHistoryCalendarSection from './study-history-calendar-section';
import StudyHistoryHeader from './study-history-header';
import StudyHistoryListSection from './study-history-list-section';
import StudyHistoryPagination from './study-history-pagination';
import { mapHistoryItem } from './study-history-utils';

interface StudyHistoryTabClientProps {
  initialData?: PageableResponse<StudyHistoryContent>;
  initialParams: GetMyStudyHistoryParams;
}

export default function StudyHistoryTabClient({
  initialData,
  initialParams,
}: StudyHistoryTabClientProps) {
  const [viewMode, setViewMode] = useState<'LIST' | 'CALENDAR'>('LIST');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  useScrollToHomeContentOnChange([viewMode]);
  const ITEMS_PER_PAGE = 15;

  // API 파라미터 동적 생성
  const getQueryParams = () => {
    if (viewMode === 'CALENDAR') {
      const year = currentCalendarDate.getFullYear();
      const month = currentCalendarDate.getMonth() + 1;
      const lastDay = new Date(year, month, 0).getDate(); // 해당 월의 마지막 날짜

      return {
        page: 0,
        size: 100, // 한 달치 데이터를 충분히 가져오기 위해 크게 설정
        startDate: `${year}-${String(month).padStart(2, '0')}-01`,
        endDate: `${year}-${String(month).padStart(2, '0')}-${lastDay}`,
        sort: 'createdAt,desc', // 요청대로 createdAt 사용 (단, 캘린더 뷰라면 scheduledAt이 더 적절할 수 있음)
      };
    }

    return {
      page: currentPage - 1,
      size: ITEMS_PER_PAGE,
      sort: 'createdAt,desc',
    };
  };

  const queryParams = getQueryParams();
  const shouldUseInitialData =
    queryParams.page === initialParams.page &&
    queryParams.size === initialParams.size &&
    queryParams.startDate === initialParams.startDate &&
    queryParams.endDate === initialParams.endDate &&
    queryParams.sort === initialParams.sort;

  const { data: historyData, isLoading } = useMyStudyHistoryQuery(queryParams, {
    initialData: shouldUseInitialData ? initialData : undefined,
  });

  // 데이터 변환
  const historyItems = historyData?.content?.map(mapHistoryItem) || [];
  const totalPages = historyData?.totalPages || 1;
  const totalElements = historyData?.totalElements || 0;
  const calendarMonth = currentCalendarDate.getMonth() + 1;
  const calendarCount = historyItems.length;

  if (isLoading) {
    return (
      <div className="text-text-subtlest flex flex-col items-center gap-200 py-800 text-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <div className="font-designer-16m">
          1:1 스터디 기록을 불러오는 중입니다...
        </div>
      </div>
    );
  }

  return (
    <SectionShell>
      <StudyHistoryHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalElements={totalElements}
        calendarMonth={calendarMonth}
        calendarCount={calendarCount}
      />

      <div className="flex flex-col gap-300">
        {viewMode === 'LIST' ? (
          <StudyHistoryListSection items={historyItems} />
        ) : (
          <StudyHistoryCalendarSection
            items={historyItems}
            currentDate={currentCalendarDate}
            onDateChange={setCurrentCalendarDate}
          />
        )}

        {viewMode === 'LIST' && (
          <StudyHistoryPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </SectionShell>
  );
}
