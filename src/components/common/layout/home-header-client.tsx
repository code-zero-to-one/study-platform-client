'use client';

import { Monitor } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Button from '@/components/common/ui/button';
import { isAuthenticatedMemberSessionState } from '@/features/auth/model/auth-session';
import { useAuthReady } from '@/features/auth/model/use-auth';
import { useUserStore } from '@/stores/useUserStore';
import type { AuthSessionState } from '@/types/auth/domain';
import HeaderNav from './header-nav';
import HeaderUserDropdown from './header-user-dropdown';
import MobileMenuDrawer from './mobile-menu-drawer';

const LoginModal = dynamic(
  () => import('@/components/auth/modals/login-modal'),
);

// const NotificationDropdown = dynamic(
//   () => import('@/components/common/modals/notification-dropdown'),
// );

interface HomeHeaderClientProps {
  initialSessionState: AuthSessionState;
  initialAuthenticatedMemberId?: number;
  initialUserImg?: string;
  initialNickname?: string;
  initialLevelName?: string;
  initialShowDeveloperRegistrationEntry: boolean;
}

export default function HomeHeaderClient({
  initialSessionState,
  initialAuthenticatedMemberId,
  initialUserImg,
  initialNickname,
  initialLevelName,
  initialShowDeveloperRegistrationEntry,
}: HomeHeaderClientProps) {
  const {
    isHydrated,
    memberId: hydratedMemberId,
    sessionState: hydratedSessionState,
  } = useAuthReady();
  const storedMemberId = useUserStore((state) => state.memberId);
  const storedProfileImageUrl = useUserStore((state) => state.profileImageUrl);
  const storedNickname = useUserStore((state) => state.nickname);
  const initialIsLoggedIn =
    isAuthenticatedMemberSessionState(initialSessionState);
  const hydratedIsLoggedIn =
    isAuthenticatedMemberSessionState(hydratedSessionState);
  const isLoggedIn = isHydrated ? hydratedIsLoggedIn : initialIsLoggedIn;
  const currentMemberId = isHydrated
    ? hydratedMemberId
    : initialAuthenticatedMemberId;
  const isInitialMemberSession =
    currentMemberId !== undefined &&
    currentMemberId === initialAuthenticatedMemberId;
  const showDeveloperRegistrationEntry = isLoggedIn
    ? isHydrated
      ? initialShowDeveloperRegistrationEntry && isInitialMemberSession
      : initialShowDeveloperRegistrationEntry
    : false;
  const userImg =
    isLoggedIn && currentMemberId && storedMemberId === currentMemberId
      ? (storedProfileImageUrl ?? initialUserImg)
      : initialUserImg;
  const nickname =
    isLoggedIn && currentMemberId && storedMemberId === currentMemberId
      ? (storedNickname ?? initialNickname)
      : initialNickname;

  return (
    <>
      <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-between">
        <HeaderNav isLoggedIn={isLoggedIn} />
        {/* {isLoggedIn ? (
          <div className="flex items-center gap-200">
            <StudyMatchingToggle />
            <NotificationDropdown />
          </div>
        ) : (
          <div />
        )} */}

        <div className="ml-150">
          {isLoggedIn ? (
            <div className="flex items-center gap-300">
              <Button asChild size="small" className="font-designer-14m">
                <Link href="/my-class" className="flex items-center gap-75">
                  마이 클래스
                  <Monitor size={16} />
                </Link>
              </Button>
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
              <HeaderUserDropdown
                userImg={userImg}
                nickname={nickname ?? undefined}
                levelName={initialLevelName}
              />
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

      <div className="flex items-center gap-100 lg:hidden">
        {/* {isLoggedIn ? <NotificationDropdown /> : null} */}
        <MobileMenuDrawer
          isLoggedIn={isLoggedIn}
          userImg={userImg}
          showDeveloperRegistrationEntry={showDeveloperRegistrationEntry}
        />
      </div>
    </>
  );
}
