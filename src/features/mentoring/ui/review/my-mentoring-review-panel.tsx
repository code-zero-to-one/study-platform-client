'use client';

import dayjs from 'dayjs';
import { CalendarCheck2, Star } from 'lucide-react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import {
  MIN_MY_MENTORING_REVIEW_LENGTH,
  type ReviewCardStatus,
  useMyMentoringReviewController,
} from '@/features/mentoring/model/use-my-mentoring-review-controller';
import MentoringSectionTemplate from '@/features/mentoring/ui/common/mentoring-section-template';
import { getMethodLabel } from '@/mocks/mentoring-mock-data';
import type {
  MentoringRequest,
  MentoringReviewRecommendation,
  MentoringSession,
} from '@/types/mentoring/management-domain';

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

const MAX_REVIEW_LENGTH = 300;
const REVIEW_PANEL_TEXT = {
  title: '내 멘토링 후기 관리',
  description: '완료된 멘토링에 후기를 남기면 멘토 상세 페이지에 즉시 반영됩니다.',
  emptyTitle: '아직 멘토링 신청 내역이 없습니다.',
  emptyDescription: '멘토링을 신청하고 상담이 완료되면 후기 작성이 열립니다.',
} as const;

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
  const controller = useMyMentoringReviewController();
  const { state, actions, viewModel } = controller;

  return (
    <>
      <MentoringSectionTemplate
        title={REVIEW_PANEL_TEXT.title}
        description={REVIEW_PANEL_TEXT.description}
        rightSlot={
          <div className="flex flex-wrap gap-75">
            <Badge
              color={viewModel.readyCount > 0 ? 'orange' : 'green'}
              shape="round"
            >
              작성 대기 {viewModel.readyCount}건
            </Badge>
            <Badge color="blue" shape="round">
              작성 완료 {viewModel.writtenCount}건
            </Badge>
          </div>
        }
        empty={state.items.length === 0}
        emptyContent={
          <div className="rounded-150 bg-background-alternative px-200 py-250 text-center">
            <p className="font-designer-16b text-text-default">
              {REVIEW_PANEL_TEXT.emptyTitle}
            </p>
            <p className="font-designer-13r text-text-subtle mt-50">
              {REVIEW_PANEL_TEXT.emptyDescription}
            </p>
          </div>
        }
      >
        {state.items.length > 0 ? (
          <div className="space-y-125">
            {state.items.map((item) => {
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
                    onClick={() => actions.onOpenDraft(item)}
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
        ) : null}
      </MentoringSectionTemplate>

      <Modal.Root
        open={state.isModalOpen}
        onOpenChange={actions.onModalOpenChange}
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
              {state.activeItem && (
                <>
                  <div className="rounded-100 bg-background-alternative p-150">
                    <p className="font-designer-16b text-text-default mb-50">
                      {state.activeItem.mentor?.nickname ??
                        `멘토 #${state.activeItem.request.mentorId}`}
                    </p>
                    <p className="font-designer-13r text-text-subtle">
                      {getMethodLabel(state.activeItem.request.method)} ·{' '}
                      {getSessionLabel({
                        request: state.activeItem.request,
                        session: state.activeItem.session,
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
                              score <= state.draft.rating &&
                                'border-border-brand bg-fill-brand-subtle-default',
                            )}
                            onClick={() => actions.onDraftRatingChange(score)}
                          >
                            <Star
                              className={cn(
                                'h-14 w-14',
                                score <= state.draft.rating
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
                          state.draft.recommendation === recommendation;

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
                              actions.onDraftRecommendationChange(
                                recommendation,
                              )
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
                      value={state.draft.content}
                      maxLength={MAX_REVIEW_LENGTH}
                      onChange={(event) =>
                        actions.onDraftContentChange(event.target.value)
                      }
                      className="font-designer-14r rounded-100 border-border-subtle bg-background-default text-text-default min-h-[140px] w-full border px-125 py-100"
                      placeholder="멘토링에서 좋았던 점과 개선이 필요한 점을 구체적으로 남겨주세요."
                    />
                    <div className="mt-50 flex justify-between">
                        <span className="font-designer-12r text-text-subtle">
                        최소 {MIN_MY_MENTORING_REVIEW_LENGTH}자
                      </span>
                      <span className="font-designer-12r text-text-subtle">
                        {state.draft.content.length}/{MAX_REVIEW_LENGTH}
                      </span>
                    </div>
                  </div>

                  {state.formError && (
                    <p className="font-designer-13r text-text-error">
                      {state.formError}
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
                onClick={actions.onCloseDraft}
              >
                취소
              </Button>
              <Button
                type="button"
                color="primary"
                size="small"
                disabled={viewModel.isSubmitDisabled}
                onClick={actions.onSubmit}
              >
                {state.activeItem?.review ? '후기 수정 저장' : '후기 등록하기'}
              </Button>
            </Modal.Footer>
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>
    </>
  );
}
