'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { type Dispatch, useEffect, useReducer, useState } from 'react';
import { useMemberId } from '@/hooks/queries/auth/use-auth';
import { useNicknameCheckQuery } from '@/hooks/queries/auth/use-nickname-check';
import {
  useCareersQuery,
  useJobsQuery,
  useUpdateUserProfileInfoMutation,
  useUpdateUserProfileMutation,
} from '@/hooks/queries/user/use-update-user-profile-mutation';
import { useUserProfileQuery } from '@/hooks/queries/user/use-user-profile-query';
import { useToastStore } from '@/stores/use-toast-store';
import type { CareerResponse, JobResponse } from '@/types/api/my-page.types';

const WithdrawalConfirmModal = dynamic(
  () => import('./_components/withdrawal-confirm-modal'),
  { ssr: false },
);

type MemberProfile = NonNullable<
  ReturnType<typeof useUserProfileQuery>['data']
>;

interface ProfileFormEditing {
  vibeCoding: boolean;
  job: boolean;
  career: boolean;
  goal: boolean;
}

interface ProfileFormState {
  nickname: string;
  intro: string;
  goal: string;
  selectedJob: string;
  selectedCareer: string;
  nicknameToCheck: string;
  editing: ProfileFormEditing;
}

interface ProfileRowState {
  editing: ProfileFormEditing;
  selectedJob: string;
  selectedCareer: string;
  goal: string;
  jobs: JobResponse[] | undefined;
  careers: CareerResponse[] | undefined;
  profile: MemberProfile | undefined;
  dispatch: Dispatch<ProfileFormAction>;
  collapseField: (field: keyof ProfileFormEditing) => void;
  onSaveJob: () => void;
  onSaveCareer: () => void;
  onSaveGoal: () => void;
}

type ProfileFormAction =
  | {
      type: 'hydrate';
      values: Pick<
        ProfileFormState,
        'nickname' | 'intro' | 'goal' | 'selectedJob' | 'selectedCareer'
      >;
    }
  | { type: 'setNickname'; value: string }
  | { type: 'setIntro'; value: string }
  | { type: 'setGoal'; value: string }
  | { type: 'setSelectedJob'; value: string }
  | { type: 'setSelectedCareer'; value: string }
  | { type: 'setNicknameToCheck'; value: string }
  | { type: 'editAll' }
  | { type: 'collapseField'; field: keyof ProfileFormEditing };

const INITIAL_PROFILE_FORM: ProfileFormState = {
  nickname: '',
  intro: '',
  goal: '',
  selectedJob: '',
  selectedCareer: '',
  nicknameToCheck: '',
  editing: { vibeCoding: false, job: false, career: false, goal: false },
};

function profileFormReducer(
  state: ProfileFormState,
  action: ProfileFormAction,
): ProfileFormState {
  switch (action.type) {
    case 'hydrate':
      return { ...state, ...action.values };
    case 'setNickname':
      // 닉네임을 바꾸면 직전 중복확인 결과는 무효가 되므로 함께 비운다.
      return { ...state, nickname: action.value, nicknameToCheck: '' };
    case 'setIntro':
      return { ...state, intro: action.value };
    case 'setGoal':
      return { ...state, goal: action.value };
    case 'setSelectedJob':
      return { ...state, selectedJob: action.value };
    case 'setSelectedCareer':
      return { ...state, selectedCareer: action.value };
    case 'setNicknameToCheck':
      return { ...state, nicknameToCheck: action.value };
    case 'editAll':
      return {
        ...state,
        editing: {
          vibeCoding: true,
          job: true,
          career: true,
          goal: true,
        },
      };
    case 'collapseField':
      return {
        ...state,
        editing: { ...state.editing, [action.field]: false },
      };
    default:
      return state;
  }
}

function ProfileRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-100 sm:flex-row sm:items-center sm:gap-400">
      <span className="font-designer-16r text-text-default sm:w-2500 sm:shrink-0">
        {label}
      </span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

// 편집 토글형 프로필 행(관심도/직무/연차/목표). 본문 분리용 추출.
function ProfileEditableRows({
  editing,
  selectedJob,
  selectedCareer,
  goal,
  jobs,
  careers,
  profile,
  dispatch,
  collapseField,
  onSaveJob,
  onSaveCareer,
  onSaveGoal,
}: ProfileRowState) {
  return (
    <>
      {/* TODO: 바이브 코딩 관심도 — no backend field available */}
      <ProfileRow label="바이브 코딩 관심도">
        {editing.vibeCoding ? (
          <div className="flex items-start gap-200">
            <input
              type="text"
              disabled
              aria-label="바이브 코딩 관심도"
              placeholder="준비 중입니다."
              className="border-border-default rounded-100 font-designer-14r text-text-subtlest placeholder:text-text-subtlest flex-1 border bg-gray-50 px-200 py-150 outline-none"
            />
            <button
              type="button"
              onClick={() => collapseField('vibeCoding')}
              className="rounded-100 border border-border-brand px-300 py-150 font-designer-14m text-text-brand"
            >
              저장
            </button>
          </div>
        ) : (
          <span className="font-designer-16r text-text-default">없음</span>
        )}
      </ProfileRow>

      <ProfileRow label="직무">
        {editing.job ? (
          <div className="flex items-start gap-200">
            <select
              value={selectedJob}
              onChange={(e) =>
                dispatch({
                  type: 'setSelectedJob',
                  value: e.target.value,
                })
              }
              className="border-border-default rounded-100 font-designer-14r text-text-default flex-1 border px-200 py-150 outline-none"
            >
              <option value="">직무를 선택해 주세요.</option>
              {jobs?.map((j) => (
                <option key={j.job} value={j.job}>
                  {j.description}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={onSaveJob}
              className="rounded-100 border border-border-brand px-300 py-150 font-designer-14m text-text-brand"
            >
              저장
            </button>
          </div>
        ) : (
          <span className="font-designer-16r text-text-default">
            {profile?.memberInfo.jobs?.[0]?.description ?? '없음'}
          </span>
        )}
      </ProfileRow>

      <ProfileRow label="연차">
        {editing.career ? (
          <div className="flex items-start gap-200">
            <select
              value={selectedCareer}
              onChange={(e) =>
                dispatch({
                  type: 'setSelectedCareer',
                  value: e.target.value,
                })
              }
              className="border-border-default rounded-100 font-designer-14r text-text-default flex-1 border px-200 py-150 outline-none"
            >
              <option value="">연차를 선택해 주세요.</option>
              {careers?.map((c) => (
                <option key={c.career} value={c.career}>
                  {c.description}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={onSaveCareer}
              className="rounded-100 border border-border-brand px-300 py-150 font-designer-14m text-text-brand"
            >
              저장
            </button>
          </div>
        ) : (
          <span className="font-designer-16r text-text-default">
            {profile?.memberInfo.career?.description ?? '없음'}
          </span>
        )}
      </ProfileRow>

      <ProfileRow label="만들어보고 싶은 것">
        {editing.goal ? (
          <div className="flex items-start gap-200">
            <textarea
              aria-label="만들어보고 싶은 것"
              value={goal}
              onChange={(e) =>
                dispatch({
                  type: 'setGoal',
                  value: e.target.value,
                })
              }
              placeholder="만들어보고 싶은 것을 입력해 주세요."
              className="border-border-default rounded-100 font-designer-14r text-text-default placeholder:text-text-subtlest h-2413 flex-1 resize-none border p-150 px-200 outline-none"
            />
            <button
              type="button"
              onClick={onSaveGoal}
              className="rounded-100 border border-border-brand px-300 py-150 font-designer-14m text-text-brand"
            >
              저장
            </button>
          </div>
        ) : (
          <span className="font-designer-16r text-text-default">
            {profile?.memberInfo.goal ?? '없음'}
          </span>
        )}
      </ProfileRow>
    </>
  );
}

function ProfileSection({
  memberId,
  profile,
}: {
  memberId: number;
  profile: MemberProfile | undefined;
}) {
  const showToast = useToastStore((state) => state.showToast);

  const [form, dispatch] = useReducer(profileFormReducer, INITIAL_PROFILE_FORM);
  const {
    nickname,
    intro,
    goal,
    selectedJob,
    selectedCareer,
    nicknameToCheck,
    editing,
  } = form;

  const { mutateAsync: updateProfile, isPending } =
    useUpdateUserProfileMutation(memberId);
  const { mutateAsync: updateProfileInfo } =
    useUpdateUserProfileInfoMutation(memberId);
  const { data: jobs } = useJobsQuery();
  const { data: careers } = useCareersQuery();

  const handleEditAll = () => dispatch({ type: 'editAll' });

  const collapseField = (field: keyof ProfileFormEditing) =>
    dispatch({ type: 'collapseField', field });

  useEffect(() => {
    if (!profile) return;
    dispatch({
      type: 'hydrate',
      values: {
        nickname: profile.memberProfile.nickname ?? '',
        intro: profile.memberProfile.simpleIntroduction ?? '',
        goal: profile.memberInfo.goal ?? '',
        selectedJob: profile.memberInfo.jobs?.[0]?.job ?? '',
        selectedCareer: profile.memberInfo.career?.career ?? '',
      },
    });
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

  const handleSaveJob = async () => {
    if (!selectedJob) return;
    try {
      await updateProfileInfo({ jobs: [selectedJob], ignoreNull: true });
      showToast('직무가 저장되었습니다.', 'success');
      collapseField('job');
    } catch {
      showToast('저장에 실패했습니다.', 'error');
    }
  };

  const handleSaveCareer = async () => {
    if (!selectedCareer) return;
    try {
      await updateProfileInfo({
        career: selectedCareer,
        ignoreNull: true,
      });
      showToast('연차가 저장되었습니다.', 'success');
      collapseField('career');
    } catch {
      showToast('저장에 실패했습니다.', 'error');
    }
  };

  const handleSaveGoal = async () => {
    try {
      await updateProfileInfo({ goal, ignoreNull: true });
      showToast('목표가 저장되었습니다.', 'success');
      collapseField('goal');
    } catch {
      showToast('저장에 실패했습니다.', 'error');
    }
  };

  return (
    <section className="flex flex-col gap-500">
      <div className="flex items-center gap-150">
        <h1 className="font-designer-24b text-text-default">프로필</h1>
        <button
          type="button"
          onClick={handleEditAll}
          className="rounded-50 border border-border-default px-200 py-50 font-designer-14m text-text-default"
        >
          편집
        </button>
      </div>

      <ProfileRow label="이미지">
        <div className="flex items-center gap-300">
          <div className="relative size-1375 overflow-hidden rounded-full bg-gray-200">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="프로필 이미지"
                fill
                sizes="(max-width: 768px) 100vw, 300px"
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
              aria-label="닉네임"
              value={nickname}
              onChange={(e) =>
                dispatch({
                  type: 'setNickname',
                  value: e.target.value,
                })
              }
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
                onClick={() =>
                  dispatch({
                    type: 'setNicknameToCheck',
                    value: nickname,
                  })
                }
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
          {!isSameNickname && nicknameTaken && nicknameToCheck === nickname && (
            <p className="font-designer-12r text-red-500">
              이미 사용 중인 닉네임입니다.
            </p>
          )}
        </div>
      </ProfileRow>

      <ProfileRow label="자기소개">
        <div className="flex items-start gap-200">
          <textarea
            aria-label="자기소개"
            value={intro}
            onChange={(e) =>
              dispatch({
                type: 'setIntro',
                value: e.target.value,
              })
            }
            maxLength={200}
            placeholder="자신을 간략히 소개해 주세요."
            className="border-border-default rounded-100 font-designer-14r text-text-default placeholder:text-text-subtlest p-150 px-200 flex-1 resize-none border h-2413 outline-none"
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

      <ProfileEditableRows
        editing={editing}
        selectedJob={selectedJob}
        selectedCareer={selectedCareer}
        goal={goal}
        jobs={jobs}
        careers={careers}
        profile={profile}
        dispatch={dispatch}
        collapseField={collapseField}
        onSaveJob={handleSaveJob}
        onSaveCareer={handleSaveCareer}
        onSaveGoal={handleSaveGoal}
      />
    </section>
  );
}

function BasicInfoSection({ profile }: { profile: MemberProfile | undefined }) {
  return (
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
            <div className="flex items-center justify-between rounded-100 border border-border-default p-125">
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
                readOnly
                aria-label="휴대폰 번호"
                value={profile?.memberProfile.tel ?? ''}
                placeholder="휴대폰 번호를 입력해주세요."
                className="min-w-0 flex-1 rounded-100 border border-border-default bg-gray-50 p-125 font-designer-14r text-text-default placeholder:text-text-subtlest outline-none"
              />
              <button
                type="button"
                disabled
                className="shrink-0 rounded-100 bg-gray-200 p-125 font-designer-14r text-gray-500"
              >
                인증하기
              </button>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                disabled
                className="rounded-100 p-125 font-designer-14r text-text-default"
              >
                취소하기
              </button>
            </div>
          </div>
        </ProfileRow>
      </div>
    </section>
  );
}

function BannerSection() {
  return (
    <section className="flex flex-col gap-250 sm:flex-row">
      <a
        href="https://discord.gg/z66gzHnKp"
        target="_blank"
        rel="noopener noreferrer"
        className="border-[#D5D7DA] rounded-200 flex flex-1 items-center justify-center gap-175 overflow-hidden border bg-gray-50 py-250 transition-colors hover:bg-gray-100"
      >
        <div className="relative size-675 shrink-0 overflow-hidden rounded-150">
          <Image
            src="/my-page/discord-icon.png"
            alt="Discord"
            fill
            sizes="100px"
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

      <Link
        href="/builder-feed"
        className="border-border-brand rounded-200 flex flex-1 items-center justify-center gap-175 overflow-hidden border bg-white py-250 transition-colors hover:bg-gray-50"
      >
        <div className="relative size-675 shrink-0 overflow-hidden">
          <div className="absolute inset-[12.5%]">
            <Image
              src="/my-page/feed-icon.svg"
              alt="빌더 피드"
              fill
              sizes="100px"
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
      </Link>
    </section>
  );
}

export default function MyPage() {
  const { data: memberData } = useMemberId();
  const memberId = Number(memberData?.memberId ?? 0);

  const { data: profile, isLoading } = useUserProfileQuery(memberId);

  const [withdrawalOpen, setWithdrawalOpen] = useState(false);

  if (isLoading || !memberId) {
    return (
      <div className="flex items-center justify-center py-600">
        <p className="font-designer-14r text-text-subtle">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-600 pb-600">
      <ProfileSection memberId={memberId} profile={profile} />

      <hr className="border-border-subtle" />

      <BasicInfoSection profile={profile} />

      <hr className="border-border-subtle" />

      <BannerSection />

      <hr className="border-border-subtle" />

      {/* 계정 탈퇴 */}
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
