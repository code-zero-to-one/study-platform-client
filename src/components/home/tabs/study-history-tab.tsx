'use client';

import { useEffect, useState } from 'react';
import { History, List, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import { StudyHistoryRow } from '@/components/study-history/study-history-row';
import { StudyCalendar } from '@/components/study-history/study-calendar';
import { StudyHistoryItem } from '@/types/study-history';

const MOCK_HISTORY_DATA: StudyHistoryItem[] = [
  {
    id: 1,
    date: '2025.01.20 (월)',
    subject: 'JPA 영속성 컨텍스트 학습',
    role: 'INTERVIEWER',
    attendance: 'ATTENDED',
    link: 'https://notion.so',
    status: 'COMPLETED',
  },
  {
    id: 2,
    date: '2025.01.19 (일)',
    subject: 'Spring Security 인증 필터 체인',
    role: 'INTERVIEWEE',
    attendance: 'ATTENDED',
    link: 'https://github.com',
    status: 'COMPLETED',
  },
  {
    id: 3,
    date: '2025.01.18 (토)',
    subject: 'OS - 프로세스와 스레드 차이',
    role: 'INTERVIEWER',
    attendance: 'NOT_STARTED',
    link: null,
    status: 'COMPLETED',
  },
  {
    id: 4,
    date: '2025.01.17 (금)',
    subject: 'Java GC 알고리즘 종류',
    role: 'INTERVIEWEE',
    attendance: 'NOT_STARTED',
    link: null,
    status: 'IN_PROGRESS',
  },
  {
    id: 5,
    date: '2025.01.16 (목)',
    subject: '네트워크 - TCP 3-way Handshake',
    role: 'INTERVIEWER',
    attendance: 'ATTENDED',
    link: 'https://velog.io',
    status: 'COMPLETED',
  },
  {
    id: 6,
    date: '2025.01.15 (수)',
    subject: 'Spring Boot Auto Configuration',
    role: 'INTERVIEWEE',
    attendance: 'ATTENDED',
    link: 'https://notion.so',
    status: 'COMPLETED',
  },
  {
    id: 7,
    date: '2025.01.14 (화)',
    subject: 'Database Index 설계 원칙',
    role: 'INTERVIEWER',
    attendance: 'NOT_STARTED',
    link: null,
    status: 'COMPLETED',
  },
  {
    id: 8,
    date: '2025.01.13 (월)',
    subject: 'Redis 캐싱 전략',
    role: 'INTERVIEWEE',
    attendance: 'ATTENDED',
    link: 'https://github.com',
    status: 'COMPLETED',
  },
  {
    id: 9,
    date: '2025.01.12 (일)',
    subject: 'Docker 컨테이너 최적화',
    role: 'INTERVIEWER',
    attendance: 'NOT_STARTED',
    link: null,
    status: 'COMPLETED',
  },
  {
    id: 10,
    date: '2025.01.11 (토)',
    subject: 'Kubernetes Pod 라이프사이클',
    role: 'INTERVIEWEE',
    attendance: 'ATTENDED',
    link: 'https://velog.io',
    status: 'COMPLETED',
  },
  {
    id: 11,
    date: '2024.12.30 (월)',
    subject: 'React Hook 최적화 패턴',
    role: 'INTERVIEWER',
    attendance: 'ATTENDED',
    link: 'https://notion.so',
    status: 'COMPLETED',
  },
  {
    id: 12,
    date: '2024.12.29 (일)',
    subject: 'TypeScript 고급 타입 시스템',
    role: 'INTERVIEWEE',
    attendance: 'NOT_STARTED',
    link: null,
    status: 'COMPLETED',
  },
  ...Array.from({ length: 10 }, (_, i) => ({
    id: 20 + i,
    date: `2024.12.${20 - i} (${['월', '화', '수', '목', '금', '토', '일'][i % 7]})`,
    subject: `백엔드 면접 스터디 ${i + 1}주차 - 심화 질문`,
    role: i % 2 === 0 ? 'INTERVIEWEE' : 'INTERVIEWER' as const,
    attendance: Math.random() > 0.3 ? 'ATTENDED' : 'NOT_STARTED' as const,
    link: Math.random() > 0.5 ? 'https://google.com' : null,
    status: 'COMPLETED' as const,
  })),
];

export default function StudyHistoryTab() {
  const [historyItems, setHistoryItems] = useState<StudyHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'LIST' | 'CALENDAR'>('LIST');
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setHistoryItems(MOCK_HISTORY_DATA);
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const totalPages = Math.ceil(historyItems.length / ITEMS_PER_PAGE) || 1;
  const currentHistory = historyItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (isLoading) {
    return (
      <div className="py-800 text-center text-text-subtlest flex flex-col items-center gap-200">
        <Loader2 className="w-8 h-8 animate-spin" />
        <div className="font-designer-16m">1:1 스터디 기록을 불러오는 중입니다...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-400">
      <div className="flex items-center justify-between">
        <h2 className="font-display-headings6 text-text-strong flex items-center gap-150">
          나의 1:1 스터디 기록
          <History className="w-8 h-8 text-text-brand" />
        </h2>

        <div className="flex bg-background-default rounded-100 border border-border-subtle p-50 shrink-0">
          <button
            onClick={() => setViewMode('LIST')}
            className={cn(
              'p-100 rounded-75 transition-colors flex items-center gap-50',
              viewMode === 'LIST' ? 'bg-fill-neutral-default-default text-text-strong shadow-sm' : 'text-text-subtlest hover:text-text-subtle',
            )}
          >
            <List className="w-4 h-4" />
            <span className="font-designer-13m hidden sm:inline">리스트</span>
          </button>
          <button
            onClick={() => setViewMode('CALENDAR')}
            className={cn(
              'p-100 rounded-75 transition-colors flex items-center gap-50',
              viewMode === 'CALENDAR' ? 'bg-fill-neutral-default-default text-text-strong shadow-sm' : 'text-text-subtlest hover:text-text-subtle',
            )}
          >
            <CalendarIcon className="w-4 h-4" />
            <span className="font-designer-13m hidden sm:inline">달력</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-300">
        <div className="font-designer-16m text-text-subtle whitespace-nowrap">
          총 <span className="font-bold text-text-strong">{historyItems.length}</span>개의 1:1 스터디 기록이 있습니다.
        </div>

        {viewMode === 'LIST' ? (
          <div className="bg-background-default rounded-200 border border-border-subtle overflow-hidden shadow-1">
            <div className="grid grid-cols-12 gap-200 px-400 py-250 bg-background-alternative/80 border-b border-border-subtlest font-designer-13b text-text-subtle uppercase tracking-wider">
              <div className="col-span-2">날짜</div>
              <div className="col-span-4">오늘의 주제</div>
              <div className="col-span-2">내 역할</div>
              <div className="col-span-1 text-center">출석</div>
              <div className="col-span-1 text-center">링크</div>
              <div className="col-span-2 text-right">진행 상태</div>
            </div>

            <div className="divide-y divide-border-subtlest">
              {currentHistory.length > 0 ? (
                currentHistory.map((item) => <StudyHistoryRow key={item.id} item={item} />)
              ) : (
                <div className="py-800 text-center text-text-subtlest flex flex-col items-center gap-200">
                  <History className="w-10 h-10 opacity-20" />
                  <p className="font-designer-16m">아직 1:1 스터디 기록이 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <StudyCalendar items={historyItems} />
        )}

        {viewMode === 'LIST' && totalPages > 1 && (
          <div className="flex justify-center gap-100 py-600">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="w-[40px] h-[40px] flex items-center justify-center border border-border-subtle rounded-[9999px] hover:bg-fill-neutral-subtle-hover disabled:opacity-50 disabled:hover:bg-transparent transition-colors text-text-subtle"
            >
              ←
            </button>
            <span className="flex items-center justify-center px-300 h-[40px] font-designer-15m text-text-subtle bg-background-default border border-border-subtle rounded-[9999px]">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="w-[40px] h-[40px] flex items-center justify-center border border-border-subtle rounded-[9999px] hover:bg-fill-neutral-subtle-hover disabled:opacity-50 disabled:hover:bg-transparent transition-colors text-text-subtle"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


