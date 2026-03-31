import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import Link from 'next/link';
import Button from '@/components/common/ui/button';
import Profile from '@/components/my-page/profile';
import ProfileInfo from '@/components/my-page/profile-info';
import { readAuthenticatedMemberId } from '@/features/auth/model/server-auth-session';
import {
  SERVER_USER_PROFILE_RESULT_KINDS,
  tryGetUserProfileInServer,
} from '@/features/auth/model/server-user-profile-result';
import type { GetUserProfileResponse } from '@/types/api/user.types';

export default async function MyPage() {
  const memberId = await readAuthenticatedMemberId();

  if (!Number.isFinite(memberId) || memberId <= 0) {
    return (
      <section className="rounded-150 border-border-subtle bg-background-default border p-300">
        <h2 className="font-designer-20b text-text-default mb-75">
          마이페이지 정보를 불러올 수 없습니다
        </h2>
        <p className="font-designer-14r text-text-subtle mb-200">
          로그인 정보를 확인한 뒤 다시 시도해주세요.
        </p>
        <Link href="/login">
          <Button color="primary" size="medium">
            로그인하러 가기
          </Button>
        </Link>
      </section>
    );
  }

  const profileResult = await tryGetUserProfileInServer(memberId);

  if (profileResult.kind === SERVER_USER_PROFILE_RESULT_KINDS.AUTH_ERROR) {
    return (
      <section className="rounded-150 border-border-subtle bg-background-default border p-300">
        <h2 className="font-designer-20b text-text-default mb-75">
          로그인 정보를 다시 확인해주세요
        </h2>
        <p className="font-designer-14r text-text-subtle mb-200">
          인증 정보가 일치하지 않아 프로필을 불러오지 못했습니다.
        </p>
        <Link href="/login">
          <Button color="primary" size="medium">
            로그인하러 가기
          </Button>
        </Link>
      </section>
    );
  }

  if (profileResult.kind === SERVER_USER_PROFILE_RESULT_KINDS.MISSING_PROFILE) {
    return (
      <section className="rounded-150 border-border-subtle bg-background-default border p-300">
        <h2 className="font-designer-20b text-text-default mb-75">
          프로필 정보가 아직 준비되지 않았어요
        </h2>
        <p className="font-designer-14r text-text-subtle mb-200">
          회원 정보가 아직 생성되지 않았거나 조회 대상이 존재하지 않습니다.
        </p>
        <Link href="/home">
          <Button color="outlined" size="medium">
            홈으로 이동
          </Button>
        </Link>
      </section>
    );
  }

  if (profileResult.kind === SERVER_USER_PROFILE_RESULT_KINDS.REQUEST_FAILED) {
    return (
      <section className="rounded-150 border-border-subtle bg-background-default border p-300">
        <h2 className="font-designer-20b text-text-default mb-75">
          프로필 서버 연결이 지연되고 있어요
        </h2>
        <p className="font-designer-14r text-text-subtle mb-200">
          백엔드가 실행되지 않았거나 일시적으로 응답하지 않아 기본 화면으로
          표시합니다.
        </p>
        <Link href="/mentoring">
          <Button color="outlined" size="medium">
            멘토링 목록으로 이동
          </Button>
        </Link>
      </section>
    );
  }

  const safeProfile = profileResult.profile;

  const queryClient = new QueryClient();
  queryClient.setQueryData<GetUserProfileResponse>(
    ['userProfile', memberId],
    safeProfile,
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-col gap-[26.67px]">
        <Profile
          memberId={memberId}
          memberProfile={safeProfile.memberProfile}
          sincerityTemp={safeProfile.sincerityTemp}
        />
        <ProfileInfo memberId={memberId} memberInfo={safeProfile.memberInfo} />
      </div>
    </HydrationBoundary>
  );
}
