import Link from 'next/link';
import { getUserProfile } from '@/entities/user/api/get-user-profile';

import HeaderUserDropdown from '@/features/auth/ui/header-user-dropdown';
import LoginModal from '@/features/auth/ui/login-modal';
import { getServerCookie } from '@/shared/lib/server-cookie';
import Button from '@/shared/ui/button';

// import NotiIcon from 'public/icons/notifications_none.svg';

export default async function Header() {
  const memberId = await getServerCookie('memberId');
  const isLogin = /^\d+$/.test(memberId || '');

  const userInfo = isLogin ? await getUserProfile(Number(memberId)) : null;
  const userImg = isLogin
    ? userInfo.memberProfile.profileImage?.resizedImages[0].resizedImageUrl
    : 'profile-default.svg';

  return (
    <header className="w-full border-b border-[#E7E8EA] bg-white mix-blend-multiply">
      <div className="container mx-auto flex h-16 items-center justify-between gap-600 px-6 py-75">
        <div className="font-designer-18b text-text-strong shrink-0">
          <Link href="/">ZERO-ONE</Link>
        </div>

        {/* 1차 MVP에선 사용하지 않아 제외 */}
        {/* <nav className='hidden flex-grow md:flex gap-150 font-designer-14m text-text-default'>
               <Link href='/about'>제로원 알아보기</Link>
               <Link href='/study'>마이스터디</Link>
            </nav> */}

        <div className="flex shrink-0 items-center gap-150">
          {/* 알림 기능을 구현하지 못해 주석 처리 */}
          {/* <div>
            <NotiIcon />
          </div> */}

          {isLogin && <HeaderUserDropdown userImg={userImg} />}
          {!isLogin && (
            <LoginModal openTrigger={<Button>로그인 / 회원가입</Button>} />
          )}
        </div>
      </div>
    </header>
  );
}
