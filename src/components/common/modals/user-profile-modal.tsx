'use client';

import { XIcon } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import { getCookie } from '@/api/client/cookie';
import KeywordReview from '@/components/common/cards/keyword-review';
import ProfileInfoCard from '@/components/common/cards/profile-info-card';
import CakeIcon from '@/components/my-page/icon/cake.svg';
import GithubIcon from '@/components/my-page/icon/github-logo.svg';
import GlobeIcon from '@/components/my-page/icon/globe-simple.svg';
import PhoneIcon from '@/components/my-page/icon/phone.svg';
import TechStackIcon from '@/components/my-page/icon/tech-stack.svg';
import VerifiedCheckIcon from '@/components/my-page/icon/verified-check.svg';
import UserAvatar from '@/components/common/ui/avatar';
import Badge from '@/components/common/ui/badge';
import { Modal } from '@/components/common/ui/modal';
import { getSincerityPresetByLevelName } from '@/config/sincerity-temp-presets';
import { useApplicantsByStatusQuery } from '@/hooks/queries/use-applicant-qeury';
import { useUserPositiveKeywordsQuery } from '@/hooks/queries/use-review-query';
import { useUserProfileQuery } from '@/hooks/queries/use-user-profile-query';
import { formatPhoneNumber } from '@/utils/format';
import { decodeJwt } from '@/utils/jwt';

interface UserProfileModalProps {
  memberId: number;
  trigger: React.ReactNode;
}

export default function UserProfileModal({
  memberId,
  trigger,
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
}: {
  memberId: number;
  onClose: () => void;
}) {
  const { data: profile, isLoading, isError } = useUserProfileQuery(memberId);
  const { data: positiveKeywordsData } = useUserPositiveKeywordsQuery({
    memberId,
  });
  // 본인 여부 확인
  const currentMemberId = Number(getCookie('memberId'));
  const isMe = currentMemberId === memberId; // 본인

  // 관리자 여부 확인
  const accessToken = getCookie('accessToken');
  const decodedJwt = accessToken ? decodeJwt(accessToken) : null;
  const isAdmin = decodedJwt?.roleIds?.includes('ROLE_ADMIN') ?? false;

  //  같은 스터디 참가자 여부 확인
  const params = useParams();
  const groupStudyId = params?.id ? Number(params.id) : undefined;

  const { data: approvedApplicantsData } = useApplicantsByStatusQuery({
    groupStudyId: groupStudyId ?? 0,
    status: 'APPROVED',
  });

  const isSameStudyMember = useMemo(() => {
    if (!groupStudyId || !approvedApplicantsData?.pages) return false;
    const approvedApplicants = approvedApplicantsData.pages.flatMap(
      (page) => page.content,
    );

    return approvedApplicants.some(
      (apply) => apply.applicantInfo.memberId === memberId,
    );
  }, [groupStudyId, approvedApplicantsData, memberId]);

  // 최종 이름, 전화번호 표시 가능 여부
  const canSeePhoneNumber = isMe || isAdmin || isSameStudyMember;

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
        title={`${profile.memberProfile.nickname ?? '익명'}님의 프로필`}
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
              <div className="font-designer-28b flex items-center gap-50 pb-50">
                {profile.memberProfile.nickname}
                {/* 본인 인증 배지 (인증된 경우에만 표시) */}
                {profile.isVerified && (
                  <VerifiedCheckIcon className="shrink-0" />
                )}
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
                icon={<TechStackIcon />}
                value={
                  profile.memberProfile.techStacks?.length > 0
                    ? profile.memberProfile.techStacks
                        .map((tech) => tech.techStackName)
                        .join(', ')
                    : '-'
                }
              />
              <Field
                icon={<GithubIcon />}
                value={profile.memberProfile.githubLink?.url ?? '-'}
              />
              <Field
                icon={<GlobeIcon />}
                value={profile.memberProfile.blogOrSnsLink?.url ?? '-'}
              />
              {/* 본인, 운영진, 스터디 참가자에게 노출 */}
              {canSeePhoneNumber && profile.isVerified && (
                <div className="flex items-center gap-100">
                  <Field
                    icon={<PhoneIcon />}
                    value={formatPhoneNumber(profile.memberProfile.tel)}
                  />
                  <Badge color="green" shape="rectangle">
                    인증완료
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-200">
          <ProfileInfoCard
            title="자기소개"
            content={profile.memberInfo.selfIntroduction ?? '없음'}
          />
          <ProfileInfoCard
            title="공부 주제 및 계획"
            content={profile.memberInfo.studyPlan ?? '없음'}
          />
          <ProfileInfoCard
            title="선호하는 스터디 주제"
            content={profile.memberInfo.preferredStudySubject?.name ?? '없음'}
          />
          <ProfileInfoCard
            title="가능 시간대"
            content={
              profile.memberInfo.availableStudyTimes &&
              profile.memberInfo.availableStudyTimes.length > 0
                ? profile.memberInfo.availableStudyTimes
                    .map((time) => time.fullLabel)
                    .join(', ')
                : '없음'
            }
          />
          <ProfileInfoCard
            title="직무"
            content={
              profile.memberInfo.jobs && profile.memberInfo.jobs.length > 0
                ? profile.memberInfo.jobs
                    .map((job) => job.description || job.job || '')
                    .filter(Boolean)
                    .join(', ')
                : '없음'
            }
          />
          <ProfileInfoCard
            title="경력"
            content={
              profile.memberInfo.career
                ? profile.memberInfo.career.description ||
                  profile.memberInfo.career.career ||
                  '없음'
                : '없음'
            }
          />
          <ProfileInfoCard
            title="스터디 형태"
            content={
              profile.memberInfo.studyFormatTypes &&
              profile.memberInfo.studyFormatTypes.length > 0
                ? profile.memberInfo.studyFormatTypes
                    .map(
                      (studyFormatType) =>
                        studyFormatType.description ||
                        studyFormatType.studyFormatType,
                    )
                    .join(', ')
                : '없음'
            }
          />
          <ProfileInfoCard
            title="스터디 목표"
            content={profile.memberInfo.goal ?? '없음'}
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
