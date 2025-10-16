'use client';

import dayjs from 'dayjs';
import {
  Calendar,
  Clock,
  File,
  Folder,
  Globe,
  HandCoins,
  MapPin,
  SignpostBig,
  UserCheck,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import UserProfileModal from '@/entities/user/ui/user-profile-modal';
import { useApplicantsByStatusQuery } from '@/features/application/model/use-applicant-qeury';
import { getSincerityPresetByLevelName } from '@/shared/config/sincerity-temp-presets';
import { cn } from '@/shared/shadcn/lib/utils';
import UserAvatar from '@/shared/ui/avatar';
import Button from '@/shared/ui/button';
import InfoCard from '@/widgets/study/group/ui/group-detail/InfoCard';

import { BasicInfoDetail } from '../api/group-study-types';
import {
  EXPERIENCE_LEVEL_LABELS,
  REGULAR_MEETING_LABELS,
  ROLE_LABELS,
  STUDY_STATUS_LABELS,
  STUDY_TYPE_LABELS,
} from '../const/group-study-const';
import { useGroupStudyDetailQuery } from '../model/use-study-query';

export default function StudyDetailPage({ id: groupStudyId }: { id: number }) {
  const { data: studyDetail, isLoading } =
    useGroupStudyDetailQuery(groupStudyId);

  const { data: applicants } = useApplicantsByStatusQuery({
    groupStudyId,
    status: 'APPROVED',
  });

  if (isLoading) return;

  const basicInfoItems = (basicInfo: BasicInfoDetail) => [
    {
      label: '유형',
      value: STUDY_TYPE_LABELS[basicInfo.type],
      icon: <Folder size={24} color="#A4A7AE" />,
    },
    {
      label: '주제',
      value: basicInfo.targetRoles
        .map((role) => {
          return ROLE_LABELS[role];
        })
        .join(', '),
      icon: <File size={24} color="#A4A7AE" />,
    },
    {
      label: '경력',
      value:
        basicInfo.experienceLevels
          .map((level) => {
            return EXPERIENCE_LEVEL_LABELS[level];
          })
          .join(', ') || '무관',
      icon: <UserCheck size={24} color="#A4A7AE" />,
    },
    {
      label: '진행 방식',
      value: `${basicInfo.location}`,
      icon: <Globe size={24} color="#A4A7AE" />,
    },
    {
      label: '진행 기간',
      value: REGULAR_MEETING_LABELS[basicInfo.regularMeeting],
      icon: <Calendar size={24} color="#A4A7AE" />,
    },
    {
      label: '정기모임',
      value: REGULAR_MEETING_LABELS[basicInfo.regularMeeting],
      icon: <MapPin size={24} color="#A4A7AE" />,
    },
    {
      label: '모집인원',
      value: `${basicInfo.maxMembersCount}`,
      icon: <Users size={24} color="#A4A7AE" />,
    },
    {
      label: '시작일자',
      value: dayjs(basicInfo.createdAt).format('YYYY.MM.DD'),
      icon: <Clock size={24} color="#A4A7AE" />,
    },
    {
      label: '참가비',
      value:
        basicInfo.price === 0
          ? '무료'
          : `${basicInfo.price.toLocaleString()}원`,
      icon: <HandCoins size={24} color="#A4A7AE" />,
    },
    {
      label: '상태',
      value: `${STUDY_STATUS_LABELS[basicInfo.status]}`,
      icon: <SignpostBig size={24} color="#A4A7AE" />,
    },
  ];

  return (
    <div className="m-auto flex w-full max-w-[1164px] flex-col gap-400 py-500">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-150">
          <p className="font-designer-28b text-[#181D27]">
            {studyDetail?.detailInfo.title}
          </p>
          <p className="font-designer-18r text-[#252B37]">
            {studyDetail?.detailInfo.summary}
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
            src={studyDetail?.detailInfo.image ?? ''}
            alt="썸네일"
            width={781}
            height={439}
          />
          <div className="flex flex-col gap-600">
            <div className="flex flex-col gap-200">
              <p className="font-designer-20b">스터디 소개</p>
              <div className="font-designer-16r text-[#535862]">
                {studyDetail?.detailInfo.description}
              </div>
            </div>
            <div className="flex flex-col gap-200">
              <p className="font-designer-20b">기본 정보</p>
              <div>프로필박스</div>
              <div className="grid grid-cols-4 grid-rows-3 gap-150">
                {basicInfoItems(studyDetail?.basicInfo).map((item, index) => {
                  return (
                    <InfoCard
                      key={index}
                      title={item.label}
                      value={item.value}
                      icon={item.icon}
                    />
                  );
                })}
              </div>
            </div>
            <div className="flex flex-col gap-200">
              <div className="font-designer-20b flex gap-100">
                <span>실시간 신청자 목록</span>
                <span className="text-[#A4A7AE]">{`${studyDetail.basicInfo.approvedCount}명`}</span>
              </div>

              {applicants?.pages.map((page, pageIndex) => (
                <React.Fragment key={pageIndex}>
                  {page.content.map((applicant) => {
                    const temperPreset = getSincerityPresetByLevelName(
                      applicant.applicantInfo.sincerityTemp.levelName as string,
                    );

                    return (
                      <div
                        key={applicant.applyId}
                        className="rounded-100 border-border-subtle flex h-[100px] w-[382px] items-center justify-between gap-150 border px-200 py-300"
                      >
                        <UserAvatar size={48} image={undefined} />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex flex-row items-center gap-50">
                            <div className="font-designer-16b">
                              {applicant.applicantInfo.memberName}
                            </div>
                            <span
                              className={cn(
                                'font-designer-13r rounded-full px-150 py-50 leading-250',
                                temperPreset.bgClass,
                                temperPreset.textClass,
                              )}
                            >
                              {`${applicant.applicantInfo.sincerityTemp.temperature}`}{' '}
                              ℃
                            </span>
                          </div>
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
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-150 flex w-[335px] flex-col gap-500 self-start border-[1px] border-[#D5D7DA] p-300">
          <div>스터디정보</div>
          <div className="flex flex-col gap-100">
            <Button size="large" color="primary">
              신청하기
            </Button>
            <Button color="secondary">공유하기</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
