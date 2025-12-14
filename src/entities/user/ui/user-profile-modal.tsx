'use client';

import { XIcon } from 'lucide-react';
import { useState } from 'react';
import UserAvatar from '@/components/ui/avatar';
import Badge from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { getSincerityPresetByLevelName } from '@/config/sincerity-temp-presets';
import { useUserPositiveKeywordsQuery } from '@/entities/review/model/use-review-query';
import { useUserProfileQuery } from '@/entities/user/model/use-user-profile-query';
import KeywordReview from '@/entities/user/ui/keyword-review';
import ProfileInfoCard from '@/entities/user/ui/profile-info-card';
import CakeIcon from '@/features/my-page/ui/icon/cake.svg';
import GithubIcon from '@/features/my-page/ui/icon/github-logo.svg';
import GlobeIcon from '@/features/my-page/ui/icon/globe-simple.svg';
import PhoneIcon from '@/features/my-page/ui/icon/phone.svg';

interface UserProfileModalProps {
  memberId: number;
  trigger: React.ReactNode;
  hidePhoneNumber?: boolean; // 전화번호 숨김 옵션 추가
}

export default function UserProfileModal({
  memberId,
  trigger,
  hidePhoneNumber = false,
}: UserProfileModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>{trigger}</Modal.Trigger>

      {open && (
        <Modal.Portal>
          <Modal.Overlay />
          <Modal.Content size="large" className="w-full">
            <UserProfileBody
              memberId={memberId}
              onClose={() => setOpen(false)}
              hidePhoneNumber={hidePhoneNumber}
            />
          </Modal.Content>
        </Modal.Portal>
      )}
    </Modal.Root>
  );
}

function UserProfileBody({
  memberId,
  onClose,
  hidePhoneNumber,
}: {
  memberId: number;
  onClose: () => void;
  hidePhoneNumber: boolean;
}) {
  const { data: profile, isLoading, isError } = useUserProfileQuery(memberId);
  const { data: positiveKeywordsData } = useUserPositiveKeywordsQuery({
    memberId,
  });

  if (isLoading) {
    return (
      <>
        <Header title="프로필" onClose={onClose} />
        <Modal.Body className="p-400">불러오는 중…</Modal.Body>
      </>
    );
  }

  if (isError || !profile || !positiveKeywordsData) {
    return (
      <>
        <Header title="프로필" onClose={onClose} />
        <Modal.Body className="p-400">프로필을 불러오지 못했습니다.</Modal.Body>
      </>
    );
  }

  const positiveKeywords = positiveKeywordsData.keywords ?? [];
  const temperPreset = getSincerityPresetByLevelName(
    profile.sincerityTemp.levelName,
  );

  return (
    <>
      <Header
        title={`${profile.memberProfile.memberName}님의 프로필`}
        onClose={onClose}
      />

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
              {profile.memberProfile.interests.slice(0, 4).map((interest) => (
                <Badge key={interest.id} color="purple">
                  {interest.name}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-start">
              <div className="font-designer-28b pb-50">
                {profile.memberProfile.memberName}
              </div>

              <span
                className="bg-border-default mx-150 block h-[12px] w-[1px]"
                aria-hidden="true"
              />

              <div className="flex items-center">
                <temperPreset.Icon className="h-400 w-400" />
                <span
                  className={`${temperPreset.textClass} font-designer-14b pl-[2px]`}
                >
                  {profile.sincerityTemp.temperature.toFixed(1)} ℃
                </span>
              </div>
            </div>

            <div className="font-designer-15m pb-300">
              {profile.memberProfile.simpleIntroduction}
            </div>

            <div className="grid grid-cols-2 gap-x-250 gap-y-100">
              <Field
                icon={<CakeIcon />}
                value={profile.memberProfile.birthDate}
              />
              <Field
                icon={<GithubIcon />}
                value={profile.memberProfile.githubLink?.url}
              />
              {!hidePhoneNumber && (
                <Field icon={<PhoneIcon />} value={profile.memberProfile.tel} />
              )}
              <Field
                icon={<GlobeIcon />}
                value={profile.memberProfile.blogOrSnsLink?.url}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-200">
          <ProfileInfoCard
            title="선호하는 스터디 주제"
            content={profile.memberInfo.preferredStudySubject?.name}
          />
          {/* TODO : 상단으로 이동 필요 */}
          <ProfileInfoCard
            title="기술 스택"
            content={profile.memberProfile.techStacks
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

        <div className="bg-border-subtle h-[2px] w-full flex-none" />

        <div className="flex gap-400 pl-250">
          <span className="font-designer-16b text-text-default w-[132px] shrink-0">
            받은 평가
          </span>

          <div className="text-text-default font-designer-14r grow-1">
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
    </>
  );
}

function Header({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <Modal.Header className="border-border-default flex justify-between border-b">
      <Modal.Title className="font-designer-20b text-text-strong">
        {title}
      </Modal.Title>
      <Modal.Close onClick={onClose}>
        <XIcon />
      </Modal.Close>
    </Modal.Header>
  );
}

function Field({ icon, value }: { icon: React.ReactNode; value?: string }) {
  return (
    <div className="flex items-center gap-100">
      {icon}
      <span className="font-designer-14r text-text-subtle leading-none">
        {value ?? ''}
      </span>
    </div>
  );
}
