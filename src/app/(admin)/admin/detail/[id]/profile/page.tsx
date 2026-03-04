import { QueryClient } from '@tanstack/react-query';
import { getUserProfileInServer } from '@/api/endpoints/user/get-user-profile.server';
import ProfileInfoCard from '@/components/common/cards/profile-info-card';
import UserAvatar from '@/components/common/ui/avatar';
import Badge from '@/components/common/ui/badge';
import CakeIcon from '@/components/my-page/icon/cake.svg';
import GithubIcon from '@/components/my-page/icon/github-logo.svg';
import GlobeIcon from '@/components/my-page/icon/globe-simple.svg';
import PhoneIcon from '@/components/my-page/icon/phone.svg';
import { getSincerityPresetByLevelName } from '@/config/sincerity-temp-presets';
import { GetUserProfileResponse } from '@/types/api/user.types';

// todo: UserProfileModal과 거의 유사하여 나중에 리팩토링하기
export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const queryClient = new QueryClient();
  const { id: memberId } = await params;

  // 서버 side에서 첫 페이지 데이터 미리 가져오기
  await queryClient.prefetchQuery({
    queryKey: ['userProfile', memberId],
    queryFn: () => getUserProfileInServer(Number(memberId)),
  });

  const profile: GetUserProfileResponse = await queryClient.getQueryData([
    'userProfile',
    memberId,
  ]);

  const temperPreset = getSincerityPresetByLevelName(
    profile.sincerityTemp.levelName,
  );

  return (
    <div className="border-border-default rounded-100 flex flex-col gap-400 border p-400">
      <div className="flex flex-row gap-300 px-200">
        <UserAvatar
          image={
            profile.memberProfile.profileImage?.resizedImages[0].resizedImageUrl
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
            <Field icon={<PhoneIcon />} value={profile.memberProfile.tel} />
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
    </div>
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
