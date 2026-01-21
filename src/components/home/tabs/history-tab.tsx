'use client';

import { MessageSquareText, History, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';

export default function HistoryTab() {
  // 임시 데이터: 나의 1:1 스터디 히스토리 (최근순)
  const historyItems = [
    {
      id: 'h1',
      title: '알고리즘 1:1 스터디',
      partner: '박지민',
      status: '완료',
      date: '2026-01-18',
      time: 'AM 07:00',
      note: 'DP/그리디 복습 및 코드 리뷰',
    },
    {
      id: 'h2',
      title: 'CS 네트워크 심화',
      partner: '김서준',
      status: '완료',
      date: '2026-01-15',
      time: 'AM 06:30',
      note: 'HTTP/HTTPS, TLS 핸드셰이크 정리',
    },
    {
      id: 'h3',
      title: '자료구조 리마인드',
      partner: '이지은',
      status: '완료',
      date: '2026-01-10',
      time: 'AM 07:30',
      note: '트리/그래프 순회 패턴 리뷰',
    },
    {
      id: 'h4',
      title: '시스템 디자인 라이트',
      partner: '홍민수',
      status: '진행중',
      date: '2026-01-22',
      time: 'AM 06:50',
      note: '캐시 전략과 확장성 개념 잡기',
    },
  ];

  return (
    <div className="flex flex-col gap-400">
      <div className="flex items-center justify-between">
        <h2 className="font-display-headings6 text-text-strong flex items-center gap-150">
          제로원 히스토리
          <History className="w-8 h-8 text-text-brand" />
        </h2>
      </div>

      {/* 임시 데이터 기반 1:1 스터디 히스토리 목록 */}
      <div className="rounded-200 border border-border-subtle bg-background-default p-300 shadow-1 flex flex-col gap-200">
        <div className="flex items-center gap-150">
          <div className="w-[52px] h-[52px] rounded-150 bg-fill-brand-subtle-default flex items-center justify-center">
            <MessageSquareText className="w-6 h-6 text-text-brand" />
          </div>
        <div className="flex flex-col gap-50">
            <h3 className="font-bold-h4 text-text-strong">나의 1:1 스터디 기록</h3>
            <p className="font-designer-13m text-text-subtle">
              최근 진행한 1:1 스터디 히스토리를 임시 데이터로 보여줍니다.
            </p>
          </div>
        </div>

        <div className="divide-y divide-border-subtlest">
          {historyItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-100 py-200"
            >
              <div className="flex flex-wrap items-center gap-150 justify-between">
                <div className="flex items-center gap-100">
                  <CheckCircle2
                    className={cn(
                      'w-5 h-5',
                      item.status === '완료'
                        ? 'text-text-success'
                        : 'text-text-warning',
                    )}
                  />
                  <div className="font-designer-15b text-text-strong">
                    {item.title}
                  </div>
                </div>
                <div className="font-designer-12m text-text-subtle flex items-center gap-75">
                  <Clock className="w-4 h-4" />
                  {item.date} · {item.time}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-150 text-text-subtle font-designer-13m">
                <span className="px-150 py-50 rounded-100 bg-fill-neutral-subtle-default text-text-default">
                  파트너: {item.partner}
                </span>
                <span
                  className={cn(
                    'px-150 py-50 rounded-100',
                    item.status === '완료'
                      ? 'bg-fill-success-subtle-default text-text-success'
                      : 'bg-fill-warning-subtle-default text-text-warning',
                  )}
                >
                  {item.status}
                </span>
              </div>

              <p className="font-designer-14r text-text-default">
                {item.note}
              </p>
            </div>
          ))}
        </div>

        <div className="font-designer-12m text-text-subtlest pt-100">
          * 실제 데이터 연동 전 임시 목록입니다.
        </div>
      </div>
    </div>
  );
}


