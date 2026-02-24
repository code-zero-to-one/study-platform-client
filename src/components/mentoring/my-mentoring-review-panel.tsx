'use client';

import dayjs from 'dayjs';
import { CalendarCheck2, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useMentorDirectoryQuery } from '@/features/mentoring/model/use-mentor-directory-query';
import { useAuthReady } from '@/hooks/common/use-auth';
import {
  getMethodLabel,
} from '@/mocks/mentoring-mock-data';
import { useToastStore } from '@/stores/use-toast-store';
import {
  getRequestReviewEligibility,
  useMentoringManagementStore,
} from '@/stores/useMentoringManagementStore';
import type { MentorProfile } from '@/types/mentoring-domain';
import type {
  MentoringRequest,
  MentoringReview,
  MentoringReviewRecommendation,
  MentoringSession,
} from '@/types/mentoring-management';

type ReviewCardStatus = 'READY' | 'WRITTEN' | 'LOCKED';

interface ReviewCardItem {
  mentor: MentorProfile | undefined;
  request: MentoringRequest;
  session?: MentoringSession;
  review?: MentoringReview;
  status: ReviewCardStatus;
  blockedReason?: string;
}

interface ReviewDraft {
  rating: number;
  recommendation: MentoringReviewRecommendation;
  content: string;
}

const recommendationMeta: Record<
  MentoringReviewRecommendation,
  { title: string; description: string }
> = {
  RECOMMEND: {
    title: '추천해요',
    description: '주변에 소개할 만큼 만족스러운 멘토링이었어요.',
  },
  NOT_RECOMMEND: {
    title: '개선이 필요해요',
    description: '운영/품질 개선이 필요한 점이 있었어요.',
  },
};

const statusMeta: Record<
  ReviewCardStatus,
  { badgeColor: 'green' | 'orange' | 'gray'; badgeLabel: string }
> = {
  READY: {
    badgeColor: 'orange',
    badgeLabel: '작성 대기',
  },
  WRITTEN: {
    badgeColor: 'green',
    badgeLabel: '작성 완료',
  },
  LOCKED: {
    badgeColor: 'gray',
    badgeLabel: '작성 불가',
  },
};

const statusOrder: Record<ReviewCardStatus, number> = {
  READY: 0,
  WRITTEN: 1,
  LOCKED: 2,
};

const MIN_REVIEW_LENGTH = 10;
const MAX_REVIEW_LENGTH = 300;

const createDefaultDraft = (): ReviewDraft => {
  return {
    rating: 0,
    recommendation: 'RECOMMEND',
    content: '',
  };
};

const getSessionLabel = ({
  request,
  session,
}: {
  request: MentoringRequest;
  session?: MentoringSession;
}) => {
  if (request.method === 'note') {
    return '비동기 쪽지상담';
  }

  if (session) {
    return `${dayjs(session.startsAt).format('YYYY.MM.DD HH:mm')} ~ ${dayjs(
      session.endsAt,
    ).format('HH:mm')}`;
  }

  if (request.preferredDate && request.preferredTime) {
    return `희망 일정 ${request.preferredDate} ${request.preferredTime}`;
  }

  if (request.preferredDate) {
    return `희망 일정 ${request.preferredDate}`;
  }

  return '멘토와 일정 조율 중';
};

export default function MyMentoringReviewPanel() {
  const { memberId } = useAuthReady();
  const { mentors } = useMentorDirectoryQuery();
  const { showToast } = useToastStore();
  const requestsByMentor = useMentoringManagementStore(
    (state) => state.requestsByMentor,
  );
  const sessionsByMentor = useMentoringManagementStore(
    (state) => state.sessionsByMentor,
  );
  const reviewsByMentor = useMentoringManagementStore(
    (state) => state.reviewsByMentor,
  );
  const submitReview = useMentoringManagementStore(
    (state) => state.submitReview,
  );

  const [activeDraftKey, setActiveDraftKey] = useState<{
    mentorId: number;
    requestId: string;
  } | null>(null);
  const [draft, setDraft] = useState<ReviewDraft>(createDefaultDraft());
  const [formError, setFormError] = useState('');

  const mentorMap = useMemo(() => {
    return new Map<number, MentorProfile>(
      mentors.map((mentor) => [mentor.id, mentor]),
    );
  }, [mentors]);

  const items = useMemo(() => {
    if (!memberId) {
      return [] as ReviewCardItem[];
    }

    return Object.entries(requestsByMentor)
      .flatMap(([mentorIdKey, requests]) => {
        const mentorId = Number(mentorIdKey);
        const mentor = mentorMap.get(mentorId);
        const sessions = sessionsByMentor[mentorId] ?? [];
        const reviews = reviewsByMentor[mentorId] ?? [];

        return requests
          .filter((request) => request.menteeMemberId === memberId)
          .map((request) => {
            const linkedSession = request.linkedSessionId
              ? sessions.find(
                  (session) => session.id === request.linkedSessionId,
                )
              : undefined;
            const linkedReview = reviews.find((review) => {
              return (
                review.requestId === request.id &&
                review.menteeMemberId === memberId
              );
            });
            const eligibility = getRequestReviewEligibility({
              request,
              session: linkedSession,
            });
            const status: ReviewCardStatus = linkedReview
              ? 'WRITTEN'
              : eligibility.canReview
                ? 'READY'
                : 'LOCKED';

            return {
              mentor,
              request,
              session: linkedSession,
              review: linkedReview,
              status,
              blockedReason: eligibility.reason,
            } satisfies ReviewCardItem;
          });
      })
      .sort((first, second) => {
        const byStatus = statusOrder[first.status] - statusOrder[second.status];
        if (byStatus !== 0) {
          return byStatus;
        }

        return (
          dayjs(second.request.requestedAt).valueOf() -
          dayjs(first.request.requestedAt).valueOf()
        );
      });
  }, [
    memberId,
    mentorMap,
    requestsByMentor,
    reviewsByMentor,
    sessionsByMentor,
  ]);

  const readyCount = useMemo(() => {
    return items.filter((item) => item.status === 'READY').length;
  }, [items]);
  const writtenCount = useMemo(() => {
    return items.filter((item) => item.status === 'WRITTEN').length;
  }, [items]);

  const activeItem = useMemo(() => {
    if (!activeDraftKey) {
      return undefined;
    }

    return items.find((item) => {
      return (
        item.request.mentorId === activeDraftKey.mentorId &&
        item.request.id === activeDraftKey.requestId
      );
    });
  }, [activeDraftKey, items]);

  useEffect(() => {
    if (!activeItem) {
      setDraft(createDefaultDraft());
      setFormError('');

      return;
    }

    if (activeItem.review) {
      setDraft({
        rating: activeItem.review.rating,
        recommendation: activeItem.review.recommendation,
        content: activeItem.review.content,
      });
    } else {
      setDraft(createDefaultDraft());
    }
    setFormError('');
  }, [activeItem]);

  const handleOpenDraft = (item: ReviewCardItem) => {
    if (item.status === 'LOCKED') {
      return;
    }

    setActiveDraftKey({
      mentorId: item.request.mentorId,
      requestId: item.request.id,
    });
  };

  const handleSubmit = () => {
    if (!activeItem || !memberId) {
      return;
    }

    const result = submitReview({
      mentorId: activeItem.request.mentorId,
      requestId: activeItem.request.id,
      menteeMemberId: memberId,
      menteeName: activeItem.request.menteeName,
      rating: draft.rating,
      recommendation: draft.recommendation,
      content: draft.content,
    });

    if (!result.ok) {
      const reason = result.reason ?? '후기 등록에 실패했습니다.';
      setFormError(reason);
      showToast(reason, 'error');

      return;
    }

    showToast(
      result.isUpdated ? '후기를 수정했습니다.' : '후기를 등록했습니다.',
      'success',
    );
    setActiveDraftKey(null);
  };

  return (
    <>
      <section className="rounded-200 border-border-subtle bg-background-default border p-300">
        <header className="mb-200 flex flex-wrap items-center justify-between gap-100">
          <div>
            <h2 className="font-designer-20b text-text-default">
              내 멘토링 후기 관리
            </h2>
            <p className="font-designer-14r text-text-subtle mt-50">
              완료된 멘토링에 후기를 남기면 멘토 상세 페이지에 즉시 반영됩니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-75">
            <Badge color={readyCount > 0 ? 'orange' : 'green'} shape="round">
              작성 대기 {readyCount}건
            </Badge>
            <Badge color="blue" shape="round">
              작성 완료 {writtenCount}건
            </Badge>
          </div>
        </header>

        {items.length === 0 ? (
          <div className="rounded-150 bg-background-alternative px-200 py-250 text-center">
            <p className="font-designer-16b text-text-default">
              아직 멘토링 신청 내역이 없습니다.
            </p>
            <p className="font-designer-13r text-text-subtle mt-50">
              멘토링을 신청하고 상담이 완료되면 후기 작성이 열립니다.
            </p>
          </div>
        ) : (
          <div className="space-y-125">
            {items.map((item) => {
              const meta = statusMeta[item.status];
              const scheduleLabel = getSessionLabel({
                request: item.request,
                session: item.session,
              });
              const canOpenDraft = item.status !== 'LOCKED';

              return (
                <article
                  key={item.request.id}
                  className="rounded-150 border-border-subtle border p-200"
                >
                  <div className="mb-125 flex flex-wrap items-center justify-between gap-100">
                    <div className="flex items-center gap-75">
                      <p className="font-designer-16b text-text-default">
                        {item.mentor?.nickname ??
                          `멘토 #${item.request.mentorId}`}
                      </p>
                      <Badge color="gray" shape="round">
                        {getMethodLabel(item.request.method)}
                      </Badge>
                    </div>
                    <Badge color={meta.badgeColor} shape="round">
                      {meta.badgeLabel}
                    </Badge>
                  </div>

                  <div className="mb-125 space-y-50">
                    <p className="font-designer-13r text-text-subtle">
                      신청일{' '}
                      {dayjs(item.request.requestedAt).format('YYYY.MM.DD')}
                    </p>
                    <p className="font-designer-13r text-text-subtle inline-flex items-center gap-50">
                      <CalendarCheck2 className="h-14 w-14" />
                      {scheduleLabel}
                    </p>
                  </div>

                  {item.review ? (
                    <div className="rounded-100 bg-background-alternative mb-125 p-125">
                      <div className="mb-75 flex flex-wrap items-center gap-75">
                        <div className="flex items-center gap-25">
                          {Array.from({ length: 5 }).map((_, index) => {
                            const score = index + 1;

                            return (
                              <Star
                                key={score}
                                className={cn(
                                  'h-14 w-14',
                                  score <= item.review!.rating
                                    ? 'text-text-warning fill-current'
                                    : 'text-icon-disabled fill-current',
                                )}
                              />
                            );
                          })}
                        </div>
                        <Badge
                          color={
                            item.review.recommendation === 'RECOMMEND'
                              ? 'green'
                              : 'orange'
                          }
                          shape="round"
                        >
                          {recommendationMeta[item.review.recommendation].title}
                        </Badge>
                        <span className="font-designer-12r text-text-subtle">
                          {dayjs(item.review.updatedAt).format('YYYY.MM.DD')}{' '}
                          작성
                        </span>
                      </div>
                      <p className="font-designer-13r text-text-default leading-relaxed whitespace-pre-line">
                        {item.review.content}
                      </p>
                    </div>
                  ) : (
                    <p className="font-designer-13r text-text-subtle mb-125">
                      {item.blockedReason ??
                        '상담 종료 후 후기를 작성할 수 있습니다.'}
                    </p>
                  )}

                  <Button
                    type="button"
                    size="small"
                    color={item.status === 'READY' ? 'primary' : 'secondary'}
                    disabled={!canOpenDraft}
                    onClick={() => handleOpenDraft(item)}
                  >
                    {item.status === 'READY'
                      ? '후기 작성하기'
                      : item.status === 'WRITTEN'
                        ? '후기 수정하기'
                        : '작성 가능 전'}
                  </Button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <Modal.Root
        open={!!activeItem}
        onOpenChange={(open) => {
          if (!open) {
            setActiveDraftKey(null);
          }
        }}
      >
        <Modal.Portal>
          <Modal.Overlay />
          <Modal.Content size="large">
            <Modal.Header className="border-border-default flex items-center justify-between border-b">
              <Modal.Title>멘토링 후기 작성</Modal.Title>
              <Modal.Close className="font-designer-14m text-text-subtle hover:text-text-default">
                닫기
              </Modal.Close>
            </Modal.Header>

            <Modal.Body className="space-y-200">
              {activeItem && (
                <>
                  <div className="rounded-100 bg-background-alternative p-150">
                    <p className="font-designer-16b text-text-default mb-50">
                      {activeItem.mentor?.nickname ??
                        `멘토 #${activeItem.request.mentorId}`}
                    </p>
                    <p className="font-designer-13r text-text-subtle">
                      {getMethodLabel(activeItem.request.method)} ·{' '}
                      {getSessionLabel({
                        request: activeItem.request,
                        session: activeItem.session,
                      })}
                    </p>
                  </div>

                  <div>
                    <p className="font-designer-16b text-text-default mb-100">
                      별점
                    </p>
                    <div className="flex flex-wrap gap-75">
                      {Array.from({ length: 5 }).map((_, index) => {
                        const score = index + 1;

                        return (
                          <button
                            key={score}
                            type="button"
                            className={cn(
                              'rounded-100 border-border-subtle bg-background-default inline-flex h-[44px] min-w-[56px] items-center justify-center gap-50 border px-100',
                              score <= draft.rating &&
                                'border-border-brand bg-fill-brand-subtle-default',
                            )}
                            onClick={() =>
                              setDraft((prev) => ({ ...prev, rating: score }))
                            }
                          >
                            <Star
                              className={cn(
                                'h-14 w-14',
                                score <= draft.rating
                                  ? 'text-text-warning fill-current'
                                  : 'text-icon-disabled fill-current',
                              )}
                            />
                            <span className="font-designer-13b text-text-default">
                              {score}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="font-designer-16b text-text-default mb-100">
                      추천 여부
                    </p>
                    <div className="grid grid-cols-1 gap-75 md:grid-cols-2">
                      {(
                        Object.keys(
                          recommendationMeta,
                        ) as Array<MentoringReviewRecommendation>
                      ).map((recommendation) => {
                        const selected =
                          draft.recommendation === recommendation;

                        return (
                          <button
                            key={recommendation}
                            type="button"
                            className={cn(
                              'rounded-100 border-border-subtle bg-background-default flex min-h-[84px] flex-col items-start border px-125 py-100 text-left',
                              selected &&
                                'border-border-brand bg-fill-brand-subtle-default',
                            )}
                            onClick={() =>
                              setDraft((prev) => ({
                                ...prev,
                                recommendation,
                              }))
                            }
                          >
                            <span className="font-designer-14b text-text-default">
                              {recommendationMeta[recommendation].title}
                            </span>
                            <span className="font-designer-12r text-text-subtle mt-25">
                              {recommendationMeta[recommendation].description}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="font-designer-16b text-text-default mb-100">
                      후기 내용
                    </p>
                    <textarea
                      value={draft.content}
                      maxLength={MAX_REVIEW_LENGTH}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          content: event.target.value,
                        }))
                      }
                      className="font-designer-14r rounded-100 border-border-subtle bg-background-default text-text-default min-h-[140px] w-full border px-125 py-100"
                      placeholder="멘토링에서 좋았던 점과 개선이 필요한 점을 구체적으로 남겨주세요."
                    />
                    <div className="mt-50 flex justify-between">
                      <span className="font-designer-12r text-text-subtle">
                        최소 {MIN_REVIEW_LENGTH}자
                      </span>
                      <span className="font-designer-12r text-text-subtle">
                        {draft.content.length}/{MAX_REVIEW_LENGTH}
                      </span>
                    </div>
                  </div>

                  {formError && (
                    <p className="font-designer-13r text-text-error">
                      {formError}
                    </p>
                  )}
                </>
              )}
            </Modal.Body>

            <Modal.Footer className="flex justify-end gap-75">
              <Button
                type="button"
                color="secondary"
                size="small"
                onClick={() => setActiveDraftKey(null)}
              >
                취소
              </Button>
              <Button
                type="button"
                color="primary"
                size="small"
                disabled={
                  draft.rating < 1 ||
                  draft.content.trim().length < MIN_REVIEW_LENGTH
                }
                onClick={handleSubmit}
              >
                {activeItem?.review ? '후기 수정 저장' : '후기 등록하기'}
              </Button>
            </Modal.Footer>
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>
    </>
  );
}
