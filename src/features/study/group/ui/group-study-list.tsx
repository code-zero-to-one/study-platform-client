'use client';
import { useInfiniteQuery } from '@tanstack/react-query';
import Image from 'next/image';
import React, { Fragment } from 'react';
import Badge from '@/shared/ui/badge';
import { getGroupStudyList } from '../api/get-group-study-list';
import { DetailBasicInfo } from '../api/group-study-types';
import { useRouter } from 'next/navigation';

export enum Method {
  ONLINE = '온라인',
  OFFLINE = '오프라인',
  HYBRID = '혼합',
}

export enum Type {
  PROJECT = '프로젝트',
  MENTORING = '멘토링',
  SEMINAR = '세미나',
  CHALLENGE = '챌린지',
  BOOK_STUDY = '책 스터디',
  LECTURE_STUDY = '강의 스터디',
}

export enum Frequency {
  NONE = '없음',
  WEEKLY = '주 1회',
  BIWEEKLY = '주 2회',
  TRIPLE_WEEKLY_OR_MORE = '주 3회 이상',
}

export default function GroupStudyList() {
  const router = useRouter();
  const { data, fetchNextPage } = useInfiniteQuery({
    queryKey: ['groupStudies'],
    queryFn: async ({ pageParam }) => {
      const response = await getGroupStudyList({
        page: pageParam,
        size: 20,
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
    initialPageParam: 0,
    maxPages: 3,
  });

  const basicInfoItems = (
    basicInfo: DetailBasicInfo,
    currentParticipantCount: number,
  ) => [
    {
      label: '유형',
      value: Type[basicInfo.type as keyof typeof Type],
    },
    {
      label: '주제',
      value: basicInfo.targetRoles
        .map((role) => {
          switch (role) {
            case 'FRONTEND':
              return '프론트엔드';
            case 'BACKEND':
              return '백엔드';
            case 'PLANNER':
              return '기획';
            case 'DESIGNER':
              return '디자이너';
          }
        })
        .join(', '),
    },
    {
      label: '경력',
      value:
        basicInfo.experienceLevels
          .map((level) => {
            switch (level) {
              case 'BEGINNER':
                return '입문자';
              case 'JUNIOR':
                return '주니어';
              case 'MIDDLE':
                return '미들레벨';
              case 'SENIOR':
                return '시니어';
              case 'JOB_SEEKER':
                return '취준생';
              default:
                return level;
            }
          })
          .join(', ') || '무관',
    },
    {
      label: '정기모임',
      value: `${Frequency[basicInfo.regularMeeting as keyof typeof Frequency]}`,
    },
    {
      label: '모집인원',
      value: `${currentParticipantCount}/${basicInfo.maxMembersCount}`,
    },
    {
      label: '참가비',
      value:
        basicInfo.price === 0
          ? '무료'
          : `${basicInfo.price.toLocaleString()}원`,
    },
  ];

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
                    {basicInfoItems(
                      study.basicInfo,
                      study.currentParticipantCount,
                    ).map((item, idx) => (
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
