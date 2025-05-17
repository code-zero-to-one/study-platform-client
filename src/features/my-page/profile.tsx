'use client';

import { Badge } from '@/shared/shadcn/ui/badge';
import Image from 'next/image';
import ProfileEditModal from '../../components/ProfileEditModal';

export default function Profile() {
  return (
    <div className="flex gap-[24px] px-[16px]">
      <div className="h-[100px] w-[180px] rounded-[100px] bg-[var(--color-background-alternative)]"></div>

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
              신채호
            </div>

            <p className="text-[15px] leading-[23px] font-[500] text-[var(--color-text-default)]">
              함께 성장하는 개발자가 되고 싶어요.함께 성장하는 개발자가 되고
              싶어요.함께 성장하는 개발자가 되고 싶어요.함께 성장하는 개발자가
              되고 싶어요.최대 글자수 두줄까지 두줄이상 말줄임 처리
            </p>
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
                  010-1234-5678
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
                  https://github.com/@zero-one
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
                  https://zero-one.com
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* 수정 버튼 */}
        <ProfileEditModal onSubmit={() => {}} />
      </div>
      {/* Profile */}

      {/* 소개 */}
    </div>
  );
}
