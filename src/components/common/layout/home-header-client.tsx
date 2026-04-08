'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import Button from '@/components/common/ui/button';
import StudyMatchingToggle from '@/components/home/study-matching-toggle';
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

const NotificationDropdown = dynamic(
  () => import('@/components/common/modals/notification-dropdown'),
);

interface HomeHeaderClientProps {
  initialSessionState: AuthSessionState;
  initialAuthenticatedMemberId?: number;
  initialUserImg?: string;
  initialShowDeveloperRegistrationEntry: boolean;
}

export default function HomeHeaderClient({
  initialSessionState,
  initialAuthenticatedMemberId,
  initialUserImg,
  initialShowDeveloperRegistrationEntry,
}: HomeHeaderClientProps) {
  const {
    isHydrated,
    memberId: hydratedMemberId,
    sessionState: hydratedSessionState,
  } = useAuthReady();
  const storedMemberId = useUserStore((state) => state.memberId);
  const storedProfileImageUrl = useUserStore((state) => state.profileImageUrl);
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

  return (
    <>
      <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-between">
        <HeaderNav isLoggedIn={isLoggedIn} />

        {isLoggedIn ? (
          <div className="flex items-center gap-200">
            <StudyMatchingToggle />
            <NotificationDropdown />
          </div>
        ) : (
          <div />
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

      <div className="flex items-center gap-100 lg:hidden">
        {isLoggedIn ? <NotificationDropdown /> : null}
        <MobileMenuDrawer
          isLoggedIn={isLoggedIn}
          userImg={userImg}
          showDeveloperRegistrationEntry={showDeveloperRegistrationEntry}
        />
      </div>
    </>
  );
}
