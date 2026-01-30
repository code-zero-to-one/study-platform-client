import Image from 'next/image';
import Link from 'next/link';
import StudyMatchingToggle from '@/components/home/study-matching-toggle';
import HeaderNav from '@/components/layout/header-nav';
import NotificationDropdown from '@/components/modals/notification-dropdown';
import Button from '@/components/ui/button';
import { getUserProfileInServer } from '@/entities/user/api/get-user-profile.server';
import HeaderUserDropdown from '@/features/auth/ui/header-user-dropdown';
import LoginModal from '@/features/auth/ui/login-modal';
import { getServerCookie } from '@/utils/server-cookie';
import { isNumeric } from '@/utils/validation';

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
    : undefined;

  return (
    <header className="mx-auto w-[1496px] bg-white px-600 py-[11px] mix-blend-multiply">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-[7.5px] px-[8px] py-[11px]">
          <Image src="/icons/logo.svg" alt="Logo" width={18} height={18} />
          <Link href="/">
            <Image
              src="/icons/logo_title.svg"
              alt="Logo-title"
              width={106}
              height={11}
            />
          </Link>
          <span className="rounded-full border-[0.5px] border-[#D5D7DA] px-[5px] py-[2.5px] text-center text-[7.5px] leading-normal font-[500]">
            BETA
          </span>
        </div>

        <HeaderNav isLoggedIn={isLoggedIn} />

        {accessTokenStr && (
          <div className="flex items-center gap-200">
            <StudyMatchingToggle />
            <NotificationDropdown />
          </div>
        )}

        <div className="ml-150">
          {isLoggedIn ? (
            <HeaderUserDropdown userImg={userImg} />
          ) : (
            <LoginModal
              openTrigger={
                <Button size="small" className="font-designer-14m">
                  로그인 / 회원가입
                </Button>
              }
            />
          )}
        </div>
      </div>
    </header>
  );
}
