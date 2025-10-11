'use client';

import Image from 'next/image';
import Button from '@/shared/ui/button';
import InfoCard from '@/widgets/study/group/ui/group-detail/InfoCard';
import { useGroupStudyDetailQuery } from '../model/use-study-query';
import { ExtendedBasicInfoDetail } from '../api/group-study-types';
import { Frequency, Type } from './group-study-list';
import dayjs from 'dayjs';
import UserAvatar from '@/shared/ui/avatar';
import UserProfileModal from '@/entities/user/ui/user-profile-modal';

export enum StudyStatus {
  RECRUITING = '모집 중',
  IN_PROGRESS = '진행 중',
  COMPLETED = '완료됨',
}

export default function StudyPage({ id }: { id: number }) {
  const { data, isLoading, isError } = useGroupStudyDetailQuery(id);

  if (isLoading) return;

  const basicInfoItems = (
    basicInfo: ExtendedBasicInfoDetail,
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
      label: '진행 방식',
      value: `${basicInfo.location}`,
    },
    {
      label: '진행 기간',
      value: `${Frequency[basicInfo.regularMeeting as keyof typeof Frequency]}`,
    },
    {
      label: '정기모임',
      value: `${Frequency[basicInfo.regularMeeting as keyof typeof Frequency]}`,
    },
    {
      label: '모집인원',
      value: `${basicInfo.maxMembersCount}`,
    },
    {
      label: '시작일자',
      value: dayjs(basicInfo.createdAt).format('YYYY.MM.DD'),
    },
    {
      label: '참가비',
      value:
        basicInfo.price === 0
          ? '무료'
          : `${basicInfo.price.toLocaleString()}원`,
    },
    {
      label: '상태',
      value: `${StudyStatus[basicInfo.status as keyof typeof StudyStatus]}`,
    },
  ];

  return (
    <div className="flex w-full max-w-[1164px] flex-col gap-400 py-500">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-150">
          <p className="font-designer-28b text-[#181D27]">
            {data?.detailInfo.title}
          </p>
          <p className="font-designer-18r text-[#252B37]">
            {data?.detailInfo.summary}
          </p>
        </div>
        <div className="flex gap-100">
          <Button>수정하기</Button>
          <Button>스터디 삭제</Button>
        </div>
      </div>
      <div className="flex w-full gap-600">
        <div className="flex flex-1 flex-col gap-500">
          <Image
            src={data?.detailInfo.image.resizedImages[0].resizedImageUrl}
            alt="썸네일"
            width={781}
            height={439}
          />
          <div className="flex flex-col gap-600">
            <div className="flex flex-col gap-200">
              <p className="font-designer-20b">스터디 소개</p>
              <div className="font-designer-16r text-[#535862]">
                {data?.detailInfo.description}
              </div>
            </div>
            <div className="flex flex-col gap-200">
              <p className="font-designer-20b">기본 정보</p>
              <div>프로필박스</div>
              <div className="grid grid-cols-4 grid-rows-3 gap-150">
                {basicInfoItems(data?.basicInfo, 7).map((item, index) => {
                  return (
                    <InfoCard
                      key={index}
                      title={item.label}
                      value={item.value}
                    />
                  );
                })}
              </div>
            </div>
            <div className="flex flex-col gap-200">
              <div className="font-designer-20b flex gap-100">
                <span>실시간 신청자 목록</span>
                <span className="text-[#A4A7AE]">{`${7}명`}</span>
              </div>
              <div className="rounded-100 border-border-subtle flex h-[100px] items-center justify-between gap-150 border px-200 py-300">
                {/* <UserAvatar
                  size={48}
                  image={participant.avatarUrl?.trim() || ''}
                /> */}
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex flex-row items-center gap-1">
                    <div className="font-designer-16b">{'test'}</div>
                  </div>
                  <div className="font-designer-13r truncate">{'diq'}</div>
                </div>
                <UserProfileModal
                  memberId={1}
                  trigger={
                    <div className="bg-fill-neutral-default-default text-text-default hover:bg-fill-neutral-default-hover active:bg-fill-neutral-default-pressed font-designer-14b rounded-75 flex cursor-pointer items-center justify-center px-75 py-50">
                      프로필
                    </div>
                  }
                />
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-150 flex w-[335px] flex-col gap-500 self-start border-[1px] border-[#D5D7DA] p-300">
          <div>스터디정보</div>
          <div className="flex flex-col gap-100">
            <Button size="large" color="primary">
              신청하기
            </Button>
            <Button>공유하기</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
