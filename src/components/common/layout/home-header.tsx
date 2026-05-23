import Image from 'next/image';
import Link from 'next/link';
import {
  SERVER_USER_PROFILE_RESULT_KINDS,
  tryGetUserProfileInServer,
} from '@/api/endpoints/user/get-user-profile.server';
import HomeHeaderClient from '@/components/common/layout/home-header-client';
import { isAuthenticatedMemberSessionState } from '@/features/auth/model/auth-session';
import { readServerAuthSession } from '@/features/auth/model/server-auth-session';

export default async function Header() {
  const { sessionState, authenticatedMemberId: memberId } =
    await readServerAuthSession();
  const isLoggedIn = isAuthenticatedMemberSessionState(sessionState);

  let userProfile = null;

  if (isLoggedIn && memberId) {
    try {
      const profileResult = await tryGetUserProfileInServer(memberId);

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
  const initialNickname = userInfo?.nickname ?? undefined;
  const initialLevelName = userProfile?.sincerityTemp?.levelName ?? undefined;

  return (
    <header className="relative z-10 w-full bg-background-default py-125 mix-blend-multiply">
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

        <HomeHeaderClient
          initialSessionState={sessionState}
          initialAuthenticatedMemberId={memberId}
          initialUserImg={userImg}
          initialNickname={initialNickname}
          initialLevelName={initialLevelName}
        />
      </div>
    </header>
  );
}
