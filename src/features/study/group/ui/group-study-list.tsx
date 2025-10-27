'use client';
import { useInfiniteQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { Fragment } from 'react';
import Badge from '@/shared/ui/badge';
import { getGroupStudyList } from '../api/get-group-study-list';

import { BasicInfoDetail } from '../api/group-study-types';
import {
  EXPERIENCE_LEVEL_LABELS,
  REGULAR_MEETING_LABELS,
  ROLE_LABELS,
  STUDY_TYPE_LABELS,
} from '../const/group-study-const';

export default function GroupStudyList() {
  const router = useRouter();
  const { data } = useInfiniteQuery({
    queryKey: ['groupStudies'],
    queryFn: async ({ pageParam }) => {
      const response = await getGroupStudyList({
        page: pageParam,
        size: 100,
        status: 'RECRUITING',
      });

      return response;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.hasNext) {
        return lastPage.page + 1;
      }

      return null;
    },
    initialPageParam: 1,
    maxPages: 3,
  });

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

  return (
    <div className="flex flex-col gap-200">
      {data?.pages.map((page, i) => (
        <Fragment key={i}>
          {page.content.map((study, index) => {
            return (
              <div
                className="rounded-100 flex w-full cursor-pointer justify-between gap-500 border border-solid border-[#D5D7DA] p-400"
                key={index}
                onClick={() =>
                  router.push(`study/${study.basicInfo.groupStudyId}`)
                }
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
                    'https://test-api.zeroone.it.kr/images/group-study/thumbnails/clean-code-thumbnail.png'
                  }
                  alt="thumbnail"
                  width={240}
                  height={160}
                />
              </div>
            );
          })}
        </Fragment>
      ))}
    </div>
  );
}
