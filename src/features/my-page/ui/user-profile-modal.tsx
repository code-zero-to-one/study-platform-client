'use client';

import { XIcon } from 'lucide-react';
import Image from 'next/image';
import { useUserProfileQuery } from '@/entities/user/model/use-user-profile-query';
import UserAvatar from '@/shared/ui/avatar';
import Badge from '@/shared/ui/badge';
import { Modal } from '@/shared/ui/modal';
import ProfileInfoCard from '@/widgets/my-page/profileinfo-card';

interface UserProfileModalProps {
  memberId: number;
  trigger: React.ReactNode;
}

export default function UserProfileModal({
  memberId,
  trigger,
}: UserProfileModalProps) {
  const { data: profile, isLoading, isError } = useUserProfileQuery(memberId);

  if (isLoading || isError || !profile) return null;

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
                    <div className="font-designer-14r text-text-subtle flex gap-100">
                      <Image
                        src="icons/Cake.svg"
                        alt="Profile"
                        width={16}
                        height={16}
                      />
                      {profile.memberProfile.birthDate ??
                        '생일을 입력해주세요!'}
                    </div>
                    <div className="font-designer-14r text-text-subtle flex gap-100">
                      <Image
                        src="icons/Phone.svg"
                        alt="Profile"
                        width={16}
                        height={16}
                      />
                      {profile.memberProfile.tel ?? '번호를 입력해주세요!'}
                    </div>
                  </div>

                  <div className="flex flex-col gap-100">
                    <div className="font-designer-14r text-text-subtle flex gap-100">
                      <Image
                        src="icons/GithubLogo.svg"
                        alt="Profile"
                        width={16}
                        height={16}
                      />
                      {profile.memberProfile.githubLink?.url ??
                        '깃허브 링크를 입력해주세요!'}
                    </div>
                    <div className="font-designer-14r text-text-subtle flex gap-100">
                      <Image
                        src="icons/GlobeSimple.svg"
                        alt="Profile"
                        width={16}
                        height={16}
                      />
                      {profile.memberProfile.blogOrSnsLink?.url ??
                        '블로그 링크를 입력해주세요!'}
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
          </Modal.Body>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
