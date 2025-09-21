import Link from 'next/link';
import { getUserProfileInServer } from '@/entities/user/api/get-user-profile.server';
import HeaderUserDropdown from '@/features/auth/ui/header-user-dropdown';
import LoginModal from '@/features/auth/ui/login-modal';
import { getServerCookie } from '@/shared/lib/server-cookie';
import { isNumeric } from '@/shared/lib/validation';
import Button from '@/shared/ui/button';
import Image from 'next/image';
import clsx from 'clsx';

export default async function Header() {
  const memberIdStr = await getServerCookie('memberId');
  const accessTokenStr = await getServerCookie('accessToken');

  const hasMemberId = !!memberIdStr && isNumeric(memberIdStr);
  const isLoggedIn = !!accessTokenStr && hasMemberId;

  const memberId = Number(memberIdStr);

  const userProfile = isLoggedIn
    ? await getUserProfileInServer(memberId)
    : null;
  const userInfo = userProfile?.memberProfile;
  const userImg = userProfile
    ? userInfo?.profileImage?.resizedImages[0].resizedImageUrl
    : 'profile-default.svg';

  return (
    <header
      className={clsx(
        'w-full bg-white py-[11px] mix-blend-multiply',
        !isLoggedIn && 'border-b border-[#E7E8EA]',
      )}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-[7.5px] px-[8px] py-[11px]">
          <Image src="icons/logo.svg" alt="Logo" width={18} height={18} />
          <Link href="/">
            <Image
              src="icons/logo_title.svg"
              alt="Logo-title"
              width={106}
              height={11}
            />
          </Link>
          <span className="rounded-full border-[0.5px] border-[#D5D7DA] px-[5px] py-[2.5px] text-center text-[7.5px] leading-normal font-[500]">
            BETA
          </span>
        </div>

        {/* 1차 MVP에선 사용하지 않아 제외 */}
        {/* <nav className='hidden flex-grow md:flex gap-150 font-designer-14m text-text-default'>
               <Link href='/about'>제로원 알아보기</Link>
               <Link href='/study'>마이스터디</Link>
            </nav> */}

        {/* 알림 기능을 구현하지 못해 주석 처리 */}
        {/* <div>
            <NotiIcon />
          </div> */}
        <div>
          {isLoggedIn ? (
            <HeaderUserDropdown userImg={userImg} />
          ) : (
            <LoginModal openTrigger={<Button>로그인 / 회원가입</Button>} />
          )}
        </div>
      </div>
    </header>
  );
}
