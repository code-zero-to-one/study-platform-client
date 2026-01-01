'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import UserAvatar from '@/components/ui/avatar';
import Button from '@/components/ui/button';
import { getSincerityPresetByLevelName } from '@/config/sincerity-temp-presets';
import UserProfileModal from '@/entities/user/ui/user-profile-modal';
import { useAuth } from '@/hooks/use-auth';
import { hashValue } from '@/utils/hash';

import { GroupStudyFullResponse } from '../../features/study/group/api/group-study-types';

import { useApplicantsByStatusQuery } from '../../features/study/group/application/model/use-applicant-qeury';
import SummaryStudyInfo from '../study/summary-study-info';

function getApplicantsList<T>(pages: { content: T[] }[] | undefined) {
  if (!pages) return [];

  return pages.reduce<T[]>((acc, page) => [...acc, ...page.content], []);
}

interface PremiumStudyInfoSectionProps {
  study: GroupStudyFullResponse;
  isLeader: boolean;
}

export default function PremiumStudyInfoSection({
  study: studyDetail,
  isLeader,
}: PremiumStudyInfoSectionProps) {
  const router = useRouter();
  const params = useParams();
  const { data: authData } = useAuth();

  const groupStudyId = Number(params.id);

  const { data: approvedApplicants } = useApplicantsByStatusQuery({
    groupStudyId,
    status: 'APPROVED',
  });

  const applicantsList = getApplicantsList(approvedApplicants?.pages);

  return (
    <div className="flex w-full gap-600">
      <div className="flex flex-1 flex-col gap-500">
        <div className="relative h-[430px] w-full">
          <Image
            src={studyDetail?.detailInfo.image.resizedImages[0].resizedImageUrl}
            alt="썸네일"
            fill
            className="object-contain"
          />
        </div>

        <div className="flex flex-col gap-600">
          <div className="flex flex-col gap-200">
            <p className="font-designer-20b">스터디 소개</p>
            <div className="bg-background-alternative rounded-100 flex items-center justify-between px-200 py-300">
              <div className="flex items-center gap-150">
                <UserAvatar
                  size={80}
                  image={
                    studyDetail.basicInfo.leader.profileImage?.resizedImages[0]
                      .resizedImageUrl ?? ''
                  }
                />
                <div className="flex flex-col">
                  <div className="flex flex-col items-start gap-50">
                    <span className="font-designer-20b">
                      {studyDetail.basicInfo.leader.memberNickname}
                    </span>
                    <div className="font-designer-15r text-text-subtle flex items-center gap-100">
                      <span>스터디 리더</span>
                      <span className="h-100 w-px bg-[#E9EAEB]" />
                      <span>
                        {studyDetail.basicInfo.leader.simpleIntroduction}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <UserProfileModal
                memberId={studyDetail.basicInfo.leader.memberId}
                trigger={
                  <div className="bg-fill-neutral-default-default text-text-default font-designer-14b rounded-75 flex cursor-pointer items-center justify-center p-100">
                    프로필
                  </div>
                }
              />
            </div>
            <div className="font-designer-16r whitespace-pre-line text-[#535862]">
              {studyDetail?.detailInfo.description}
            </div>
          </div>

          <div className="flex flex-col gap-200">
            <div className="flex items-center justify-between">
              <div className="font-designer-20b flex gap-100">
                <span>실시간 신청자 목록</span>
                <span className="text-[#A4A7AE]">{`${applicantsList.length}명`}</span>
              </div>
              {isLeader && (
                <Button
                  className="h-500 w-[80px] text-[16px] font-bold"
                  onClick={() =>
                    router.push(`/application-list/${groupStudyId}`)
                  }
                >
                  관리하기
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 grid-rows-2 gap-200">
              {applicantsList.map((data) => {
                const temperPreset = getSincerityPresetByLevelName(
                  data.applicantInfo.sincerityTemp.levelName as string,
                );

                return (
                  <div
                    key={data.applyId}
                    className="rounded-100 border-border-subtle flex h-[100px] w-[382px] items-center justify-between gap-150 border px-200 py-300"
                  >
                    <UserAvatar
                      size={48}
                      image={
                        data.applicantInfo.profileImage?.resizedImages[0]
                          .resizedImageUrl ?? ''
                      }
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex flex-row items-center gap-50">
                        <div className="font-designer-16b">
                          {data.applicantInfo.memberNickname !== ''
                            ? data.applicantInfo.memberNickname
                            : '익명'}
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
                      memberId={data.applicantInfo.memberId}
                      trigger={
                        <div
                          className="bg-fill-neutral-default-default text-text-default hover:bg-fill-neutral-default-hover active:bg-fill-neutral-default-pressed font-designer-14b rounded-75 flex cursor-pointer items-center justify-center px-75 py-50"
                          onClick={() => {
                            sendGTMEvent({
                              event: 'premium_study_member_profile_click',
                              dl_timestamp: new Date().toISOString(),
                              ...(authData?.memberId && {
                                dl_member_id: hashValue(
                                  String(authData.memberId),
                                ),
                              }),
                              dl_target_member_id: String(
                                data.applicantInfo.memberId,
                              ),
                              dl_group_study_id: String(groupStudyId),
                            });
                          }}
                        >
                          프로필
                        </div>
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <SummaryStudyInfo data={studyDetail} />
    </div>
  );
}
