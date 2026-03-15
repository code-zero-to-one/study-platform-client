'use client';

import {
  GraduationCap,
  Info,
  Settings2,
  SquareArrowOutUpRight,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import Badge from '@/components/common/ui/badge';
import Button from '@/components/common/ui/button';
import SurfacePanel from '@/components/common/ui/surface-panel';
import { useAuthReady } from '@/features/auth/model/use-auth';
import { getMentorSettings } from '@/features/mentoring/model/mentor-profile-utils';
import { MENTORING_DISCORD_INVITE_URL } from '@/features/mentoring/model/mentoring-flow-policy';
import { useMyMentorProfileQuery } from '@/features/mentoring/model/use-mentor-directory-query';
import { MENTORING_NOTE_LABEL } from '@/features/mentoring/model/my-mentoring-display-meta';
import MentoringGuideModal from '@/features/mentoring/ui/common/mentoring-guide-modal';
import MentoringStateBoundary from '@/features/mentoring/ui/common/mentoring-state-boundary';
import MentorManagementWorkspace from '@/features/mentoring/ui/management/mentor-management-workspace';
import { useMentorDirectoryStore } from '@/stores/useMentorDirectoryStore';
import type { MentorProfile } from '@/types/mentoring/domain';

const OPERATION_CHECKPOINTS = [
  '예약형 상담은 24시간 안에 확인',
  '기본 채널은 디스코드',
  '운영 전 디스코드 입장',
] as const;

const getEnabledMethodCount = (mentor: MentorProfile) => {
  return Object.values(mentor.methods).filter(
    (method) => method.enabled === true,
  ).length;
};

export default function MentoringManagementPageClient() {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const { memberId } = useAuthReady();
  const hasHydrated = useMentorDirectoryStore((state) => state.hasHydrated);
  const myMentorProfileQuery = useMyMentorProfileQuery(
    hasHydrated && Boolean(memberId),
  );

  return (
    <MentoringStateBoundary
      state={
        !hasHydrated || myMentorProfileQuery.isLoading
          ? 'loading'
          : myMentorProfileQuery.isError
            ? 'error'
            : 'ready'
      }
      error={
        <SurfacePanel radius="lg" className="p-300 text-center">
          <h2 className="font-designer-20b text-text-default mb-75">
            멘토 운영 정보를 불러오지 못했어요
          </h2>
          <p className="font-designer-14r text-text-subtle">
            잠시 후 다시 시도해주세요.
          </p>
        </SurfacePanel>
      }
      ready={(() => {
        const myMentorProfile = myMentorProfileQuery.mentor;
        const myMentorSettings = myMentorProfile
          ? getMentorSettings(myMentorProfile)
          : null;
        const profileDescription =
          myMentorSettings?.appealLine?.trim() ||
          myMentorSettings?.mentoringTitle?.trim() ||
          '-';

        return (
          <div className="flex flex-col gap-300">
            <header className="flex items-center justify-between">
              <h1 className="font-designer-24b text-text-default">
                멘토 운영 관리
              </h1>
              <button
                type="button"
                className="font-designer-14m text-text-subtle hover:text-text-default inline-flex items-center gap-50"
                onClick={() => setIsGuideOpen(true)}
              >
                <Info className="h-14 w-14" />
                멘토 운영 안내
              </button>
            </header>

            <SurfacePanel
              radius="lg"
              className="border-border-information bg-background-accent-blue-subtle p-250"
            >
              <h2 className="font-designer-18b text-text-default">빠른 이동</h2>
              <p className="font-designer-13r text-text-subtle mt-50">
                필요한 화면으로 바로 이동하세요.
              </p>
              <div className="mt-200 grid grid-cols-1 gap-125 md:grid-cols-2">
                <article className="rounded-150 border-border-subtle bg-background-default border p-200">
                  <h3 className="font-designer-14b text-text-default">
                    내가 신청한 멘토링
                  </h3>
                  <p className="font-designer-13r text-text-subtle mt-50">
                    신청 내역, 답변, 후기 확인
                  </p>
                  <div className="mt-100 flex flex-wrap gap-100">
                    <Link
                      href="/my-mentoring"
                      className="font-designer-12m text-text-information hover:underline"
                    >
                      나의 멘토링
                    </Link>
                    <Link
                      href="/note-consultation"
                      className="font-designer-12m text-text-information hover:underline"
                    >
                      {MENTORING_NOTE_LABEL} 관리
                    </Link>
                    <Link
                      href="/my-study-review"
                      className="font-designer-12m text-text-information hover:underline"
                    >
                      후기 관리
                    </Link>
                  </div>
                </article>
                <article className="rounded-150 border-border-subtle bg-background-default border p-200">
                  <h3 className="font-designer-14b text-text-default">
                    내가 운영하는 멘토링
                  </h3>
                  <p className="font-designer-13r text-text-subtle mt-50">
                    신청 처리, 입금 확인, 일정 조율
                  </p>
                  <div className="mt-100 flex flex-wrap gap-100">
                    <Link
                      href="/mentoring-management/requests"
                      className="font-designer-12m text-text-information hover:underline"
                    >
                      신청 관리
                    </Link>
                  </div>
                </article>
              </div>
            </SurfacePanel>

            <SurfacePanel radius="lg" className="p-250">
              <div className="flex flex-col gap-200 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-125">
                  <div>
                    <h2 className="font-designer-18b text-text-default">
                      운영 체크
                    </h2>
                    <p className="font-designer-13r text-text-subtle mt-50">
                      운영 전에 꼭 볼 기준만 모았습니다.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-125 md:grid-cols-3">
                    {OPERATION_CHECKPOINTS.map((item) => (
                      <article
                        key={item}
                        className="rounded-150 border-border-subtle bg-background-alternative border p-200"
                      >
                        <p className="font-designer-14m text-text-default">
                          {item}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
                <Button asChild color="outlined" size="medium">
                  <a
                    href={MENTORING_DISCORD_INVITE_URL}
                    target="_blank"
                    rel="noreferrer"
                  >
                    디스코드 입장
                    <SquareArrowOutUpRight className="h-16 w-16" />
                  </a>
                </Button>
              </div>
            </SurfacePanel>

            {myMentorProfile ? (
              <>
                <SurfacePanel
                  radius="lg"
                  className="flex flex-col gap-200 p-300"
                >
                  <div className="flex items-start justify-between gap-200">
                    <div>
                      <p className="font-designer-14r text-text-subtle mb-50">
                        등록한 멘토 프로필
                      </p>
                      <h2 className="font-designer-20b text-text-default line-clamp-2">
                        {myMentorSettings?.mentoringTitle?.trim() || '-'}
                      </h2>
                    </div>
                    <Badge color="green" shape="round">
                      상담 방식 {getEnabledMethodCount(myMentorProfile)}개
                    </Badge>
                  </div>

                  <p className="font-designer-14r text-text-subtle line-clamp-2">
                    {profileDescription}
                  </p>

                  <div className="flex flex-wrap gap-100">
                    {myMentorProfile.tags.slice(0, 5).map((tag) => (
                      <Badge key={tag} color="gray" shape="round">
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-100">
                    <Link href="/mentoring/become-mentor">
                      <Button
                        color="outlined"
                        size="medium"
                        icon={<Settings2 className="h-16 w-16" />}
                      >
                        멘토링 설정 수정
                      </Button>
                    </Link>
                    <Link href={`/mentoring/${myMentorProfile.id}`}>
                      <Button color="primary" size="medium">
                        멘토 프로필 보기
                      </Button>
                    </Link>
                    <Link href="/mentoring">
                      <Button color="outlined" size="medium">
                        멘토링 목록
                      </Button>
                    </Link>
                    <Link href="/note-consultation">
                      <Button color="outlined" size="medium">
                        {MENTORING_NOTE_LABEL}
                      </Button>
                    </Link>
                  </div>
                </SurfacePanel>
                {memberId ? (
                  <MentorManagementWorkspace
                    memberId={memberId}
                    mentor={myMentorProfile}
                  />
                ) : null}
              </>
            ) : (
              <SurfacePanel
                radius="lg"
                className="flex min-h-[420px] flex-col items-center justify-center px-300 py-500 text-center"
              >
                <div className="bg-fill-brand-subtle-default rounded-500 mb-200 flex h-[72px] w-[72px] items-center justify-center">
                  <GraduationCap className="text-text-brand h-32 w-32" />
                </div>
                <h2 className="font-designer-24b text-text-default mb-75">
                  아직 운영 중인 멘토링이 없어요
                </h2>
                <p className="font-designer-16m text-text-default mb-50">
                  멘토로 운영할 멘토링을 먼저 등록하세요.
                </p>
                <p className="font-designer-14r text-text-subtle mb-250">
                  등록 후 이 화면에서 신청과 일정을 관리할 수 있어요.
                </p>

                <Link href="/mentoring/become-mentor">
                  <Button color="primary" size="large">
                    멘토링 만들기
                  </Button>
                </Link>

                <Link
                  href="/mentoring"
                  className="font-designer-14m text-text-subtle mt-150 inline-flex items-center gap-50"
                >
                  멘토링 목록 보러가기
                  <SquareArrowOutUpRight className="h-14 w-14" />
                </Link>
              </SurfacePanel>
            )}

            <MentoringGuideModal
              open={isGuideOpen}
              onOpenChange={setIsGuideOpen}
            />
          </div>
        );
      })()}
    />
  );
}
