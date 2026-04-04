import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import {
  SERVER_USER_PROFILE_RESULT_KINDS,
  tryGetUserProfileInServer,
} from '@/api/endpoints/user/get-user-profile.server';
import HeaderNav from '@/components/common/layout/header-nav';
import HeaderUserDropdown from '@/components/common/layout/header-user-dropdown';
import MobileMenuDrawer from '@/components/common/layout/mobile-menu-drawer';
import Button from '@/components/common/ui/button';
import StudyMatchingToggle from '@/components/home/study-matching-toggle';
import { isAuthenticatedMemberSessionState } from '@/features/auth/model/auth-session';
import { readServerAuthSession } from '@/features/auth/model/server-auth-session';
import { tryGetMyDeveloperRegistrationInServer } from '@/features/developer/api/developer-registration-api.server';

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
  let developerRegistration = null;

  if (isLoggedIn && memberId) {
    const [profileSettled, developerRegistrationResult] =
      await Promise.allSettled([
        tryGetUserProfileInServer(memberId),
        tryGetMyDeveloperRegistrationInServer(),
      ]);

    if (profileSettled.status === 'fulfilled') {
      const profileResult = profileSettled.value;

      if (profileResult.kind === SERVER_USER_PROFILE_RESULT_KINDS.SUCCESS) {
        userProfile = profileResult.profile;
      } else if (
        profileResult.kind !== SERVER_USER_PROFILE_RESULT_KINDS.MISSING_PROFILE
      ) {
        console.error(
          `[Header] Failed to fetch user profile for memberId=${memberId}`,
          profileResult.error,
        );
      }
    } else {
      console.error(
        `[Header] Failed to fetch user profile for memberId=${memberId}`,
        profileSettled.reason,
      );
    }

    if (developerRegistrationResult.status === 'fulfilled') {
      developerRegistration = developerRegistrationResult.value;
    } else {
      console.error(
        `[Header] Failed to fetch developer registration for memberId=${memberId}`,
        developerRegistrationResult.reason,
      );
    }
  }

  const userInfo = userProfile?.memberProfile;
  const userImg = userProfile
    ? userInfo?.profileImage?.resizedImages[0].resizedImageUrl
    : undefined;
  const showDeveloperRegistrationEntry =
    isLoggedIn && developerRegistration?.registered === false;

  return (
    <header className="bg-background-default py-125 mix-blend-multiply">
      <div className="mx-auto flex w-full max-w-1496 items-center justify-between px-600">
        <div className="flex items-center gap-100 px-100 py-125">
          <Image src="/icons/logo.svg" alt="Logo" width={18} height={18} />
          <Link href="/">
            <Image
              src="/icons/logo_title.svg"
              alt="Logo-title"
              width={106}
              height={11}
            />
          </Link>
          <span className="rounded-full border-[0.5px] border-border-default px-75 py-25 text-center text-[7.5px] leading-normal font-medium">
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
              <div className="flex items-center gap-150">
                {showDeveloperRegistrationEntry ? (
                  <Button
                    asChild
                    size="small"
                    color="outlined"
                    className="font-designer-14m whitespace-nowrap"
                  >
                    <Link href="/developer-registration">개발자 등록</Link>
                  </Button>
                ) : null}
                <HeaderUserDropdown userImg={userImg} />
              </div>
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
        <div className="flex items-center gap-100 lg:hidden">
          {isLoggedIn && <NotificationDropdown />}
          <MobileMenuDrawer
            isLoggedIn={isLoggedIn}
            userImg={userImg}
            showDeveloperRegistrationEntry={showDeveloperRegistrationEntry}
          />
        </div>
      </div>
    </header>
  );
}
