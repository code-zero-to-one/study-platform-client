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

export default function MyPage() {
  const { data: memberData } = useMemberId();
  const memberId = Number(memberData?.memberId ?? 0);

  const { data: profile, isLoading } = useUserProfileQuery(memberId);
  const { mutateAsync: updateProfile, isPending } =
    useUpdateUserProfileMutation(memberId);

  const showToast = useToastStore((state) => state.showToast);

  const [nickname, setNickname] = useState('');
  const [intro, setIntro] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [blogLink, setBlogLink] = useState('');
  const [nicknameToCheck, setNicknameToCheck] = useState('');
  const [withdrawalOpen, setWithdrawalOpen] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const p = profile.memberProfile;
    setNickname(p.nickname ?? '');
    setIntro(p.simpleIntroduction ?? '');
    setGithubLink(p.githubLink?.url ?? '');
    setBlogLink(p.blogOrSnsLink?.url ?? '');
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

  const handleSave = async () => {
    if (!memberId) return;
    try {
      await updateProfile({
        nickname,
        simpleIntroduction: intro,
        githubLink: githubLink || undefined,
        blogOrSnsLink: blogLink || undefined,
      });
      showToast('프로필이 저장되었습니다.', 'success');
    } catch {
      showToast('프로필 저장에 실패했습니다.', 'error');
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
    <div className="flex flex-col gap-600">
      <div className="flex items-center justify-between">
        <h1 className="font-designer-24b text-text-default">프로필</h1>
        <button
          type="button"
          disabled={isPending}
          onClick={handleSave}
          className="rounded-100 bg-primary-500 px-300 py-150 font-designer-14m text-white disabled:opacity-50"
        >
          {isPending ? '저장 중...' : '저장하기'}
        </button>
      </div>

      {/* 프로필 이미지 */}
      <section className="flex items-center gap-300">
        <div className="relative h-1250 w-1250 overflow-hidden rounded-full bg-gray-200">
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
        <div className="flex flex-col gap-50">
          <p className="font-designer-16b text-text-default">
            {profile?.memberProfile.memberName ?? ''}
          </p>
          {profile?.memberProfile.tel && (
            <p className="font-designer-14r text-text-subtle">
              {profile.memberProfile.tel}
            </p>
          )}
        </div>
      </section>

      <hr className="border-border-subtle" />

      {/* 기본 정보 */}
      <section className="flex flex-col gap-400">
        <h2 className="font-designer-18b text-text-default">기본 정보</h2>

        {/* 닉네임 */}
        <div className="flex flex-col gap-100">
          <label className="font-designer-14m text-text-default">닉네임</label>
          <div className="flex gap-200">
            <input
              type="text"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setNicknameToCheck('');
              }}
              maxLength={10}
              placeholder="닉네임을 입력하세요 (2~10자)"
              className="border-border-default rounded-100 font-designer-14r text-text-default placeholder:text-text-subtlest flex-1 border px-200 py-150 outline-none"
            />
            <button
              type="button"
              disabled={
                isSameNickname ||
                nickname.length < 2 ||
                nickname.length > 10 ||
                checkingNickname
              }
              onClick={() => setNicknameToCheck(nickname)}
              className="rounded-100 border border-primary-500 px-300 py-150 font-designer-14m text-primary-500 disabled:border-gray-300 disabled:text-gray-400"
            >
              {checkingNickname ? '확인 중...' : '중복 확인'}
            </button>
          </div>
          {!isSameNickname &&
            nicknameAvailable &&
            nicknameToCheck === nickname && (
              <p className="font-designer-12r text-green-600">
                사용 가능한 닉네임입니다.
              </p>
            )}
          {!isSameNickname && nicknameTaken && nicknameToCheck === nickname && (
            <p className="font-designer-12r text-red-500">
              이미 사용 중인 닉네임입니다.
            </p>
          )}
        </div>

        {/* 소개 */}
        <div className="flex flex-col gap-100">
          <label className="font-designer-14m text-text-default">소개</label>
          <textarea
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            rows={4}
            maxLength={200}
            placeholder="자신을 간략히 소개해 주세요."
            className="border-border-default rounded-100 font-designer-14r text-text-default placeholder:text-text-subtlest resize-none border px-200 py-150 outline-none"
          />
          <p className="font-designer-12r text-text-subtlest text-right">
            {intro.length}/200
          </p>
        </div>
      </section>

      <hr className="border-border-subtle" />

      {/* 링크 */}
      <section className="flex flex-col gap-400">
        <h2 className="font-designer-18b text-text-default">링크</h2>

        <div className="flex flex-col gap-100">
          <label className="font-designer-14m text-text-default">GitHub</label>
          <input
            type="url"
            value={githubLink}
            onChange={(e) => setGithubLink(e.target.value)}
            placeholder="https://github.com/username"
            className="border-border-default rounded-100 font-designer-14r text-text-default placeholder:text-text-subtlest border px-200 py-150 outline-none"
          />
        </div>

        <div className="flex flex-col gap-100">
          <label className="font-designer-14m text-text-default">
            블로그 / SNS
          </label>
          <input
            type="url"
            value={blogLink}
            onChange={(e) => setBlogLink(e.target.value)}
            placeholder="https://blog.example.com"
            className="border-border-default rounded-100 font-designer-14r text-text-default placeholder:text-text-subtlest border px-200 py-150 outline-none"
          />
        </div>
      </section>

      <hr className="border-border-subtle" />

      {/* 커뮤니티 */}
      <section className="flex flex-col gap-300">
        <h2 className="font-designer-18b text-text-default">커뮤니티</h2>
        <div className="grid grid-cols-1 gap-300 sm:grid-cols-2">
          <a
            href="https://discord.gg/zeroone"
            target="_blank"
            rel="noopener noreferrer"
            className="border-border-subtle rounded-200 flex items-center gap-300 border p-300 transition-colors hover:bg-gray-50"
          >
            <div className="flex h-1000 w-1000 items-center justify-center rounded-full bg-indigo-100">
              <span className="font-designer-16b text-indigo-600">D</span>
            </div>
            <div>
              <p className="font-designer-14b text-text-default">
                Discord 커뮤니티
              </p>
              <p className="font-designer-12r text-text-subtle">
                ZeroOne Discord 서버 참여하기
              </p>
            </div>
          </a>

          <a
            href="/builder-feed"
            className="border-border-subtle rounded-200 flex items-center gap-300 border p-300 transition-colors hover:bg-gray-50"
          >
            <div className="bg-primary-100 flex h-1000 w-1000 items-center justify-center rounded-full">
              <span className="font-designer-16b text-primary-600">B</span>
            </div>
            <div>
              <p className="font-designer-14b text-text-default">빌더 피드</p>
              <p className="font-designer-12r text-text-subtle">
                나의 학습 기록 공유하기
              </p>
            </div>
          </a>
        </div>
      </section>

      <hr className="border-border-subtle" />

      {/* 회원 탈퇴 */}
      <section className="flex flex-col gap-200">
        <h2 className="font-designer-18b text-red-500">위험 구역</h2>
        <p className="font-designer-14r text-text-subtle">
          탈퇴 시 모든 데이터가 삭제되며 복구되지 않습니다.
        </p>
        <button
          type="button"
          onClick={() => setWithdrawalOpen(true)}
          className="w-fit rounded-100 border border-red-300 px-300 py-150 font-designer-14m text-red-500 hover:bg-red-50"
        >
          회원 탈퇴
        </button>
      </section>

      <WithdrawalConfirmModal
        open={withdrawalOpen}
        onOpenChange={setWithdrawalOpen}
      />
    </div>
  );
}
