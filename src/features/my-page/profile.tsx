'use client';

import Image from 'next/image';
import { Badge } from '@/shared/shadcn/ui/badge';
import ProfileEditModal from './Profile-edit-modal';
import { useGetProfile } from '@/hooks/profile';

export default function Profile() {
  const { data: profile } = useGetProfile({ memberId: '10000' });

  return (
    <div className="flex gap-[24px] px-[16px]">
      <div className="h-[100px] w-[180px] rounded-[100px] bg-[var(--color-background-alternative)]" />

      <div className="flex flex-col gap-[32px] pt-[12px]">
        <div className="flex flex-col gap-[24px]">
          {/* 이름, 소개, 배찌들 */}
          <div className="flex flex-col gap-[6px]">
            {/* 배찌들 */}
            <div className="flex gap-[4px]">
              <Badge
                variant="secondary"
                className="rounded-[4px] bg-[var(--color-green-500)] pt-[4px] pr-[8px] pb-[4px] pl-[8px]"
              >
                Badge1
              </Badge>
              <Badge
                variant="secondary"
                className="rounded-[4px] bg-[var(--color-blue-500)] pt-[4px] pr-[8px] pb-[4px] pl-[8px]"
              >
                Badge2
              </Badge>
            </div>
            {/* 이름 */}
            <div className="text-blue text-[24px] leading-9 font-bold">
              {profile?.memberProfile.memberName}
            </div>

            <div
              className="text-[15px] leading-[23px] font-[500] text-[var(--color-text-default)]"
              dangerouslySetInnerHTML={{
                __html: profile?.memberProfile.simpleIntroduction || '',
              }}
            />
          </div>

          {/* 생년월일, 전화번호, 깃허브, 웹사이트 */}
          <div className="flex gap-[20px]">
            <div className="flex flex-col gap-[8px]">
              <div className="flex gap-[4px]">
                <Image
                  src="icons/Cake.svg"
                  alt="Profile"
                  width={16}
                  height={16}
                />
                <div className="text-[12px] text-[var(--color-text-subtlest)]">
                  1999.01.01
                </div>
              </div>
              <div className="flex gap-[4px]">
                <Image
                  src="icons/Phone.svg"
                  alt="Profile"
                  width={16}
                  height={16}
                />
                <div className="text-[12px] text-[var(--color-text-subtlest)]">
                  {profile?.memberProfile.tel}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-[8px]">
              <div className="flex gap-[4px]">
                <Image
                  src="icons/GithubLogo.svg"
                  alt="Profile"
                  width={16}
                  height={16}
                />
                <div className="text-[12px] text-[var(--color-text-subtlest)]">
                  {profile?.memberProfile.githubLink.url}
                </div>
              </div>
              <div className="flex gap-[4px]">
                <Image
                  src="icons/GlobeSimple.svg"
                  alt="Profile"
                  width={16}
                  height={16}
                />
                <div className="text-[12px] text-[var(--color-text-subtlest)]">
                  {profile?.memberProfile.blogOrSnsLink.url}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* 수정 버튼 */}
        <ProfileEditModal />
      </div>
    </div>
  );
}
