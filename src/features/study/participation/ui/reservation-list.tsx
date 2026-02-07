'use client';

import { ChevronRight } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import SectionHeader from '@/components/ui/section-header';
import {
  usePatchAutoMatchingMutation,
  useUserProfileQuery,
} from '@/entities/user/model/use-user-profile-query';
import ProfileDefault from '@/entities/user/ui/icon/profile-default.svg';
import { usePhoneVerificationStatus } from '@/features/phone-verification/model/use-phone-verification-status';
import PhoneVerificationModal from '@/features/phone-verification/ui/phone-verification-modal';
import ReservationCard from '@/features/study/participation/ui/reservation-user-card';
import StartStudyModal from '@/features/study/participation/ui/start-study-modal';
import { useAuth } from '@/hooks/common/use-auth';
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
  const { data: authData } = useAuth();
  const memberId = authData?.memberId ?? null;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: userProfile } = useUserProfileQuery(memberId ?? 0);
  const autoMatching = userProfile?.autoMatching ?? false;

  // 서버 상태와 동기화된 인증 상태 사용
  const { isVerified, setVerified } = usePhoneVerificationStatus(
    memberId ?? undefined,
  );
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  const firstMemberId = useMemo(
    () => (autoMatching && memberId !== null ? memberId : null),
    [autoMatching, memberId],
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

  const handleVerificationComplete = (phoneNumber: string) => {
    setVerified(phoneNumber);
    setIsVerificationModalOpen(false);

    // 인증 완료 후 원래 동작 수행
    if (studyApplied) {
      patchAutoMatching({ memberId: memberId!, autoMatching: true });
    } else {
      setIsModalOpen(true);
    }
  };

  const handleApplyClick = () => {
    if (!memberId) return;

    // 본인인증이 안되어 있으면 본인인증 모달 먼저 열기
    if (!isVerified) {
      setIsVerificationModalOpen(true);

      return;
    }

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
    <div className="space-y-300" data-tutorial="study-recruit-list">
      <SectionHeader
        title={`${month}월 ${week}주차 스터디 신청 목록`}
        rightSlot={
          <div className="text-text-subtlest font-designer-24b">
            총 {data?.total}명
          </div>
        }
        className="gap-0"
        titleClassName="text-text-strong font-designer-28b"
      />

      <div className="grid grid-cols-1 gap-200 md:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <ReservationCard
            key={p.id}
            participant={p}
            currentMemberId={firstMemberId}
          />
        ))}

        {!autoMatching && (
          <div
            className="rounded-100 bg-fill-information-subtle-default hover:bg-fill-information-subtle-hover active:bg-fill-information-subtle-pressed flex h-[100px] cursor-pointer items-center justify-between gap-150 px-200 py-300 transition-all duration-300"
            onClick={handleApplyClick}
            style={{
              animation: 'subtle-pulse 1s ease-in-out infinite',
            }}
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
        <>
          <StartStudyModal
            memberId={memberId}
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
          />
          <PhoneVerificationModal
            open={isVerificationModalOpen}
            onOpenChange={setIsVerificationModalOpen}
            onVerificationComplete={handleVerificationComplete}
            memberId={memberId}
          />
        </>
      )}
    </div>
  );
}
