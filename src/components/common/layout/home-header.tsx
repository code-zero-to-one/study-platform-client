import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { tryGetUserProfileInServer } from '@/api/endpoints/user/get-user-profile.server';
import HeaderNav from '@/components/common/layout/header-nav';
import HeaderUserDropdown from '@/components/common/layout/header-user-dropdown';
import MobileMenuDrawer from '@/components/common/layout/mobile-menu-drawer';
import Button from '@/components/common/ui/button';
import StudyMatchingToggle from '@/components/home/study-matching-toggle';
import { isAuthenticatedMemberSessionState } from '@/features/auth/model/auth-session';
import { readServerAuthSession } from '@/features/auth/model/server-auth-session';

const LoginModal = dynamic(
  () => import('@/components/common/modals/login-modal'),
);

const NotificationDropdown = dynamic(
  () => import('@/components/common/modals/notification-dropdown'),
);

export default async function Header() {
  const { sessionState, authenticatedMemberId: memberId } =
    await readServerAuthSession();
  const isLoggedIn = isAuthenticatedMemberSessionState(sessionState);

  let userProfile = null;

  if (isLoggedIn && memberId) {
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
      <div className="mx-auto flex w-full max-w-[1496px] items-center justify-between px-600">
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

        {/* 데스크톱 네비게이션 */}
        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-between">
          <HeaderNav isLoggedIn={isLoggedIn} />

          {isLoggedIn && (
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

        {/* 모바일 햄버거 메뉴 */}
        <div className="lg:hidden">
          <MobileMenuDrawer isLoggedIn={isLoggedIn} />
        </div>
      </div>
    </header>
  );
}
