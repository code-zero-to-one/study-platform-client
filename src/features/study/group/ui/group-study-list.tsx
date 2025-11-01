'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { hashValue } from '@/shared/lib/hash';
import { useIntersectionObserver } from '@/shared/lib/intersection-observer';
import { getCookie } from '@/shared/tanstack-query/cookie';
import Badge from '@/shared/ui/badge';

import { BasicInfoDetail } from '../api/group-study-types';
import {
  EXPERIENCE_LEVEL_LABELS,
  REGULAR_MEETING_LABELS,
  ROLE_LABELS,
  STUDY_TYPE_LABELS,
} from '../const/group-study-const';
import { useGroupStudyListQuery } from '../model/use-group-study-list-query';

interface GroupStudyListProps {
  isLoggedIn: boolean;
}

export default function GroupStudyList({ isLoggedIn }: GroupStudyListProps) {
  const router = useRouter();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGroupStudyListQuery();

  const groupStudyList = data?.pages.flatMap((page) => page.content) || [];

  // useIntersectionObserver 커스텀 훅 사용
  const sentinelRef = useIntersectionObserver(
    async () => {
      if (hasNextPage && !isFetchingNextPage) {
        await fetchNextPage();
      }
    },
    {
      rootMargin: '200px 0px',
      enabled: !!hasNextPage,
    },
  );

  const basicInfoItems = (basicInfo: BasicInfoDetail) => {
    const {
      type,
      targetRoles,
      experienceLevels,
      regularMeeting,
      maxMembersCount,
      price,
      approvedCount,
    } = basicInfo;

    // 타입 변환
    const typeLabel = STUDY_TYPE_LABELS[type];

    // 역할 변환
    const targetRolesLabel = targetRoles
      .map((role) => {
        return ROLE_LABELS[role];
      })
      .join(', ');

    // 경력 변환
    const experienceLabel =
      experienceLevels
        .map((level) => {
          return EXPERIENCE_LEVEL_LABELS[level];
        })
        .join(', ') || '무관';

    // 정기모임
    const frequencyLabel = REGULAR_MEETING_LABELS[regularMeeting];

    // 참가비
    const priceLabel = price === 0 ? '무료' : `${price.toLocaleString()}원`;

    return [
      { label: '유형', value: typeLabel },
      { label: '주제', value: targetRolesLabel },
      { label: '경력', value: experienceLabel },
      { label: '정기모임', value: frequencyLabel },
      { label: '모집인원', value: `${approvedCount}/${maxMembersCount}` },
      { label: '참가비', value: priceLabel },
    ];
  };

  if (isLoading) {
    return (
      <div className="flex h-[500px] items-center justify-center">
        <Loader2 className="text-background-brand-default h-[100px] w-[100px] animate-spin" />
      </div>
    );
  }

  return (
    <>
      {groupStudyList.length > 0 ? (
        <>
          <div
            className={`grid ${isLoggedIn ? 'grid-cols-1' : 'grid-cols-2'} gap-200`}
          >
            {groupStudyList.map((study, index) => {
              return (
                <div
                  className="rounded-100 flex w-full cursor-pointer justify-between gap-500 border border-solid border-[#D5D7DA] p-400"
                  key={index}
                  onClick={() => {
                    const memberId = getCookie('memberId');
                    sendGTMEvent({
                      event: 'group_study_detail_view',
                      dl_timestamp: new Date().toISOString(),
                      ...(memberId && { dl_member_id: hashValue(memberId) }),
                      dl_study_id: String(study.basicInfo.groupStudyId),
                      dl_study_title: study.simpleDetailInfo.title,
                    });
                    router.push(`study/${study.basicInfo.groupStudyId}`);
                  }}
                >
                  <div className="flex flex-col justify-between">
                    <div className="flex flex-col gap-100">
                      <div className="flex gap-100">
                        {study.basicInfo.hostType === 'ZEROONE' && (
                          <Badge color="red">제로원 스터디</Badge>
                        )}

                        <span className="font-designer-18b max-w-[673px] truncate text-[#252B37]">
                          {study.simpleDetailInfo.title}
                        </span>
                      </div>
                      <p className="font-designer-15r line-clamp-2 text-[15px] leading-[29px] text-[#535862]">
                        {study.simpleDetailInfo.summary}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 grid-rows-2 gap-x-100 gap-y-50">
                      {basicInfoItems(study.basicInfo).map((item, idx) => (
                        <div key={idx} className="flex gap-50">
                          <span className="font-designer-13m leading-250 text-[#A4A7AE]">
                            {item.label}
                          </span>
                          <span className="font-designer-13m text-[#535862]">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Image
                    src={
                      study.simpleDetailInfo.thumbnail.resizedImages[0]
                        .resizedImageUrl
                    }
                    alt="thumbnail"
                    className="h-[160px] w-[240px] object-cover"
                    width={240}
                    height={160}
                  />
                </div>
              );
            })}
          </div>
          {/* 아래는 다음 페이지 데이터를 불러오기 위한 요소입니다. */}
          <div
            ref={sentinelRef as React.RefObject<HTMLDivElement>}
            className="h-10 w-full"
          >
            {isFetchingNextPage && (
              <div className="flex h-[100px] items-center justify-center">
                <Loader2 className="text-background-brand-default h-[50px] w-[50px] animate-spin" />
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-background-alternative rounded-100 flex h-[640px] flex-col items-center justify-center gap-300">
          <Image
            src="/icons/empty-study-case.svg"
            alt="현재 그룹 스터디가 없습니다."
            width={88}
            height={88}
          />

          <div className="flex flex-col items-center justify-center gap-100">
            <span className="text-text-subtle font-designer-20b">
              스터디가 아직 준비되지 않았습니다.
            </span>
            <span className="text-text-subtlest font-designer-16r">
              원하는 주제로 스터디를 개설해 첫 번째 참여자가 되어보세요.
            </span>
          </div>
        </div>
      )}
    </>
  );
}
