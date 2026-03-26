'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import StudyCard from '@/components/card/study-card';
import { useAuthReady } from '@/features/auth/model/use-auth';
import { useGetStudies } from '@/hooks/queries/study-query';
import { useMemberStudyListQuery } from '@/hooks/queries/use-member-study-list-query';
import { hashValue } from '@/utils/hash';

interface MyParticipatingStudiesSectionProps {
  classification: 'GROUP_STUDY' | 'PREMIUM_STUDY';
}

const CLASSIFICATION_TO_STUDY_TYPE = {
  GROUP_STUDY: 'GROUP_STUDY',
  PREMIUM_STUDY: 'PREMIUM_STUDY',
} as const;

export default function MyParticipatingStudiesSection({
  classification,
}: MyParticipatingStudiesSectionProps) {
  const { memberId } = useAuthReady();

  /**
   * TODO: 성능 최적화 필요
   *
   * '참여중인 스터디 목록' 과 '전체 스터디 목록' 의 데이터타입이 맞지 않아,
   * 현재 구현은 '참여중인 스터디 목록' ID set 을 만들고, 모든 '전체 스터디 목록'을 가져온 후 클라이언트에서 필터링하는 방식.
   *
   * 개선 방안:
   * 1. 백엔드 API 개선: 스터디 ID 리스트를 받아서 해당 스터디만 반환하는 API
   *    GET /api/v1/group-studies/by-ids?ids=1,2,3&classification=GROUP_STUDY
   *
   * 2. 내 스터디 API 개선: getMemberStudyList에서 카드에 필요한 정보를 모두 반환
   *
   */

  // 내가 참여중인 스터디 ID 목록만 가져오기
  // React Hooks 규칙: hooks는 항상 같은 순서로 호출되어야 하므로 early return 전에 호출
  // memberId가 없으면 enabled: false로 설정하여 실제 API 호출은 하지 않음
  const { data: myStudiesData } = useMemberStudyListQuery({
    memberId: memberId ?? 0,
    studyType:
      classification === 'PREMIUM_STUDY' ? 'MENTOR_STUDY' : classification,
    studyStatus: 'NOT_COMPLETED', // 진행 중과 모집 중 모두 포함
    inProgressPage: 1,
    inProgressPageSize: 100, // 충분히 많이 가져오기
    completedPage: 1,
    completedPageSize: 1,
  });

  // 일반 스터디 목록 가져오기 (카드에 필요한 완전한 정보를 위해)
  const { data: allStudiesData, isLoading } = useGetStudies({
    classification,
    page: 1,
    pageSize: 100, // 충분히 많이 가져와서 필터링
    recruiting: undefined, // 모든 상태 포함 (진행 중, 모집 중 모두)
  });

  // 내가 참여중인 스터디 ID Set 생성 (IN_PROGRESS, RECRUITING)
  const participatingStudyIds = useMemo(() => {
    if (!myStudiesData?.notCompleted?.content) return new Set<number>();

    const studyType = CLASSIFICATION_TO_STUDY_TYPE[classification];

    const filtered = myStudiesData.notCompleted.content.filter(
      (study) =>
        (study.status === 'IN_PROGRESS' || study.status === 'RECRUITING') &&
        study.type === studyType,
    );

    return new Set(filtered.map((study) => study.studyId));
  }, [myStudiesData?.notCompleted?.content, classification]);

  // 내가 참여중인 스터디만 필터링 (최대 3개)
  const participatingStudies = useMemo(() => {
    if (!allStudiesData?.content || participatingStudyIds.size === 0) {
      return [];
    }

    // 내가 참여중인 스터디 ID에 해당하는 스터디만 필터링
    const filtered = allStudiesData.content.filter((study) =>
      participatingStudyIds.has(study.basicInfo?.groupStudyId ?? 0),
    );

    return filtered.slice(0, 3); // 최대 3개만 표시
  }, [allStudiesData?.content, participatingStudyIds]);

  // 비회원은 표시하지 않음 (hooks 호출 후 early return)
  if (!memberId) {
    return null;
  }

  // 로딩 중
  if (isLoading) {
    return (
      <section className="mb-600">
        <div className="mb-400 flex items-center justify-between">
          <h2 className="font-designer-24b text-text-default">
            내가 참여중인 스터디
          </h2>
        </div>
        <div className="flex h-[400px] items-center justify-center">
          <span className="text-text-subtle">로딩 중...</span>
        </div>
      </section>
    );
  }

  // 스터디가 없는 경우 빈 상태 표시
  if (participatingStudies.length === 0 && !isLoading) {
    return (
      <section className="mb-600">
        <div className="mb-400 flex items-center justify-between">
          <h2 className="font-designer-24b text-text-default">
            나의 소중한 스터디
          </h2>
        </div>
        <div className="bg-background-alternative rounded-150 flex min-h-[400px] flex-col items-center justify-center gap-300 border border-[#E5E7EB] py-200">
          <Image
            src="/icons/empty-study-case.svg"
            alt="참여중인 스터디가 없습니다."
            width={88}
            height={88}
          />
          <div className="flex flex-col items-center justify-center gap-100">
            <span className="text-text-subtle font-designer-20b">
              참여하는 스터디가 없습니다.
            </span>
            <span className="text-text-subtlest font-designer-16r">
              원하는 주제로 스터디에 참여해 성장 파티를 시작해보세요.
            </span>
          </div>
        </div>
      </section>
    );
  }

  // 전체보기 링크 표시 여부 (3개 이상이거나 더 많은 스터디가 있을 경우)
  const hasMoreStudies =
    participatingStudyIds.size > participatingStudies.length;

  const handleStudyClick = (studyId: number, title: string) => {
    sendGTMEvent({
      event:
        classification === 'GROUP_STUDY'
          ? 'group_study_detail_view'
          : 'premium_study_detail_view',
      dl_timestamp: new Date().toISOString(),
      dl_member_id: hashValue(String(memberId)),
      dl_study_id: String(studyId),
      dl_study_title: title,
    });
  };

  return (
    <section className="mb-600">
      <div className="mb-400 flex items-center justify-between">
        <h2 className="font-designer-24b text-text-default">
          나의 소중한 스터디
        </h2>
        {hasMoreStudies && (
          <Link
            href="/my-study/not-completed"
            className="text-text-brand font-designer-14m hover:underline"
          >
            전체보기
          </Link>
        )}
      </div>

      <div className="grid grid-cols-3 gap-300">
        {participatingStudies.map((study) => {
          const studyId = study.basicInfo?.groupStudyId ?? 0;
          const title = study.simpleDetailInfo?.title ?? '';

          return (
            <StudyCard
              key={studyId}
              study={study}
              href={
                classification === 'GROUP_STUDY'
                  ? `/group-study/${studyId}`
                  : `/premium-study/${studyId}`
              }
              onClick={() => handleStudyClick(studyId, title)}
            />
          );
        })}
      </div>
    </section>
  );
}
