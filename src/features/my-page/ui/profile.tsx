'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import Badge from '@/components/ui/badge';
import Progress from '@/components/ui/progress';
import Tooltip from '@/components/ui/tooltip';
import { getSincerityPresetByLevelName } from '@/config/sincerity-temp-presets';
import { MemberProfile, SincerityTemp } from '@/entities/user/api/types';
import CakeIcon from '@/features/my-page/ui/icon/cake.svg';
import GithubIcon from '@/features/my-page/ui/icon/github-logo.svg';
import GlobeIcon from '@/features/my-page/ui/icon/globe-simple.svg';
import PhoneIcon from '@/features/my-page/ui/icon/phone.svg';
import TechStackIcon from '@/features/my-page/ui/icon/tech-stack.svg';
import VerifiedCheckIcon from '@/features/my-page/ui/icon/verified-check.svg';
import ProfileEditModal from '@/features/my-page/ui/profile-edit-modal';
import { usePhoneVerificationStore } from '@/features/phone-verification/model/store';
import PhoneVerificationModal from '@/features/phone-verification/ui/phone-verification-modal';
import { formatPhoneNumber } from '@/utils/format';

interface ProfileProps {
  memberId: number;
  memberProfile: MemberProfile;
  sincerityTemp: SincerityTemp;
  hidePhoneNumber?: boolean;
}

export default function Profile({
  memberId,
  memberProfile,
  sincerityTemp,
  hidePhoneNumber = false,
}: ProfileProps) {
  const temperPreset = getSincerityPresetByLevelName(sincerityTemp.levelName);

  // Zustand 스토어 사용
  const { isVerified, phoneNumber, setVerified, reset } =
    usePhoneVerificationStore();
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  // 서버 데이터를 우선시: 서버에 전화번호가 있으면 인증된 것으로 간주, 없으면 스토어 초기화
  useEffect(() => {
    if (memberProfile.tel) {
      // 서버에 전화번호가 있으면 인증된 것으로 간주
      if (!isVerified || phoneNumber !== memberProfile.tel) {
        setVerified(memberProfile.tel);
      }
    } else {
      // 서버에 전화번호가 없으면 스토어 초기화 (로컬 스토리지에 남아있는 이전 값 제거)
      reset();
    }
  }, [memberProfile.tel, isVerified, phoneNumber, setVerified, reset]);

  const handleVerificationComplete = (phone: string) => {
    setVerified(phone);
  };

  return (
    <div className="flex w-full flex-col gap-400">
      {/* 상단 영역: 프로필 이미지와 정보 (가로 정렬) - 여기에 너비 제한 적용 */}
      <div className="flex w-full max-w-[100%] gap-300 px-200">
        <Image
          src={
            memberProfile.profileImage?.resizedImages?.[0]?.resizedImageUrl ||
            '/profile-default.jpg'
          }
          alt="Profile Image"
          width={90}
          height={90}
          className="h-[90px] w-[90px] shrink-0 rounded-full object-cover"
        />
        <div className="flex flex-grow flex-col gap-400">
          <div className="flex flex-col gap-300">
            <div className="flex flex-col gap-75">
              <div className="flex gap-50">
                {memberProfile.mbti && (
                  <Badge color="orange">{memberProfile.mbti}</Badge>
                )}
                {memberProfile.interests.slice(0, 4).map((interest) => (
                  <Badge key={interest.id} color="purple">
                    {interest.name}
                  </Badge>
                ))}
              </div>
              <div className="font-designer-28b flex flex-row items-end justify-between gap-100">
                <div className="flex items-center gap-50">
                  {memberProfile.nickname ?? '닉네임을 입력해주세요'}
                  {/* 본인 인증 배지 (트위터 스타일) */}
                  {!hidePhoneNumber && (isVerified || !!memberProfile.tel) && (
                    <VerifiedCheckIcon className="shrink-0" />
                  )}
                </div>
                {/* 전화번호 - 인증 완료 시에만 표시 (hidePhoneNumber가 true면 숨김) */}
                {!hidePhoneNumber && isVerified && phoneNumber && (
                  <div className="flex flex-col items-end">
                    <div className="font-designer-14r text-text-subtle leading-none">
                      {memberProfile.memberName}
                    </div>
                    <div className="flex flex-row items-center gap-100">
                      <PhoneIcon />
                      <span className="font-designer-14r text-text-subtle leading-none">
                        {formatPhoneNumber(phoneNumber)}
                      </span>
                      <Badge color="green" shape="rectangle">
                        인증완료
                      </Badge>
                      <button
                        className="font-designer-13r text-text-subtlest hover:text-text-subtle underline"
                        onClick={() => setIsVerificationModalOpen(true)}
                      >
                        변경
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <p className="font-designer-15m text-text-default">
                {memberProfile.simpleIntroduction ??
                  '나를 나타낼 수 있는 한마디소개를 입력해주세요.'}
              </p>
            </div>

            <div className="grid grid-cols-[280px_1fr] gap-y-100">
              <div className="flex items-center gap-100">
                <CakeIcon />
                <span className="font-designer-14r text-text-subtle leading-none">
                  {memberProfile.birthDate ?? '생일을 입력해주세요!'}
                </span>
              </div>

              <div className="flex items-center gap-100">
                <TechStackIcon />
                <span className="font-designer-14r text-text-subtle leading-none">
                  {memberProfile.techStacks
                    ?.map((tech) => tech.techStackName)
                    .join(', ') ?? '(아이콘) 기술 스택을 선택해주세요!'}
                </span>
              </div>

              <div className="flex items-center gap-100">
                <GithubIcon />
                <span className="font-designer-14r text-text-subtle leading-none">
                  {memberProfile.githubLink?.url ??
                    '깃허브 링크를 입력해주세요!'}
                </span>
              </div>

              <div className="flex items-center gap-100">
                <GlobeIcon />
                <span className="font-designer-14r text-text-subtle leading-none">
                  {memberProfile.blogOrSnsLink?.url ??
                    '블로그 링크를 입력해주세요!'}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-100">
              <div className="flex flex-row justify-between">
                <div className="flex flex-row items-center gap-50">
                  <span className="font-designer-14m text-text-default">
                    성실 온도
                  </span>
                  <Tooltip
                    value="성실 온도는 스터디에서 받은 만족도를 기반으로 만든 매너 지표예요."
                    side="right"
                    contentClassName="rounded-150 font-designer-14r"
                    trigger={
                      <Image
                        src="/images/help_outline.png"
                        alt="성실온도 설명"
                        width={16}
                        height={16}
                      />
                    }
                  />
                </div>
                <div
                  className={cn(
                    'font-designer-14b flex flex-row items-center gap-[2px]',
                    temperPreset.textClass,
                  )}
                >
                  <temperPreset.Icon />
                  <div>{sincerityTemp.temperature.toFixed(1)} ℃</div>
                </div>
              </div>
              <Progress
                value={sincerityTemp.temperature}
                indicatorColor={temperPreset.indicatorClass}
              />
            </div>
          </div>

          {!hidePhoneNumber && (
            <ProfileEditModal
              memberProfile={memberProfile}
              memberId={memberId}
            />
          )}
        </div>
      </div>

      {/* 하단 영역: 전화번호 미인증 시에만 인증 요청 블록 표시 (hidePhoneNumber가 true면 숨김) */}
      {!hidePhoneNumber && !isVerified && (
        <div className="rounded-100 bg-background-alternative flex w-full flex-col gap-100 p-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-100">
              <PhoneIcon className="h-5 w-5 text-yellow-500" fill="#fbbf24" />
              <div className="flex flex-col gap-50">
                <span className="font-designer-14b text-text-strong">
                  전화번호 인증이 필요해요
                </span>
                <span className="font-designer-13r text-text-subtle">
                  스터디 참여와 알림 수신을 위해 인증을 진행해주세요.
                </span>
              </div>
            </div>
            <button
              className="rounded-75 bg-fill-brand-default-default font-designer-14b text-text-inverse hover:bg-fill-brand-default-hover active:bg-fill-brand-default-pressed px-150 py-75"
              onClick={() => setIsVerificationModalOpen(true)}
            >
              인증하기
            </button>
          </div>
        </div>
      )}

      {/* 전화번호 인증 모달 */}
      <PhoneVerificationModal
        open={isVerificationModalOpen}
        onOpenChange={setIsVerificationModalOpen}
        onVerificationComplete={handleVerificationComplete}
        memberId={memberId}
      />
    </div>
  );
}
