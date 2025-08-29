import Image from 'next/image';
import { MemberProfile, SincerityTemp } from '@/entities/user/api/types';
import CakeIcon from '@/features/my-page/ui/icon/cake.svg';
import GithubIcon from '@/features/my-page/ui/icon/github-logo.svg';
import GlobeIcon from '@/features/my-page/ui/icon/globe-simple.svg';
import PhoneIcon from '@/features/my-page/ui/icon/phone.svg';
import ProfileEditModal from '@/features/my-page/ui/profile-edit-modal';
import { getSincerityPresetByLevelId } from '@/shared/config/sincerity-temp-presets';
import { cn } from '@/shared/shadcn/lib/utils';
import UserAvatar from '@/shared/ui/avatar';
import Badge from '@/shared/ui/badge';
import Progress from '@/shared/ui/progress';

interface ProfileProps {
  memberId: number;
  memberProfile: MemberProfile;
  sincerityTemp: SincerityTemp;
}

export default function Profile({
  memberId,
  memberProfile,
  sincerityTemp,
}: ProfileProps) {
  const temperPreset = getSincerityPresetByLevelId(sincerityTemp.levelId);

  return (
    <div className="flex w-full max-w-[80%] gap-300 px-200">
      <UserAvatar
        image={memberProfile.profileImage?.resizedImages?.[0]?.resizedImageUrl}
        size={90}
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
            <div className="font-designer-28b">{memberProfile.memberName}</div>
            <p className="font-designer-15m text-text-default">
              {memberProfile.simpleIntroduction ?? '자기소개를 입력해주세요.'}
            </p>
          </div>

          <div className="grid grid-cols-[200px_1fr] gap-y-100">
            <div className="flex items-center gap-100">
              <CakeIcon />
              <span className="font-designer-14r text-text-subtle leading-none">
                {memberProfile.birthDate ?? '생일을 입력해주세요!'}
              </span>
            </div>
            <div className="flex items-center gap-100">
              <GithubIcon />
              <span className="font-designer-14r text-text-subtle leading-none">
                {memberProfile.githubLink?.url ?? '깃허브 링크를 입력해주세요!'}
              </span>
            </div>
            <div className="flex items-center gap-100">
              <PhoneIcon />
              <span className="font-designer-14r text-text-subtle leading-none">
                {memberProfile.tel ?? '번호를 입력해주세요!'}
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
                <span>성실 온도</span>
                <Image
                  src="/images/help_outline.png"
                  alt="성실온도 설명"
                  width={16}
                  height={16}
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

        <ProfileEditModal memberProfile={memberProfile} memberId={memberId} />
      </div>
    </div>
  );
}
