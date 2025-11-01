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
import { useRouter } from 'next/navigation';
import React from 'react';
import UserProfileModal from '@/entities/user/ui/user-profile-modal';
import { getSincerityPresetByLevelName } from '@/shared/config/sincerity-temp-presets';
import { cn } from '@/shared/shadcn/lib/utils';
import UserAvatar from '@/shared/ui/avatar';

import Button from '@/shared/ui/button';
import InfoCard from '@/widgets/study/group/ui/group-detail/info-card';
import GroupStudyNoticeModal from './group-notice-modal';
import SummaryStudyInfo from './summary-study-info';

import {
  BasicInfoDetail,
  GroupStudyDetailResponse,
} from '../api/group-study-types';

import { useApplicantsByStatusQuery } from '../application/model/use-applicant-qeury';
import {
  EXPERIENCE_LEVEL_LABELS,
  REGULAR_MEETING_LABELS,
  ROLE_LABELS,
  STUDY_METHOD_LABELS,
  STUDY_STATUS_LABELS,
  STUDY_TYPE_LABELS,
} from '../const/group-study-const';

interface StudyInfoSectionProps {
  study: GroupStudyDetailResponse;
  groupStudyId: number;
  isLeader: boolean;
}

export default function StudyInfoSection({
  study: studyDetail,
  groupStudyId,
  isLeader,
}: StudyInfoSectionProps) {
  const router = useRouter();
  const { data: applicants } = useApplicantsByStatusQuery({
    groupStudyId,
    status: 'APPROVED',
  });

  const basicInfoItems = (basicInfo: BasicInfoDetail) => {
    const getDurationText = (startDate: string, endDate: string): string => {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const diffTime = end.getTime() - start.getTime();
      if (diffTime < 0) return '기간이 잘못되었습니다.';

      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      const diffWeeks = diffDays / 7;
      const diffMonths = diffDays / 30; // 대략적인 월 계산 (평균 30일)

      return diffMonths < 1
        ? `약 ${Math.round(diffWeeks)}주`
        : `약 ${Math.round(diffMonths)}개월`;
    };

    return [
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
        value: `${STUDY_METHOD_LABELS[basicInfo.method]}, ${basicInfo.location}`,
        icon: <Globe size={24} color="#A4A7AE" />,
      },
      {
        label: '진행 기간',
        value: getDurationText(basicInfo.startDate, basicInfo.endDate),
        icon: <Calendar size={24} color="#A4A7AE" />,
      },
      {
        label: '정기모임',
        value: REGULAR_MEETING_LABELS[basicInfo.regularMeeting],
        icon: <MapPin size={24} color="#A4A7AE" />,
      },
      {
        label: '모집인원',
        value: `${basicInfo.maxMembersCount}명`,
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
  };

  const summaryBasicInfoItems = (basicInfo: BasicInfoDetail) => {
    return [
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
        label: '정기모임',
        value: `${REGULAR_MEETING_LABELS[basicInfo.regularMeeting]}, ${basicInfo.location}`,
        icon: <MapPin size={24} color="#A4A7AE" />,
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
        label: '모집인원',
        value: `${basicInfo.maxMembersCount}명`,
        icon: <Users size={24} color="#A4A7AE" />,
      },
    ];
  };

  return (
    // todo: 스터디 공지 모달 추가
    // <GroupStudyNoticeModal groupStudyId={groupStudyId} />
    <div className="flex w-full gap-600">
      <div className="flex flex-1 flex-col gap-500">
        <Image
          src={studyDetail?.detailInfo.image.resizedImages[0].resizedImageUrl}
          alt="썸네일"
          className="h-[439px] w-[781px] object-cover"
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
            {/* <div>프로필박스</div> */}
            <div className="grid grid-cols-4 grid-rows-3 gap-150">
              {basicInfoItems(studyDetail?.basicInfo).map((item) => {
                return (
                  <InfoCard
                    key={`${item.label}-${item.value}`}
                    title={item.label}
                    value={item.value}
                    icon={item.icon}
                  />
                );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-200">
            <div className="flex items-center justify-between">
              <div className="font-designer-20b flex gap-100">
                <span>실시간 신청자 목록</span>
                <span className="text-[#A4A7AE]">{`${studyDetail.basicInfo.approvedCount}명`}</span>
              </div>
              {isLeader && (
                <Button
                  className="h-[40px] w-[80px] text-[16px] font-bold"
                  onClick={() =>
                    router.push(`/application-list/${groupStudyId}`)
                  }
                >
                  관리하기
                </Button>
              )}
            </div>

            {applicants?.pages.map((applicant) => (
              <div
                key={applicant.page}
                className="grid grid-cols-2 grid-rows-2 gap-200"
              >
                {applicant.content.map((data) => {
                  const temperPreset = getSincerityPresetByLevelName(
                    data.applicantInfo.sincerityTemp.levelName as string,
                  );

                  return (
                    <div
                      key={data.applyId}
                      className="rounded-100 border-border-subtle flex h-[100px] w-[382px] items-center justify-between gap-150 border px-200 py-300"
                    >
                      <UserAvatar size={48} image={undefined} />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex flex-row items-center gap-50">
                          <div className="font-designer-16b">
                            {data.applicantInfo.memberName}
                          </div>
                          <span
                            className={cn(
                              'font-designer-13r rounded-full px-150 py-50 leading-250',
                              temperPreset.bgClass,
                              temperPreset.textClass,
                            )}
                          >
                            {`${data.applicantInfo.sincerityTemp.temperature}`}℃
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
              </div>
            ))}
          </div>
        </div>
      </div>
      <SummaryStudyInfo
        groupStudyId={groupStudyId}
        isLeader={isLeader}
        groupStudyStatus={studyDetail.basicInfo.status}
        data={summaryBasicInfoItems(studyDetail.basicInfo)}
        title={studyDetail.detailInfo.title}
        questions={studyDetail.interviewPost.interviewPost}
      />
    </div>
  );
}
