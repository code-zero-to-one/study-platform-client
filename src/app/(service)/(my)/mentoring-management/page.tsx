'use client';

import {
  GraduationCap,
  Info,
  Settings2,
  SquareArrowOutUpRight,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import MentorManagementWorkspace from '@/components/mentoring/management/mentor-management-workspace';
import MentoringGuideModal from '@/components/mentoring/mentoring-guide-modal';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { useAuthReady } from '@/hooks/common/use-auth';
import { type MentorProfile } from '@/mocks/mentoring-mock-data';
import { useMentorDirectoryStore } from '@/stores/useMentorDirectoryStore';

const getEnabledMethodCount = (mentor: MentorProfile) => {
  return Object.values(mentor.methods).filter(
    (method) => method.enabled !== false,
  ).length;
};

export default function MentoringManagementPage() {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const { memberId } = useAuthReady();
  const hasHydrated = useMentorDirectoryStore((state) => state.hasHydrated);
  const mentorIdByMember = useMentorDirectoryStore(
    (state) => state.mentorIdByMember,
  );
  const createdMentors = useMentorDirectoryStore(
    (state) => state.createdMentors,
  );

  if (!hasHydrated) {
    return (
      <div className="rounded-200 bg-background-alternative h-[360px] animate-pulse" />
    );
  }

  const myMentorId = memberId ? mentorIdByMember[memberId] : undefined;
  const myMentorProfile = createdMentors.find(
    (mentor) => mentor.id === myMentorId,
  );

  return (
    <div className="flex flex-col gap-300">
      <header className="flex items-center justify-between">
        <h1 className="font-designer-24b text-text-default">멘토링 관리</h1>
        <button
          type="button"
          className="font-designer-14m text-text-subtle hover:text-text-default inline-flex items-center gap-50"
          onClick={() => setIsGuideOpen(true)}
        >
          <Info className="h-14 w-14" />
          멘토링 안내
        </button>
      </header>

      {myMentorProfile ? (
        <>
          <section className="rounded-200 border-border-subtle bg-background-default flex flex-col gap-200 border p-300">
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
              {myMentorProfile.summary}
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
          </section>
          {memberId ? (
            <MentorManagementWorkspace
              memberId={memberId}
              mentor={myMentorProfile}
            />
          ) : null}
        </>
      ) : (
        <section className="rounded-200 border-border-subtle bg-background-default flex min-h-[420px] flex-col items-center justify-center border px-300 py-500 text-center">
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
        </section>
      )}

      <MentoringGuideModal open={isGuideOpen} onOpenChange={setIsGuideOpen} />
    </div>
  );
}
