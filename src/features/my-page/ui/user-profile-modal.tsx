'use client';

import { XIcon } from 'lucide-react';
import KeywordReview from '@/entities/my-profile/ui/keyword-review';
import ProfileInfoCard from '@/entities/my-profile/ui/profile-info-card';
import { useUserProfileQuery } from '@/entities/user/model/use-user-profile-query';
import CakeIcon from '@/features/my-page/ui/icon/cake.svg';
import GithubIcon from '@/features/my-page/ui/icon/github-logo.svg';
import GlobeIcon from '@/features/my-page/ui/icon/globe-simple.svg';
import PhoneIcon from '@/features/my-page/ui/icon/phone.svg';
import { useUserPositiveKeywordsQuery } from '@/features/study/model/use-review-query';
import UserAvatar from '@/shared/ui/avatar';
import Badge from '@/shared/ui/badge';
import { Modal } from '@/shared/ui/modal';

interface UserProfileModalProps {
  memberId: number;
  trigger: React.ReactNode;
}

export default function UserProfileModal({
  memberId,
  trigger,
}: UserProfileModalProps) {
  const { data: profile, isLoading, isError } = useUserProfileQuery(memberId);
  const { data: positiveKeywordsData } = useUserPositiveKeywordsQuery({
    memberId,
  });

  if (isLoading || isError || !profile || !positiveKeywordsData) return null;

  const positiveKeywords = positiveKeywordsData?.keywords || [];

  return (
    <Modal.Root>
      <Modal.Trigger asChild>{trigger}</Modal.Trigger>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="large" className="w-full">
          <Modal.Header className="border-border-default flex justify-between border-b">
            <Modal.Title className="font-designer-20b text-text-strong">
              {profile.memberProfile.memberName}님의 프로필
            </Modal.Title>
            <Modal.Close>
              <XIcon />
            </Modal.Close>
          </Modal.Header>

          <Modal.Body className="flex flex-col gap-400 p-400">
            <div className="flex flex-row gap-300 px-200">
              <UserAvatar
                image={
                  profile.memberProfile.profileImage?.resizedImages[0]
                    .resizedImageUrl
                }
                size={80}
              />
              <div>
                <div className="flex flex-wrap gap-75 pb-75">
                  {profile.memberProfile.mbti && (
                    <Badge color="orange">{profile.memberProfile.mbti}</Badge>
                  )}
                  {profile.memberProfile.interests
                    .slice(0, 4)
                    .map((interest) => (
                      <Badge key={interest.id} color="purple">
                        {interest.name}
                      </Badge>
                    ))}
                </div>
                <div className="font-designer-28b pb-50">
                  {profile.memberProfile.memberName}
                </div>
                <div className="font-designer-15m pb-300">
                  {profile.memberProfile.simpleIntroduction}
                </div>
                <div className="flex gap-250">
                  <div className="flex flex-col gap-100">
                    <div className="font-designer-14r text-text-subtle flex items-center gap-100">
                      <CakeIcon width={16} height={16} />
                      {profile.memberProfile.birthDate ?? ''}
                    </div>
                    <div className="font-designer-14r text-text-subtle flex items-center gap-100">
                      <PhoneIcon width={16} height={16} />
                      {profile.memberProfile.tel ?? ''}
                    </div>
                  </div>

                  <div className="flex flex-col gap-100">
                    <div className="font-designer-14r text-text-subtle flex items-center gap-100">
                      <GithubIcon width={16} height={16} />
                      {profile.memberProfile.githubLink?.url ?? ''}
                    </div>
                    <div className="font-designer-14r text-text-subtle flex items-center gap-100">
                      <GlobeIcon width={16} height={16} />
                      {profile.memberProfile.blogOrSnsLink?.url ?? ''}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-200">
              <ProfileInfoCard
                title="선호하는 스터디 주제"
                content={profile.memberInfo.preferredStudySubject?.name}
              />
              <ProfileInfoCard
                title="기술 스택"
                content={profile.memberInfo.techStacks
                  .map((t) => t.techStackName)
                  .join(', ')}
              />
              <ProfileInfoCard
                title="가능 시간대"
                content={profile.memberInfo.availableStudyTimes
                  .map((t) => t.label)
                  .join(', ')}
              />
              <ProfileInfoCard
                title="자기소개"
                content={profile.memberInfo.selfIntroduction}
              />
              <ProfileInfoCard
                title="공부 주제 및 계획"
                content={profile.memberInfo.studyPlan}
              />
            </div>

            <div className="bg-border-subtle h-[2px] w-full" />

            <div className="flex gap-400 px-250">
              <span className="font-designer-16b text-text-default w-[132px] shrink-0">
                받은 평가
              </span>

              <div className="text-text-default font-designer-14r">
                {/* todo: 기획 fix되면 수정 */}
                {/* <span>n명의 유저들이 이런 점이 좋다고 했어요.</span> */}

                <ul className="flex flex-col gap-100">
                  {positiveKeywords.length > 0 ? (
                    positiveKeywords.map((keyword) => (
                      <KeywordReview
                        key={keyword.id}
                        content={keyword.content}
                        count={keyword.count}
                      />
                    ))
                  ) : (
                    <span className="text-text-subtle font-designer-14r">
                      아직 받은 평가가 없습니다.
                    </span>
                  )}
                </ul>
              </div>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
