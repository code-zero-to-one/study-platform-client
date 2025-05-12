'use client';

import { Badge } from '@/shared/shadcn/ui/badge';
import Image from 'next/image';
import ProfileEditModal from './ProfileEditModal';

export default function Profile() {
  return (
    <>
      <div className="flex flex-col gap-[24px]">
        {/* Profile */}
        <div className="flex items-center justify-between self-stretch">
          <div className="flex w-[327px] flex-col items-start gap-[6px]">
            <div className="text-blue text-[24px] leading-9 font-bold">
              신채호
            </div>
            <div className="self-stretch text-[14px] leading-[22px] font-normal text-[#252B37]">
              풀스택 개발자가 되고 싶어요.
            </div>
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
          </div>
          <div className="h-[100px] w-[100px] rounded-[100px] bg-[var(--color-background-alternative)]"></div>
        </div>

        {/* 소개 */}
        <div className="flex gap-[40px]">
          <div className="flex flex-col gap-[8px]">
            <div className="flex gap-[4px]">
              <Image src="Cake.svg" alt="Profile" width={16} height={16} />
              <div className="text-[12px] text-[var(--color-text-subtlest)]">
                1999.01.01
              </div>
            </div>
            <div className="flex gap-[4px]">
              <Image src="Phone.svg" alt="Profile" width={16} height={16} />
              <div className="text-[12px] text-[var(--color-text-subtlest)]">
                010-1234-5678
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[8px]">
            <div className="flex gap-[4px]">
              <Image
                src="GithubLogo.svg"
                alt="Profile"
                width={16}
                height={16}
              />
              <div className="text-[12px] text-[var(--color-text-subtlest)]">
                https://github.com/@zero-one
              </div>
            </div>
            <div className="flex gap-[4px]">
              <Image
                src="GlobeSimple.svg"
                alt="Profile"
                width={16}
                height={16}
              />
              <div className="text-[12px] text-[var(--color-text-subtlest)]">
                https://zero-one.com
              </div>
            </div>
          </div>
        </div>

        {/* 수정 버튼 */}
        <div className="border border-[var(--border)] bg-[var(--secondary)] pt-[11.5px] pr-[20px] pb-[11.5px] pl-[20px] text-center text-[16px] font-bold">
          <ProfileEditModal onSubmit={() => {}} />
        </div>
      </div>
    </>
  );
}
