'use client';

import { ChevronRight } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  usePatchAutoMatchingMutation,
  useUserProfileQuery,
} from '@/entities/user/model/use-user-profile-query';
import ProfileDefault from '@/entities/user/ui/icon/profile-default.svg';
import { getCookie } from '@/shared/tanstack-query/cookie';
import ReservationCard from './reservation-user-card';
import { useWeeklyParticipation } from '../../model/use-study-query';
import StartStudyModal from '../../ui/start-study-modal';
import { useInfiniteReservation } from '../model/use-participation-query';

interface ReservationListProps {
  studyDate?: string;
  pageSize?: number;
  month: number;
  week: number;
}

export default function ReservationList({
  studyDate,
  pageSize = 50,
  month,
  week,
}: ReservationListProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [memberId, setMemberId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const id = getCookie('memberId');
    setMemberId(id ? Number(id) : null);
  }, []);

  const { data: participation } = useWeeklyParticipation(studyDate);
  const isParticipation = participation?.isParticipate ?? false;

  const { data: userProfile } = useUserProfileQuery(memberId ?? 0);
  const autoMatching = userProfile?.autoMatching ?? false;

  const applied = autoMatching || isParticipation;

  const firstMemberId = useMemo(
    () => (applied && memberId !== null ? memberId : null),
    [applied, memberId],
  );

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteReservation(firstMemberId ?? undefined, pageSize);

  const { mutate: patchAutoMatching, isPending } =
    usePatchAutoMatchingMutation();

  useEffect(() => {
    if (!hasNextPage) return;

    const targetElement = sentinelRef.current;
    if (!targetElement) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        const isVisible = entries.some((entry) => entry.isIntersecting);
        if (isVisible && hasNextPage && !isFetchingNextPage) {
          await fetchNextPage();
        }
      },
      { rootMargin: '200px 0px' },
    );

    observer.observe(targetElement);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const items = data?.items ?? [];
  const studyApplied = userProfile?.studyApplied ?? false;

  const handleApplyClick = () => {
    if (!memberId) return;

    if (studyApplied) {
      if (isPending) return;
      patchAutoMatching({ memberId, autoMatching: true });
    } else {
      setIsModalOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="py-10 text-center text-sm text-gray-500">
        불러오는 중…
      </div>
    );
  }

  return (
    <div className="space-y-300">
      <div className="flex justify-between">
        <div className="text-text-strong font-designer-28b">
          {`${month}월 ${week}주차 스터디 신청 목록`}
        </div>
        <div className="text-text-subtlest font-designer-24b">
          총 {data?.total}명
        </div>
      </div>

      <div className="grid grid-cols-1 gap-200 md:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <ReservationCard
            key={p.id}
            participant={p}
            currentMemberId={firstMemberId}
          />
        ))}

        {!applied && (
          <div
            className="rounded-100 bg-fill-information-subtle-default hover:bg-fill-information-subtle-hover active:bg-fill-information-subtle-pressed flex h-[100px] items-center justify-between gap-150 px-200 py-300"
            onClick={handleApplyClick}
          >
            <ProfileDefault
              width={48}
              height={48}
              className="text-background-accent-blue-default shrink-0"
              style={{ '--outer-color': '#FFFFFF' } as React.CSSProperties}
              aria-hidden
            />
            <div className="flex flex-1 flex-col justify-start gap-50">
              <span className="text-text-information font-designer-16b">
                {`${month}월 ${week}주차 스터디 신청하기`}
              </span>
              <span className="text-text-subtle font-designer-13r">
                지금 신청하면 함께할 수 있어요
              </span>
            </div>
            <ChevronRight size={28} className="text-icon-information" />
          </div>
        )}
      </div>

      <div ref={sentinelRef} className="h-10 w-full">
        {isFetchingNextPage && (
          <div className="font-designer-13r">더 불러오는 중…</div>
        )}
      </div>

      {memberId && (
        <StartStudyModal
          memberId={memberId}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      )}
    </div>
  );
}
