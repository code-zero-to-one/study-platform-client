'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useMemberId } from '@/hooks/queries/auth/use-auth';
import { useNicknameCheckQuery } from '@/hooks/queries/auth/use-nickname-check';
import { useUpdateUserProfileMutation } from '@/hooks/queries/user/use-update-user-profile-mutation';
import { useUserProfileQuery } from '@/hooks/queries/user/use-user-profile-query';
import { useToastStore } from '@/stores/use-toast-store';

const WithdrawalConfirmModal = dynamic(
  () => import('./_components/withdrawal-confirm-modal'),
  { ssr: false },
);

function ProfileRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-100 sm:flex-row sm:gap-400">
      <span className="font-designer-16r text-text-default sm:w-2500 sm:shrink-0 sm:pt-150">
        {label}
      </span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

export default function MyPage() {
  const { data: memberData } = useMemberId();
  const memberId = Number(memberData?.memberId ?? 0);

  const { data: profile, isLoading } = useUserProfileQuery(memberId);
  const { mutateAsync: updateProfile, isPending } =
    useUpdateUserProfileMutation(memberId);

  const showToast = useToastStore((state) => state.showToast);

  const [nickname, setNickname] = useState('');
  const [intro, setIntro] = useState('');
  const [nicknameToCheck, setNicknameToCheck] = useState('');
  const [withdrawalOpen, setWithdrawalOpen] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const p = profile.memberProfile;
    setNickname(p.nickname ?? '');
    setIntro(p.simpleIntroduction ?? '');
  }, [profile]);

  const {
    isFetching: checkingNickname,
    isSuccess: nicknameAvailable,
    isError: nicknameTaken,
  } = useNicknameCheckQuery(nicknameToCheck, !!nicknameToCheck);

  const currentNickname = profile?.memberProfile.nickname;
  const isSameNickname = nickname === currentNickname;

  const avatarUrl =
    profile?.memberProfile.profileImage?.resizedImages?.[0]?.resizedImageUrl;

  const handleSaveNickname = async () => {
    if (!memberId) return;
    try {
      await updateProfile({ nickname, ignoreNull: true });
      showToast('닉네임이 저장되었습니다.', 'success');
    } catch {
      showToast('저장에 실패했습니다.', 'error');
    }
  };

  const handleSaveIntro = async () => {
    if (!memberId) return;
    try {
      await updateProfile({
        simpleIntroduction: intro,
        ignoreNull: true,
      });
      showToast('자기소개가 저장되었습니다.', 'success');
    } catch {
      showToast('저장에 실패했습니다.', 'error');
    }
  };

  if (isLoading || !memberId) {
    return (
      <div className="flex items-center justify-center py-600">
        <p className="font-designer-14r text-text-subtle">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-600 pb-600">
      {/* Section A: 프로필 */}
      <section className="flex flex-col gap-500">
        <h1 className="font-designer-24b text-text-default">프로필</h1>

        <ProfileRow label="이미지">
          <div className="flex items-center gap-300">
            <div className="relative size-1375 overflow-hidden rounded-full bg-gray-200">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="프로필 이미지"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="font-designer-24b text-gray-400">
                    {nickname?.[0]?.toUpperCase() ?? '?'}
                  </span>
                </div>
              )}
            </div>
            <button
              type="button"
              className="font-designer-14m text-text-subtle hover:text-text-default"
            >
              이미지 변경하기
            </button>
          </div>
        </ProfileRow>

        <ProfileRow label="닉네임">
          <div className="flex flex-col gap-100">
            <div className="flex flex-wrap gap-200">
              <input
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setNicknameToCheck('');
                }}
                maxLength={10}
                placeholder="닉네임을 입력하세요 (2~10자)"
                className="border-border-default rounded-100 font-designer-14r text-text-default placeholder:text-text-subtlest min-w-0 flex-1 border px-200 py-150 outline-none"
              />
              <div className="flex gap-200">
                <button
                  type="button"
                  disabled={
                    isSameNickname ||
                    nickname.length < 2 ||
                    nickname.length > 10 ||
                    checkingNickname
                  }
                  onClick={() => setNicknameToCheck(nickname)}
                  className="rounded-100 border border-border-brand px-300 py-150 font-designer-14m text-text-brand disabled:border-gray-300 disabled:text-gray-400"
                >
                  {checkingNickname ? '확인 중...' : '중복 확인'}
                </button>
                <button
                  type="button"
                  disabled={
                    isPending ||
                    isSameNickname ||
                    !(nicknameAvailable && nicknameToCheck === nickname)
                  }
                  onClick={handleSaveNickname}
                  className="rounded-100 border border-border-brand px-300 py-150 font-designer-14m text-text-brand disabled:border-gray-300 disabled:text-gray-400"
                >
                  저장
                </button>
              </div>
            </div>
            {!isSameNickname &&
              nicknameAvailable &&
              nicknameToCheck === nickname && (
                <p className="font-designer-12r text-green-600">
                  사용 가능한 닉네임입니다.
                </p>
              )}
            {!isSameNickname &&
              nicknameTaken &&
              nicknameToCheck === nickname && (
                <p className="font-designer-12r text-red-500">
                  이미 사용 중인 닉네임입니다.
                </p>
              )}
          </div>
        </ProfileRow>

        <ProfileRow label="자기소개">
          <div className="flex items-start gap-200">
            <textarea
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              maxLength={200}
              placeholder="자신을 간략히 소개해 주세요."
              className="border-border-default rounded-100 font-designer-14r text-text-default placeholder:text-text-subtlest h-2413 flex-1 resize-none border px-200 py-150 outline-none"
            />
            <button
              type="button"
              disabled={isPending}
              onClick={handleSaveIntro}
              className="rounded-100 border border-border-brand px-300 py-150 font-designer-14m text-text-brand disabled:opacity-50"
            >
              저장
            </button>
          </div>
        </ProfileRow>

        {/* TODO: 바이브 코딩 관심도 — no backend field available */}
        <ProfileRow label="바이브 코딩 관심도">
          <div className="flex items-start gap-200">
            <input
              type="text"
              disabled
              placeholder="준비 중입니다."
              className="border-border-default rounded-100 font-designer-14r text-text-subtlest placeholder:text-text-subtlest flex-1 border bg-gray-50 px-200 py-150 outline-none"
            />
            <button
              type="button"
              disabled
              className="rounded-100 border border-gray-300 px-300 py-150 font-designer-14m text-gray-400"
            >
              저장
            </button>
          </div>
        </ProfileRow>

        {/* TODO: 직무 edit — enum-based, requires /profile/info endpoint */}
        <ProfileRow label="직무">
          <div className="flex items-start gap-200">
            <input
              type="text"
              disabled
              value={profile?.memberInfo.jobs?.[0]?.description ?? ''}
              placeholder="직무를 선택해 주세요."
              className="border-border-default rounded-100 font-designer-14r text-text-default placeholder:text-text-subtlest flex-1 border bg-gray-50 px-200 py-150 outline-none"
            />
            <button
              type="button"
              disabled
              className="rounded-100 border border-gray-300 px-300 py-150 font-designer-14m text-gray-400"
            >
              저장
            </button>
          </div>
        </ProfileRow>

        {/* TODO: 연차 edit — enum-based, requires /profile/info endpoint */}
        <ProfileRow label="연차">
          <div className="flex items-start gap-200">
            <input
              type="text"
              disabled
              value={profile?.memberInfo.career?.description ?? ''}
              placeholder="연차를 선택해 주세요."
              className="border-border-default rounded-100 font-designer-14r text-text-default placeholder:text-text-subtlest flex-1 border bg-gray-50 px-200 py-150 outline-none"
            />
            <button
              type="button"
              disabled
              className="rounded-100 border border-gray-300 px-300 py-150 font-designer-14m text-gray-400"
            >
              저장
            </button>
          </div>
        </ProfileRow>

        {/* TODO: 만들어보고 싶은 것 — requires /profile/info endpoint */}
        <ProfileRow label="만들어보고 싶은 것">
          <div className="flex items-start gap-200">
            <textarea
              disabled
              value={profile?.memberInfo.goal ?? ''}
              placeholder="만들어보고 싶은 것을 입력해 주세요."
              className="border-border-default rounded-100 font-designer-14r text-text-default placeholder:text-text-subtlest h-2413 flex-1 resize-none border bg-gray-50 px-200 py-150 outline-none"
            />
            <button
              type="button"
              disabled
              className="rounded-100 border border-gray-300 px-300 py-150 font-designer-14m text-gray-400"
            >
              저장
            </button>
          </div>
        </ProfileRow>
      </section>

      <hr className="border-border-subtle" />

      {/* Section B: 기본 정보 */}
      <section className="flex flex-col gap-500">
        <h2 className="font-designer-18b text-text-default">기본 정보</h2>

        <div className="flex flex-col gap-375">
          <ProfileRow label="인증완료">
            <span className="font-designer-16b text-text-default">
              {profile?.isVerified ? '본인 인증 완료' : '미인증'}
            </span>
          </ProfileRow>

          {/* TODO: email — not present in memberProfile API response */}
          <ProfileRow label="이메일">
            <div className="flex items-center gap-125">
              <span className="font-designer-16b text-text-default">
                이메일 정보를 불러올 수 없습니다.
              </span>
              <span className="font-designer-14r text-text-subtlest shrink-0">
                변경 불가
              </span>
            </div>
          </ProfileRow>

          <ProfileRow label="휴대폰 번호">
            <div className="flex flex-col gap-125">
              <div className="flex items-center justify-between rounded-100 border border-border-default px-125 py-125">
                <span className="font-designer-14m text-text-subtle">
                  대한민국 +82
                </span>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                  className="shrink-0 text-text-subtle"
                >
                  <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
                </svg>
              </div>
              <div className="flex gap-125">
                <input
                  type="tel"
                  disabled
                  value={profile?.memberProfile.tel ?? ''}
                  placeholder="휴대폰 번호를 입력해주세요."
                  className="min-w-0 flex-1 rounded-100 border border-border-default bg-gray-50 px-125 py-125 font-designer-14r text-text-default placeholder:text-text-subtlest outline-none"
                />
                <button
                  type="button"
                  disabled
                  className="shrink-0 rounded-100 bg-gray-200 px-125 py-125 font-designer-14r text-gray-500"
                >
                  인증하기
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled
                  className="rounded-100 px-125 py-125 font-designer-14r text-text-default"
                >
                  취소하기
                </button>
              </div>
            </div>
          </ProfileRow>
        </div>
      </section>

      <hr className="border-border-subtle" />

      {/* Section C: 배너 */}
      <section className="flex flex-col gap-250 sm:flex-row">
        <a
          href="https://discord.gg/z66gzHnKp"
          target="_blank"
          rel="noopener noreferrer"
          className="border-[#D5D7DA] rounded-200 flex flex-1 items-center justify-center gap-175 overflow-hidden border bg-gray-50 py-250 transition-colors hover:bg-gray-100"
        >
          <div className="relative h-675 w-675 shrink-0 overflow-hidden rounded-150">
            <Image
              src="/my-page/discord-icon.png"
              alt="Discord"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-designer-20sb">
              <span className="text-text-brand">디스코드에서 함께 공부</span>
              <span className="text-text-strong">해요</span>
            </p>
            <p className="font-designer-16r text-text-strong">
              빌더들과 실시간 소통할 수 있어요!
            </p>
          </div>
        </a>

        <a
          href="/builder-feed"
          className="border-border-brand rounded-200 flex flex-1 items-center justify-center gap-175 overflow-hidden border bg-white py-250 transition-colors hover:bg-gray-50"
        >
          <div className="relative h-675 w-675 shrink-0 overflow-hidden">
            <div className="absolute inset-[12.5%]">
              <Image
                src="/my-page/feed-icon.svg"
                alt="빌더 피드"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
          <div>
            <p className="font-designer-20sb">
              <span className="text-text-brand">빌더 피드</span>
              <span className="text-text-strong"> 확인하러 가기</span>
            </p>
            <p className="font-designer-16r text-text-strong">
              다른 빌더들과 결과물을 공유하며 소통해보세요!
            </p>
          </div>
        </a>
      </section>

      <hr className="border-border-subtle" />

      {/* Section D: 계정 탈퇴 */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setWithdrawalOpen(true)}
          className="font-designer-12r text-text-default hover:underline"
        >
          계정 탈퇴
        </button>
      </div>

      <WithdrawalConfirmModal
        open={withdrawalOpen}
        onOpenChange={setWithdrawalOpen}
      />
    </div>
  );
}
