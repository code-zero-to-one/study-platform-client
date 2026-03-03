'use client';

import {
  GraduationCap,
  Info,
  Settings2,
  SquareArrowOutUpRight,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import SurfacePanel from '@/components/ui/surface-panel';
import MentoringStateBoundary from '@/features/mentoring/ui/common/mentoring-state-boundary';
import MentorManagementWorkspace from '@/features/mentoring/ui/management/mentor-management-workspace';
import MentoringGuideModal from '@/features/mentoring/ui/common/mentoring-guide-modal';
import { useAuthReady } from '@/hooks/common/use-auth';
import { getMentorSettings } from '@/mocks/mentoring-mock-data';
import { useMentorDirectoryStore } from '@/stores/useMentorDirectoryStore';
import type { MentorProfile } from '@/types/mentoring/domain';

const getEnabledMethodCount = (mentor: MentorProfile) => {
  return Object.values(mentor.methods).filter(
    (method) => method.enabled !== false,
  ).length;
};

export default function MentoringManagementPageClient() {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const { memberId } = useAuthReady();
  const hasHydrated = useMentorDirectoryStore((state) => state.hasHydrated);
  const mentorIdByMember = useMentorDirectoryStore(
    (state) => state.mentorIdByMember,
  );
  const createdMentors = useMentorDirectoryStore(
    (state) => state.createdMentors,
  );

  return (
    <MentoringStateBoundary
      state={hasHydrated ? 'ready' : 'loading'}
      ready={(() => {
        const myMentorId = memberId ? mentorIdByMember[memberId] : undefined;
        const myMentorProfile = createdMentors.find(
          (mentor) => mentor.id === myMentorId,
        );
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
                멘토링 관리
              </h1>
              <button
                type="button"
                className="font-designer-14m text-text-subtle hover:text-text-default inline-flex items-center gap-50"
                onClick={() => setIsGuideOpen(true)}
              >
                <Info className="h-14 w-14" />
                멘토링 안내
              </button>
            </header>

            <SurfacePanel
              radius="lg"
              className="border-border-information bg-background-accent-blue-subtle p-250"
            >
              <h2 className="font-designer-18b text-text-default">
                관리 화면 역할 구분
              </h2>
              <p className="font-designer-13r text-text-subtle mt-50">
                현재 페이지(`/mentoring-management`)는 멘토 운영 화면입니다.
                유저(멘티)와 멘토의 관리 범위는 아래처럼 분리됩니다.
              </p>
              <div className="mt-175 grid grid-cols-1 gap-125 md:grid-cols-2">
                <article className="rounded-150 border-border-subtle bg-background-default border p-175">
                  <h3 className="font-designer-14b text-text-default">
                    유저(멘티) 입장 관리
                  </h3>
                  <p className="font-designer-13r text-text-subtle mt-50">
                    내가 신청한 상담 내역 확인, 멘토 답변 확인, 상담 완료 후
                    후기 작성
                  </p>
                  <div className="mt-100 flex flex-wrap gap-100">
                    <Link
                      href="/note-consultation"
                      className="font-designer-12m text-text-information hover:underline"
                    >
                      쪽지 상담 관리
                    </Link>
                    <Link
                      href="/my-study-review"
                      className="font-designer-12m text-text-information hover:underline"
                    >
                      내 멘토링 후기 관리
                    </Link>
                  </div>
                </article>
                <article className="rounded-150 border-border-subtle bg-background-default border p-175">
                  <h3 className="font-designer-14b text-text-default">
                    멘토 입장 관리
                  </h3>
                  <p className="font-designer-13r text-text-subtle mt-50">
                    신청서 검토 및 수락/거절, 입금 확인, 상담 일정
                    확정/변경/취소
                  </p>
                  <div className="mt-100 flex flex-wrap gap-100">
                    <Link
                      href="/mentoring-management"
                      className="font-designer-12m text-text-information hover:underline"
                    >
                      일정 대시보드
                    </Link>
                    <Link
                      href="/mentoring-management/requests"
                      className="font-designer-12m text-text-information hover:underline"
                    >
                      신청 처리 페이지
                    </Link>
                  </div>
                </article>
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
                        {myMentorProfile.headline}
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
                        쪽지 상담
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
                  아직 등록한 멘토링이 없어요
                </h2>
                <p className="font-designer-16m text-text-default mb-50">
                  멘티가 당신의 인사이트를 기다리고 있어요.
                </p>
                <p className="font-designer-14r text-text-subtle mb-250">
                  멘토링을 만들고 경험을 공유해보세요.
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
