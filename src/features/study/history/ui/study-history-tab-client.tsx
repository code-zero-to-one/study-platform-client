'use client';

import { History, List, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { StudyCalendar } from '@/components/study-history/study-calendar';
import { StudyHistoryRow } from '@/components/study-history/study-history-row';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import { useMyStudyHistory } from '@/features/study/history/model/use-my-study-history-query';
import {
  PageableResponse,
  StudyHistoryItem,
  StudyHistoryContent,
} from '@/types/study-history';
import { GetMyStudyHistoryParams } from '@/features/study/history/api/get-my-study-history';

// 데이터 매핑 함수 (API Response -> UI Model)
const mapHistoryItem = (data: StudyHistoryContent): StudyHistoryItem => {
  const dateObj = new Date(data.scheduledAt);
  const dateStr = `${dateObj.getFullYear()}.${String(dateObj.getMonth() + 1).padStart(2, '0')}.${String(dateObj.getDate()).padStart(2, '0')}`;
  const dayName = ['일', '월', '화', '수', '목', '금', '토'][dateObj.getDay()];

  return {
    id: data.studyId,
    date: `${dateStr} (${dayName})`,
    subject: data.title,
    role: data.participation.role,
    attendance:
      data.participation.attendance === 'PRESENT' ? 'ATTENDED' : 'NOT_STARTED',
    link: data.studyLink,
    status: data.status === 'COMPLETE' ? 'COMPLETED' : 'IN_PROGRESS',
    partner: {
      id: data.partner.memberId,
      name: data.partner.nickname,
      profileImage: data.partner.profileImageUrl,
    },
  };
};

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

  const { data: historyData, isLoading } = useMyStudyHistory(queryParams, {
    initialData: shouldUseInitialData ? initialData : undefined,
  });

  // 데이터 변환
  const historyItems = historyData?.content?.map(mapHistoryItem) || [];
  const totalPages = historyData?.totalPages || 1;
  const totalElements = historyData?.totalElements || 0;

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
    <div className="flex flex-col gap-400">
      <div className="flex items-center justify-between">
        <h2 className="font-display-headings6 text-text-strong flex items-center gap-150">
          나의 1:1 스터디 기록
          <History className="text-text-brand h-8 w-8" />
        </h2>

        <div className="bg-background-default rounded-100 border-border-subtle flex shrink-0 border p-50">
          <button
            onClick={() => setViewMode('LIST')}
            className={cn(
              'rounded-75 flex items-center gap-50 p-100 transition-colors',
              viewMode === 'LIST'
                ? 'bg-fill-neutral-default-default text-text-strong shadow-sm'
                : 'text-text-subtlest hover:text-text-subtle',
            )}
          >
            <List className="h-4 w-4" />
            <span className="font-designer-13m hidden sm:inline">리스트</span>
          </button>
          <button
            onClick={() => setViewMode('CALENDAR')}
            className={cn(
              'rounded-75 flex items-center gap-50 p-100 transition-colors',
              viewMode === 'CALENDAR'
                ? 'bg-fill-neutral-default-default text-text-strong shadow-sm'
                : 'text-text-subtlest hover:text-text-subtle',
            )}
          >
            <CalendarIcon className="h-4 w-4" />
            <span className="font-designer-13m hidden sm:inline">달력</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-300">
        <div className="font-designer-16m text-text-subtle whitespace-nowrap">
          총 <span className="text-text-strong font-bold">{totalElements}</span>
          개의 1:1 스터디 기록이 있습니다.
        </div>

        {viewMode === 'LIST' ? (
          <div className="bg-background-default rounded-200 border-border-subtle shadow-1 overflow-hidden border">
            <div className="bg-background-alternative/80 border-border-subtlest font-designer-13b text-text-subtle flex gap-400 border-b px-400 py-250 tracking-wider uppercase">
              <div className="w-[150px] shrink-0">날짜</div>
              <div className="min-w-0 flex-1">오늘의 주제</div>
              <div className="w-[150px] shrink-0">상대방</div>
              <div className="w-[120px] shrink-0 text-center">내 역할</div>
              <div className="w-[100px] shrink-0 text-center">역할수행여부</div>
              <div className="w-[100px] shrink-0 text-center">진행상태</div>
              <div className="w-[80px] shrink-0 text-center">링크</div>
            </div>

            <div className="divide-border-subtlest divide-y">
              {historyItems.length > 0 ? (
                historyItems.map((item) => (
                  <StudyHistoryRow key={item.id} item={item} />
                ))
              ) : (
                <div className="text-text-subtlest flex flex-col items-center gap-200 py-800 text-center">
                  <History className="h-10 w-10 opacity-20" />
                  <p className="font-designer-16m">
                    아직 1:1 스터디 기록이 없습니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <StudyCalendar
            items={historyItems}
            currentDate={currentCalendarDate}
            onDateChange={setCurrentCalendarDate}
          />
        )}

        {viewMode === 'LIST' && totalPages > 1 && (
          <div className="flex justify-center gap-100 py-600">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="border-border-subtle hover:bg-fill-neutral-subtle-hover text-text-subtle flex h-[40px] w-[40px] items-center justify-center rounded-[9999px] border transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
            >
              ←
            </button>
            <span className="font-designer-15m text-text-subtle bg-background-default border-border-subtle flex h-[40px] items-center justify-center rounded-[9999px] border px-300">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="border-border-subtle hover:bg-fill-neutral-subtle-hover text-text-subtle flex h-[40px] w-[40px] items-center justify-center rounded-[9999px] border transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
