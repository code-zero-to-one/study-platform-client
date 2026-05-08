'use client';

import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Badge from '@/components/common/ui/badge';
import Button from '@/components/common/ui/button';
import BorderedTextarea from '@/components/common/ui/input/bordered-textarea';
import { getAdminRetrospectivePurposeMeta } from '@/features/admin/course-management/model/admin-course-presentation';
import {
  useAdminLessonBuilderFeedsQuery,
  useAdminLessonQnaDetailQuery,
  useAdminLessonQnasQuery,
  useAdminLessonRetrospectivesQuery,
  useCreateAdminLessonQnaAnswerMutation,
  useUpdateAdminBuilderFeedCurationMutation,
} from '@/features/admin/course-management/model/use-admin-course-management-query';
import { useToastStore } from '@/stores/use-toast-store';

const formatDateTime = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const PageShell = ({
  title,
  description,
  lessonId,
  returnHref,
  children,
}: {
  title: string;
  description: string;
  lessonId: number;
  returnHref: string;
  children: React.ReactNode;
}) => (
  <main className="flex flex-col gap-200 p-200">
    <header className="flex items-start justify-between gap-200">
      <div>
        <p className="font-designer-13r text-text-subtle">레슨 #{lessonId}</p>
        <h1 className="font-designer-24b text-text-default">{title}</h1>
        <p className="font-designer-14r text-text-subtle mt-75">
          {description}
        </p>
      </div>
      <Button asChild color="outlined" size="small">
        <Link href={returnHref}>레슨 관리로 돌아가기</Link>
      </Button>
    </header>
    {children}
  </main>
);

export function AdminLessonReflectionsPageClient({
  lessonId,
  returnHref,
}: {
  lessonId: number;
  returnHref: string;
}) {
  const retrospectivesQuery = useAdminLessonRetrospectivesQuery(lessonId);
  const retrospectives = retrospectivesQuery.data?.retrospectives ?? [];

  return (
    <PageShell
      description="이해도, 제출 결과물, 텍스트 회고를 레슨별로 확인합니다."
      lessonId={lessonId}
      returnHref={returnHref}
      title="돌아보기 제출 관리"
    >
      <section className="border-border-default bg-background-default rounded-150 border p-200">
        {retrospectivesQuery.isLoading && (
          <p className="font-designer-14r text-text-subtle">
            돌아보기 제출 목록을 불러오는 중입니다.
          </p>
        )}
        {!retrospectivesQuery.isLoading && retrospectives.length === 0 && (
          <p className="font-designer-14r text-text-subtle">
            아직 제출된 돌아보기가 없습니다.
          </p>
        )}
        <div className="grid gap-125">
          {retrospectives.map((retro) => (
            <article
              key={retro.retrospectiveId}
              className="border-border-default rounded-100 border p-150"
            >
              <div className="mb-75 flex flex-wrap items-center gap-75">
                <Badge
                  color={getAdminRetrospectivePurposeMeta(retro.purpose).color}
                >
                  {getAdminRetrospectivePurposeMeta(retro.purpose).label}
                </Badge>
                <Badge color="green">이해도 {retro.understandingScore}/5</Badge>
                {retro.artifactType && (
                  <Badge color="gray">{retro.artifactType}</Badge>
                )}
                <span className="font-designer-12r text-text-subtlest">
                  {retro.nickname} · member {retro.memberId} ·{' '}
                  {formatDateTime(retro.createdAt)}
                </span>
              </div>
              {retro.artifactValue && (
                <a
                  className="font-designer-13r text-text-brand mb-75 block break-all underline"
                  href={retro.artifactValue}
                  target="_blank"
                  rel="noreferrer"
                >
                  {retro.artifactValue}
                </a>
              )}
              <p className="font-designer-14r text-text-default whitespace-pre-wrap">
                {retro.content}
              </p>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

export function AdminLessonBuilderFeedPageClient({
  lessonId,
  returnHref,
}: {
  lessonId: number;
  returnHref: string;
}) {
  const feedsQuery = useAdminLessonBuilderFeedsQuery(lessonId);
  const updateCurationMutation = useUpdateAdminBuilderFeedCurationMutation();
  const feeds = feedsQuery.data?.feeds ?? [];

  return (
    <PageShell
      description="레슨별 Builder Feed를 확인하고 operator pick/showcase 상태를 조정합니다."
      lessonId={lessonId}
      returnHref={returnHref}
      title="Builder Feed 관리"
    >
      <section className="border-border-default bg-background-default rounded-150 border p-200">
        {feedsQuery.isLoading && (
          <p className="font-designer-14r text-text-subtle">
            Builder Feed 목록을 불러오는 중입니다.
          </p>
        )}
        {!feedsQuery.isLoading && feeds.length === 0 && (
          <p className="font-designer-14r text-text-subtle">
            아직 연결된 Builder Feed가 없습니다.
          </p>
        )}
        <div className="grid gap-125">
          {feeds.map((feed) => (
            <article
              key={feed.feedId}
              className="border-border-default rounded-100 border p-150"
            >
              <div className="mb-100 flex flex-wrap items-center gap-75">
                <Badge color={feed.role === 'MANAGER' ? 'orange' : 'blue'}>
                  {feed.role}
                </Badge>
                <Badge color={feed.operatorPick ? 'green' : 'gray'}>
                  {feed.operatorPick ? 'Operator Pick ON' : 'Operator Pick OFF'}
                </Badge>
                <Badge color={feed.featured ? 'green' : 'gray'}>
                  {feed.featured
                    ? `Showcase ON #${feed.featuredOrder ?? '-'}`
                    : 'Showcase OFF'}
                </Badge>
                <span className="font-designer-12r text-text-subtlest">
                  {feed.nickname} · 좋아요 {feed.likeCount} · 댓글{' '}
                  {feed.commentCount} · {formatDateTime(feed.createdAt)}
                </span>
              </div>
              <p className="font-designer-14r text-text-default whitespace-pre-wrap">
                {feed.content}
              </p>
              {feed.imageUrls.length > 0 && (
                <div className="mt-100 flex flex-wrap gap-75">
                  {feed.imageUrls.map((url) => (
                    <a
                      key={url}
                      className="font-designer-13m text-text-brand underline"
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      이미지 열기
                    </a>
                  ))}
                </div>
              )}
              <div className="mt-125 flex gap-75">
                <Button
                  color={feed.operatorPick ? 'secondary' : 'outlined'}
                  size="xsmall"
                  loading={updateCurationMutation.isPending}
                  onClick={() =>
                    updateCurationMutation.mutate({
                      feedId: feed.feedId,
                      lessonId,
                      request: {
                        operatorPick: !feed.operatorPick,
                        featured: feed.featured,
                        featuredOrder: feed.featuredOrder,
                      },
                    })
                  }
                >
                  {feed.operatorPick
                    ? 'operator pick 해제'
                    : 'operator pick 지정'}
                </Button>
                <Button
                  color={feed.featured ? 'secondary' : 'outlined'}
                  size="xsmall"
                  loading={updateCurationMutation.isPending}
                  onClick={() =>
                    updateCurationMutation.mutate({
                      feedId: feed.feedId,
                      lessonId,
                      request: {
                        operatorPick: feed.operatorPick,
                        featured: !feed.featured,
                        featuredOrder: feed.featuredOrder ?? 1,
                      },
                    })
                  }
                >
                  {feed.featured ? 'showcase 해제' : 'showcase 지정'}
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

export function AdminLessonQnaPageClient({
  lessonId,
  returnHref,
}: {
  lessonId: number;
  returnHref: string;
}) {
  const qnasQuery = useAdminLessonQnasQuery(lessonId);
  const [selectedQnaId, setSelectedQnaId] = useState<number | undefined>();
  const [answerContent, setAnswerContent] = useState('');
  const qnaDetailQuery = useAdminLessonQnaDetailQuery(selectedQnaId);
  const createAnswerMutation = useCreateAdminLessonQnaAnswerMutation();
  const qnas = qnasQuery.data?.qnas ?? [];

  const handleSubmitAnswer = () => {
    if (!selectedQnaId) return;
    if (!answerContent.trim()) {
      useToastStore.getState().showToast('답변 내용을 입력해주세요.', 'info');
      return;
    }

    createAnswerMutation.mutate(
      { qnaId: selectedQnaId, content: answerContent.trim() },
      { onSuccess: () => setAnswerContent('') },
    );
  };

  return (
    <PageShell
      description="레슨별 질문을 확인하고 관리자 답변을 등록합니다."
      lessonId={lessonId}
      returnHref={returnHref}
      title="레슨 QnA 관리"
    >
      <section className="grid min-h-screen grid-cols-2 gap-200">
        <div className="border-border-default bg-background-default rounded-150 overflow-auto border p-200">
          <p className="font-designer-14b text-text-default mb-125">
            질문 {qnasQuery.data?.totalCount ?? 0}건
          </p>
          {qnasQuery.isLoading && (
            <p className="font-designer-14r text-text-subtle">
              QnA 목록을 불러오는 중입니다.
            </p>
          )}
          {!qnasQuery.isLoading && qnas.length === 0 && (
            <p className="font-designer-14r text-text-subtle">
              아직 등록된 질문이 없습니다.
            </p>
          )}
          <div className="grid gap-75">
            {qnas.map((qna) => (
              <button
                key={qna.qnaId}
                className={cn(
                  'border-border-default rounded-100 border p-125 text-left',
                  selectedQnaId === qna.qnaId && 'bg-fill-brand-subtle-default',
                )}
                type="button"
                onClick={() => setSelectedQnaId(qna.qnaId)}
              >
                <p className="font-designer-14b text-text-default">
                  {qna.title}
                </p>
                <p className="font-designer-12r text-text-subtlest mt-50">
                  {qna.author.nickname} · 답변 {qna.answerCount} · 조회{' '}
                  {qna.viewCount} · {formatDateTime(qna.createdAt)}
                </p>
              </button>
            ))}
          </div>
        </div>
        <div className="border-border-default bg-background-default rounded-150 overflow-auto border p-200">
          {!selectedQnaId && (
            <p className="font-designer-14r text-text-subtle">
              왼쪽에서 질문을 선택하세요.
            </p>
          )}
          {qnaDetailQuery.isLoading && (
            <p className="font-designer-14r text-text-subtle">
              질문 상세를 불러오는 중입니다.
            </p>
          )}
          {qnaDetailQuery.data && (
            <div>
              <h2 className="font-designer-20b text-text-default">
                {qnaDetailQuery.data.title}
              </h2>
              <p className="font-designer-13r text-text-subtlest mt-50">
                {qnaDetailQuery.data.author.nickname} · 조회{' '}
                {qnaDetailQuery.data.viewCount} ·{' '}
                {formatDateTime(qnaDetailQuery.data.createdAt)}
              </p>
              <p className="font-designer-14r text-text-default mt-150 whitespace-pre-wrap">
                {qnaDetailQuery.data.content}
              </p>
              <div className="mt-200 grid gap-100">
                {qnaDetailQuery.data.answers.map((answer) => (
                  <article
                    key={answer.answerId}
                    className="bg-background-alternative rounded-100 p-125"
                  >
                    <p className="font-designer-13r text-text-subtlest mb-50">
                      {answer.author.nickname} ·{' '}
                      {formatDateTime(answer.createdAt)}
                    </p>
                    <p className="font-designer-14r text-text-default whitespace-pre-wrap">
                      {answer.content}
                    </p>
                  </article>
                ))}
              </div>
              <div className="mt-200">
                <BorderedTextarea
                  value={answerContent}
                  placeholder="관리자 답변을 입력하세요."
                  onChange={(event) => setAnswerContent(event.target.value)}
                />
                <div className="mt-100 flex justify-end">
                  <Button
                    size="small"
                    loading={createAnswerMutation.isPending}
                    onClick={handleSubmitAnswer}
                  >
                    답변 등록
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
