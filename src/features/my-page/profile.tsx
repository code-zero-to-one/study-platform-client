'use client';

import Image from 'next/image';
import UserAvatar from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import ProfileEditModal from './Profile-edit-modal';

export default function Profile() {
  return (
    <div className="flex gap-300 px-200">
      <UserAvatar size={90} />
      <div className="flex flex-col gap-400">
        <div className="flex flex-col gap-300">
          {/* 이름, 소개, 배찌들 */}
          <div className="flex flex-col gap-75">
            {/* 배찌들 */}
            <div className="flex gap-50">
              <Badge color='orange'>ENFJ</Badge>
              <Badge color='orange'>IT</Badge>
              <Badge color='gray'>AI</Badge>
              <Badge color='gray'>Back-end</Badge>
              <Badge color='purple'>플라잉요가</Badge>
              <Badge color='purple'>사진</Badge>
            </div>
            <div className="font-designer-28b">
              신채호
            </div>

            <p className="font-designer-15m text-text-default">
              함께 성장하는 개발자가 되고 싶어요.<br />이 스터디를 통해서 함께 성장해나가며 백엔드와 AI의 마스터가 되고 싶습니다. 잘 부탁드립니다.
            </p>
          </div>

          {/* 생년월일, 전화번호, 깃허브, 웹사이트 */}
          <div className="flex gap-[20px]">
            <div className="flex flex-col gap-[8px]">
              <div className="flex gap-100 font-designer-14r text-text-subtle">
                <Image
                  src="icons/Cake.svg"
                  alt="Profile"
                  width={16}
                  height={16}
                />
                1999.01.01
              </div>
              <div className="flex gap-100 font-designer-14r text-text-subtle">
                <Image
                  src="icons/Phone.svg"
                  alt="Profile"
                  width={16}
                  height={16}
                />
                010-1234-5678
              </div>
            </div>

            <div className="flex flex-col gap-[8px]">
              <div className="flex gap-100 font-designer-14r text-text-subtle">
                <Image
                  src="icons/GithubLogo.svg"
                  alt="Profile"
                  width={16}
                  height={16}
                />
                https://github.com/@zero-one
              </div>
              <div className="flex gap-100 font-designer-14r text-text-subtle">
                <Image
                  src="icons/GlobeSimple.svg"
                  alt="Profile"
                  width={16}
                  height={16}
                />
                https://zero-one.com
              </div>
            </div>
          </div>
        </div>
        {/* 수정 버튼 */}
        <ProfileEditModal onSubmit={() => { }} />
      </div>
      {/* Profile */}

      {/* 소개 */}
    </div>
  );
}
