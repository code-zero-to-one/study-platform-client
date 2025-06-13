'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { getUserProfile } from '@/entities/user/api/get-user-profile';
import UserAvatar from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import ProfileEditModal from './Profile-edit-modal';
import { UpdateUserProfileRequest } from '../api/types';
import { useUpdateUserProfileMutation } from '../model/use-update-user-profile-mutation';

export default function Profile() {
  const memberId = 1;
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', memberId],
    queryFn: () => getUserProfile(memberId),
  });

  const { mutate } = useUpdateUserProfileMutation(memberId);

  if (!userProfile) return null;

  const handleSubmit = (formData: UpdateUserProfileRequest) => {
    mutate(formData);
  };

  return (
    <div className="flex gap-300 px-200">
      <UserAvatar image={userProfile.memberProfile.profileImage.resizedImages[0].resizedImageUrl} size={90} />
      <div className="flex flex-col gap-400">
        <div className="flex flex-col gap-300">
          <div className="flex flex-col gap-75">
            <div className="flex gap-50">
              <Badge color="orange">{userProfile.memberProfile.mbti}</Badge>
              {userProfile.memberProfile.interests.slice(0, 4).map((interest) => (
                <Badge key={interest.id} color="purple">
                  {interest.name}
                </Badge>
              ))}
            </div>
            <div className="font-designer-28b">
              {userProfile.memberProfile.memberName}
            </div>

            <p className="font-designer-15m text-text-default">
              {userProfile.memberProfile.simpleIntroduction}
            </p>
          </div>

          <div className="flex gap-250">
            <div className="flex flex-col gap-100">
              <div className="flex gap-100 font-designer-14r text-text-subtle">
                <Image
                  src="icons/Cake.svg"
                  alt="Profile"
                  width={16}
                  height={16}
                />
                {userProfile.memberProfile.birthDate}
              </div>
              <div className="flex gap-100 font-designer-14r text-text-subtle">
                <Image
                  src="icons/Phone.svg"
                  alt="Profile"
                  width={16}
                  height={16}
                />
                {userProfile.memberProfile.tel}
              </div>
            </div>

            <div className="flex flex-col gap-100">
              <div className="flex gap-100 font-designer-14r text-text-subtle">
                <Image
                  src="icons/GithubLogo.svg"
                  alt="Profile"
                  width={16}
                  height={16}
                />
                {userProfile.memberProfile.githubLink.url}
              </div>
              <div className="flex gap-100 font-designer-14r text-text-subtle">
                <Image
                  src="icons/GlobeSimple.svg"
                  alt="Profile"
                  width={16}
                  height={16}
                />
                {userProfile.memberProfile.blogOrSnsLink.url}
              </div>
            </div>
          </div>
        </div>
        <ProfileEditModal onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
