'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { FaPlus } from 'react-icons/fa6';
import MyStudyInfoCard, {
  MyStudyInfoProps,
} from '@/features/my-page/ui/my-study-info-card';
import Button from '@/shared/ui/button';

const studyList = [
  {
    imageUrl: '/images/study1.jpg',
    status: '시작 전',
    title: '코딩 초보를 위한 웹프로그래밍 스터디',
    leaderLabel: '스터디 리더',
    members: '1/4',
    startDate: '2025.10.10',
    endDate: '',
    applicantsLabel: '신청자 N명 확인하기',
  },
  {
    imageUrl: '/images/study2.jpg',
    status: '모집 중',
    title: '프론트엔드 기초부터 차근차근',
    leaderLabel: '스터디 리더',
    members: '2/5',
    startDate: '2025.10.20',
    endDate: '2025.12.21',
    applicantsLabel: '신청자 N명 확인하기',
  },
  {
    imageUrl: '/images/study3.jpg',
    status: '진행 중',
    title: 'Next.js 실무 프로젝트 스터디',
    leaderLabel: '스터디 리더',
    members: '4/4',
    startDate: '2025.09.01',
    endDate: '2027.02.31',
    applicantsLabel: '신청자 N명 확인하기',
  },
  {
    imageUrl: '/images/study4.jpg',
    status: '모집 완료',
    title: 'UI/UX 디자인 입문 스터디',
    leaderLabel: '스터디 리더',
    members: '3/3',
    startDate: '2025.10.25',
    applicantsLabel: '신청자 N명 확인하기',
  },
];

interface StudyCarouselProps {
  items: MyStudyInfoProps[];
  cardsPerPage?: number; // 기본 3
}

function StudyCarousel({ items, cardsPerPage = 3 }: StudyCarouselProps) {
  // 반응형으로 작은 화면에서는 cardsPerPage 줄어들게 처리 (sm:2, xs:1) — 여기서는 JS로 고정 페이지 사이즈(3)로 계산하고 CSS grid로 반응
  const [page, setPage] = useState(0);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(items.length / cardsPerPage)),
    [items.length, cardsPerPage],
  );

  useEffect(() => {
    // 페이지가 더 이상 유효하지 않을 때 보정 (예: items 변경 시)
    if (page >= totalPages) setPage(totalPages - 1);
  }, [totalPages, page]);

  // 현재 페이지에 보여줄 items
  const pageItems = useMemo(() => {
    const start = page * cardsPerPage;

    return items.slice(start, start + cardsPerPage);
  }, [items, page, cardsPerPage]);

  const goPrev = () => setPage((p) => Math.max(0, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  // 키보드 화살표로 페이지 변경 (접근성)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);

    return () => window.removeEventListener('keydown', onKey);
  }, [totalPages]);

  return (
    <section className="relative w-full">
      <div className="mb-200 flex items-center justify-between">
        <h2 className="font-designer-16b">참여 중인 스터디</h2>

        <div className="flex items-center gap-200">
          <Button
            onClick={goPrev}
            aria-label="이전"
            className="rounded-md p-2 hover:bg-gray-100 disabled:opacity-40"
            disabled={page === 0}
          >
            <ChevronLeft className="h-300 w-300" />
          </Button>

          <button
            onClick={goNext}
            aria-label="다음"
            className="rounded-md p-2 hover:bg-gray-100 disabled:opacity-40"
            disabled={page === totalPages - 1}
          >
            <ChevronRight className="h-300 w-300" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        {/* 슬라이드 컨테이너: transform 애니메이션으로 부드럽게 넘기도록 할 수도 있지만 여기선 단순 페이징 */}
        <div className="grid grid-cols-1 justify-items-center gap-x-300 sm:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((item, idx) => (
            <MyStudyInfoCard key={idx + page * cardsPerPage} {...item} />
          ))}
        </div>
      </div>

      {/* 도트 (페이지 인디케이터) */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            aria-label={`페이지 ${i + 1}`}
            onClick={() => setPage(i)}
            className={`h-2 w-2 rounded-full transition ${
              i === page ? 'bg-gray-800' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </section>
  );
}

export default function MyStudy() {
  function showEntire() {
    console.log('눌렀습니다');
  }

  return (
    <div className="flex flex-col gap-300">
      <div className="flex flex-row justify-between">
        <div className="font-designer-20b">마이스터디</div>
        <Button icon={<FaPlus color="icon-inverse" />} size="medium">
          스터디 개설하기
        </Button>
      </div>
      <div className="flex flex-col gap-600">
        <StudyCarousel items={studyList} cardsPerPage={3} />
        <div className="flex flex-row justify-between">
          <div className="font-designer-16b">종료된 스터디</div>
          <div
            className="font-designer-14m text-text-subtlest"
            onClick={showEntire}
          >
            전체보기
          </div>
        </div>
        <div>
          <div className="grid grid-cols-1 justify-items-center gap-x-300 gap-y-500 sm:grid-cols-2 lg:grid-cols-3">
            {studyList.map((study, index) => (
              <MyStudyInfoCard key={index} {...study} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
