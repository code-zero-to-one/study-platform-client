import { MemberProfile } from '@/entities/user/api/types';
import CakeIcon from '@/features/my-page/ui/icon/cake.svg';
import GithubIcon from '@/features/my-page/ui/icon/github-logo.svg';
import GlobeIcon from '@/features/my-page/ui/icon/globe-simple.svg';
import PhoneIcon from '@/features/my-page/ui/icon/phone.svg';
import ProfileEditModal from '@/features/my-page/ui/profile-edit-modal';
import UserAvatar from '@/shared/ui/avatar';
import Badge from '@/shared/ui/badge';

interface ProfileProps {
  memberId: number;
  memberProfile: MemberProfile;
}

export default function Profile({ memberId, memberProfile }: ProfileProps) {
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

          <div className="flex gap-250">
            <div className="flex flex-col gap-100">
              <div className="font-designer-14r text-text-subtle flex items-center gap-100">
                <CakeIcon width={16} height={16} />
                {memberProfile.birthDate ?? '생일을 입력해주세요!'}
              </div>
              <div className="font-designer-14r text-text-subtle flex items-center gap-100">
                <PhoneIcon width={16} height={16} />
                {memberProfile.tel ?? '번호를 입력해주세요!'}
              </div>
            </div>

            <div className="flex flex-col gap-100">
              <div className="font-designer-14r text-text-subtle flex items-center gap-100">
                <GithubIcon width={16} height={16} />
                {memberProfile.githubLink?.url || '깃허브 링크를 입력해주세요!'}
              </div>
              <div className="font-designer-14r text-text-subtle flex items-center gap-100">
                <GlobeIcon width={16} height={16} />
                {memberProfile.blogOrSnsLink?.url ||
                  '블로그 링크를 입력해주세요!'}
              </div>
            </div>
          </div>
        </div>

        <ProfileEditModal memberProfile={memberProfile} memberId={memberId} />
      </div>
    </div>
  );
}
