'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Button from '@/components/common/ui/button';
import StudyMatchingToggle from '@/components/home/study-matching-toggle';
import { isAuthenticatedMemberSessionState } from '@/features/auth/model/auth-session';
import { useAuthReady } from '@/features/auth/model/use-auth';
import { useLogoutMutation } from '@/hooks/queries/auth/use-auth-mutation';
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

/** 클래스 GNB(LoggedInControls)와 동일한 커뮤니티 프로토타입 계정 표시 */
const COMMUNITY_PROTOTYPE_NICKNAME = '도현';
const COMMUNITY_PROTOTYPE_GRADE_LABEL = '빌더';
const COMMUNITY_PROTOTYPE_BADGE_CLASS = 'bg-rose-100 text-rose-900';

function CommunityHeaderAccountControls({
  nickname,
  sincerityBadgeLabel,
  sincerityBadgeClassName,
  onLogout,
}: {
  nickname: string;
  sincerityBadgeLabel: string;
  sincerityBadgeClassName: string;
  onLogout: () => void;
}) {
  return (
    <div className="flex items-center gap-150 px-100">
      <span className="font-designer-13b text-text-strong">{nickname}</span>
      <span
        className={cn(
          'font-designer-11b inline-flex items-center rounded-50 px-100 py-25',
          sincerityBadgeClassName,
        )}
      >
        {sincerityBadgeLabel}
      </span>
      <button
        type="button"
        onClick={onLogout}
        className="hover:bg-fill-neutral-subtle-hover font-designer-13b text-text-default rounded-75 px-150 py-100 transition-colors"
      >
        로그아웃
      </button>
    </div>
  );
}

interface HomeHeaderClientProps {
  initialSessionState: AuthSessionState;
  initialAuthenticatedMemberId?: number;
  initialUserImg?: string;
  initialNickname?: string;
  initialSincerityLevelName?: string;
  initialShowDeveloperRegistrationEntry: boolean;
}

export default function HomeHeaderClient({
  initialSessionState,
  initialAuthenticatedMemberId,
  initialUserImg,
  initialNickname: _initialNickname,
  initialSincerityLevelName: _initialSincerityLevelName,
  initialShowDeveloperRegistrationEntry,
}: HomeHeaderClientProps) {
  const pathname = usePathname();
  const isCommunityRoute = pathname.startsWith('/community');
  const { mutateAsync: logout } = useLogoutMutation();
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

  const handleCommunityLogoutClick = () => {
    if (!isLoggedIn) return;
    logout().catch(() => {});
  };

  return (
    <>
      <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-between">
        <HeaderNav isLoggedIn={isLoggedIn} />

        {isLoggedIn || isCommunityRoute ? (
          <div className="flex items-center gap-200">
            <StudyMatchingToggle />
            <NotificationDropdown />
          </div>
        ) : (
          <div />
        )}

        <div className="ml-150">
          {isCommunityRoute ? (
            <div className="flex items-center gap-150">
              {isLoggedIn && showDeveloperRegistrationEntry ? (
                <Button
                  asChild
                  size="small"
                  color="outlined"
                  className="font-designer-14m whitespace-nowrap"
                >
                  <Link href="/developer-registration">개발자 등록</Link>
                </Button>
              ) : null}
              <CommunityHeaderAccountControls
                nickname={COMMUNITY_PROTOTYPE_NICKNAME}
                sincerityBadgeLabel={COMMUNITY_PROTOTYPE_GRADE_LABEL}
                sincerityBadgeClassName={COMMUNITY_PROTOTYPE_BADGE_CLASS}
                onLogout={handleCommunityLogoutClick}
              />
            </div>
          ) : isLoggedIn ? (
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
        {isLoggedIn || isCommunityRoute ? <NotificationDropdown /> : null}
        <MobileMenuDrawer
          isLoggedIn={isLoggedIn || isCommunityRoute}
          userImg={userImg}
          showDeveloperRegistrationEntry={showDeveloperRegistrationEntry}
        />
      </div>
    </>
  );
}
