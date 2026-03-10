import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { tryGetUserProfileInServer } from '@/api/endpoints/user/get-user-profile.server';
import HeaderNav from '@/components/common/layout/header-nav';
import HeaderUserDropdown from '@/components/common/layout/header-user-dropdown';
import Button from '@/components/common/ui/button';
import StudyMatchingToggle from '@/components/home/study-matching-toggle';
import { getServerCookie } from '@/utils/server-cookie';
import { isNumeric } from '@/utils/validation';

const LoginModal = dynamic(
  () => import('@/components/common/modals/login-modal'),
);

const NotificationDropdown = dynamic(
  () => import('@/components/common/modals/notification-dropdown'),
);

export default async function Header() {
  const memberIdStr = await getServerCookie('memberId');
  const accessTokenStr = await getServerCookie('accessToken');

  const hasMemberId = !!memberIdStr && isNumeric(memberIdStr);
  const isLoggedIn = !!accessTokenStr && hasMemberId;

  const memberId = Number(memberIdStr);

  let userProfile = null;

  if (isLoggedIn) {
    try {
      userProfile = await tryGetUserProfileInServer(memberId);
    } catch (error) {
      console.error(
        `[Header] Failed to fetch user profile for memberId=${memberId}`,
        error,
      );
    }
  }

  const userInfo = userProfile?.memberProfile;
  const userImg = userProfile
    ? userInfo?.profileImage?.resizedImages[0].resizedImageUrl
    : undefined;

  return (
    <header className="bg-white py-[11px] mix-blend-multiply">
      <div className="mx-auto flex w-[1496px] items-center justify-between px-600">
        <div className="flex items-center gap-[7.5px] px-100 py-[11px]">
          <Image src="/icons/logo.svg" alt="Logo" width={18} height={18} />
          <Link href="/">
            <Image
              src="/icons/logo_title.svg"
              alt="Logo-title"
              width={106}
              height={11}
            />
          </Link>
          <span className="rounded-full border-[0.5px] border-[#D5D7DA] px-[5px] py-[2.5px] text-center text-[7.5px] leading-normal font-medium">
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
