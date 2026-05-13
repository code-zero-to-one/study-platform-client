'use client';

import {
  Eye,
  Heart,
  HelpCircle,
  MoreVertical,
  ThumbsDown,
  ThumbsUp,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import MarkdownEditor from '@/components/common/ui/editor/markdown-editor';
import { uploadCommunityMarkdownImage } from '@/features/community/model/community-markdown-image-upload';
import {
  useDeleteLessonQna,
  useDeleteLessonQnaAnswer,
  useGetLessonQnaDetail,
  useReactLessonQna,
  useReactLessonQnaAnswer,
  useReportLessonQna,
  useUpdateLessonQna,
  useUpdateLessonQnaAnswer,
} from '@/hooks/queries/course/course-api';
import { useToastStore } from '@/stores/use-toast-store';
import { analyzeError } from '@/utils/error-handler';

interface Props {
  qnaId: number | null;
  onClose: () => void;
}

function GradeBadge({ role }: { role: string }) {
  const letter = role.charAt(0).toUpperCase();
  return (
    <div className="flex h-350 w-350 shrink-0 items-center justify-center rounded-full bg-rose-100 font-designer-14b text-rose-500">
      {letter}
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr)
    .toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .replace(/\. /g, '.')
    .replace(/\.$/, '');
}

function HtmlContent({ html }: { html: string }) {
  return (
    <div
      className="font-designer-16r leading-relaxed text-gray-800"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

type MenuTarget = 'question' | number;

export function LessonQnaDetailModal({ qnaId, onClose }: Props) {
  const { data: qna, isLoading } = useGetLessonQnaDetail(qnaId);
  const showToast = useToastStore((s) => s.showToast);

  const [menuOpen, setMenuOpen] = useState<MenuTarget | null>(null);
  const [editContent, setEditContent] = useState<string | null>(null);
  const [deleteMode, setDeleteMode] = useState<MenuTarget | null>(null);
  const [reportMode, setReportMode] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [answerEdit, setAnswerEdit] = useState<{
    answerId: number;
    content: string;
  } | null>(null);
  const [qReactions, setQReactions] = useState<Set<'USEFUL' | 'CURIOUS'>>(
    new Set(),
  );
  const [aReactions, setAReactions] = useState<
    Map<number, Set<'HELPFUL' | 'NOT_HELPFUL'>>
  >(new Map());

  const reactQna = useReactLessonQna();
  const reactAnswer = useReactLessonQnaAnswer();
  const updateQna = useUpdateLessonQna();
  const deleteQna = useDeleteLessonQna();
  const updateAnswer = useUpdateLessonQnaAnswer();
  const deleteAnswer = useDeleteLessonQnaAnswer();
  const reportQna = useReportLessonQna();

  useEffect(() => {
    if (qnaId) {
      setMenuOpen(null);
      setEditContent(null);
      setDeleteMode(null);
      setReportMode(false);
      setReportReason('');
      setAnswerEdit(null);
      setQReactions(new Set());
      setAReactions(new Map());
    }
  }, [qnaId]);

  if (qnaId === null) return null;

  function toggleQReaction(type: 'USEFUL' | 'CURIOUS') {
    if (!qna) return;
    setQReactions((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
    reactQna.mutate({ qnaId: qna.qnaId, request: { reactionType: type } });
  }

  function toggleAReaction(
    answerId: number,
    parentQnaId: number,
    type: 'HELPFUL' | 'NOT_HELPFUL',
  ) {
    setAReactions((prev) => {
      const map = new Map(prev);
      const current = new Set(map.get(answerId) ?? []);
      if (current.has(type)) {
        current.delete(type);
      } else {
        current.clear();
        current.add(type);
      }
      map.set(answerId, current);
      return map;
    });
    reactAnswer.mutate({
      answerId,
      qnaId: parentQnaId,
      request: { reactionType: type },
    });
  }

  function handleSaveEdit() {
    if (!qna || editContent === null) return;
    updateQna.mutate(
      { qnaId: qna.qnaId, request: { content: editContent } },
      {
        onSuccess: () => {
          setEditContent(null);
          showToast('수정되었습니다.');
        },
        onError: (error) => {
          const { userMessage } = analyzeError(error);
          showToast(userMessage, 'error');
        },
      },
    );
  }

  function handleDeleteQuestion() {
    if (!qna) return;
    deleteQna.mutate(
      { qnaId: qna.qnaId },
      {
        onSuccess: () => {
          showToast('삭제되었습니다.');
          onClose();
        },
        onError: (error) => {
          const { userMessage } = analyzeError(error);
          showToast(userMessage, 'error');
        },
      },
    );
  }

  function handleSaveAnswerEdit() {
    if (!answerEdit || !qna) return;
    updateAnswer.mutate(
      {
        answerId: answerEdit.answerId,
        qnaId: qna.qnaId,
        request: { content: answerEdit.content },
      },
      {
        onSuccess: () => {
          setAnswerEdit(null);
          showToast('답변이 수정되었습니다.');
        },
        onError: (error) => {
          const { userMessage } = analyzeError(error);
          showToast(userMessage, 'error');
        },
      },
    );
  }

  function handleDeleteAnswer(answerId: number) {
    if (!qna) return;
    deleteAnswer.mutate(
      { answerId, qnaId: qna.qnaId },
      {
        onSuccess: () => {
          setDeleteMode(null);
          showToast('답변이 삭제되었습니다.');
        },
        onError: (error) => {
          const { userMessage } = analyzeError(error);
          showToast(userMessage, 'error');
        },
      },
    );
  }

  function handleReport() {
    if (!qna) return;
    if (!reportReason.trim()) {
      showToast('신고 사유를 입력해주세요.', 'error');
      return;
    }
    reportQna.mutate(
      { qnaId: qna.qnaId, request: { reason: reportReason } },
      {
        onSuccess: () => {
          setReportMode(false);
          setReportReason('');
          showToast('신고가 접수되었습니다.');
        },
        onError: (error) => {
          const { userMessage } = analyzeError(error);
          showToast(userMessage, 'error');
        },
      },
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-1000/40" onClick={onClose} />
      <div className="relative z-10 mx-400 flex max-h-modal w-full max-w-10000 flex-col overflow-hidden rounded-200 bg-background-default shadow-3">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border-subtle px-400 py-300">
          <p className="font-designer-16b text-gray-800">질문 상세</p>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-800"
          >
            <X className="h-300 w-300" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-400 py-350">
          {isLoading ? (
            <div className="flex h-2500 items-center justify-center">
              <p className="font-designer-16r text-gray-400">불러오는 중...</p>
            </div>
          ) : !qna ? (
            <div className="flex h-2500 items-center justify-center">
              <p className="font-designer-16r text-gray-400">
                질문을 불러올 수 없어요.
              </p>
            </div>
          ) : (
            <div className="space-y-400">
              {/* Breadcrumb */}
              <p className="font-designer-14r text-gray-500">
                {qna.courseTitle} &gt; {qna.lessonTitle}
              </p>

              {/* Question section */}
              <div>
                {/* Author row */}
                <div className="mb-250 flex items-center gap-150">
                  <div className="flex h-400 w-400 shrink-0 items-center justify-center rounded-full bg-gray-200">
                    <p className="font-designer-14b text-gray-600">
                      {qna.author.nickname.charAt(0)}
                    </p>
                  </div>
                  <GradeBadge role={qna.author.role} />
                  <div className="flex-1">
                    <p className="font-designer-14b text-gray-800">
                      {qna.author.nickname}
                    </p>
                  </div>
                  <div className="flex items-center gap-125">
                    <div className="flex items-center gap-50">
                      <Eye className="h-200 w-200 text-gray-400" />
                      <p className="font-designer-14r text-gray-400">
                        {qna.viewCount}
                      </p>
                    </div>
                    <p className="font-designer-14r text-gray-400">
                      {formatDate(qna.createdAt)}
                    </p>
                  </div>

                  {/* ⋮ menu */}
                  {(qna.canEdit || qna.canDelete || qna.canReport) && (
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setMenuOpen(
                            menuOpen === 'question' ? null : 'question',
                          )
                        }
                        className="text-gray-400 hover:text-gray-800"
                      >
                        <MoreVertical className="h-250 w-250" />
                      </button>
                      {menuOpen === 'question' && (
                        <div className="absolute right-0 top-full z-10 mt-75 rounded-100 border border-border-subtle bg-background-default shadow-1">
                          {qna.canEdit && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditContent(qna.content);
                                setMenuOpen(null);
                              }}
                              className="flex w-full items-center whitespace-nowrap px-200 py-150 font-designer-14r text-gray-800 hover:bg-gray-100"
                            >
                              수정
                            </button>
                          )}
                          {qna.canDelete && (
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteMode('question');
                                setMenuOpen(null);
                              }}
                              className="flex w-full items-center whitespace-nowrap px-200 py-150 font-designer-14r text-rose-500 hover:bg-gray-100"
                            >
                              삭제
                            </button>
                          )}
                          {qna.canReport && (
                            <button
                              type="button"
                              onClick={() => {
                                setReportMode(true);
                                setMenuOpen(null);
                              }}
                              className="flex w-full items-center whitespace-nowrap px-200 py-150 font-designer-14r text-gray-800 hover:bg-gray-100"
                            >
                              신고하기
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Question title */}
                <h3 className="mb-200 font-designer-20b text-gray-800">
                  Q. {qna.title}
                </h3>

                {/* Content: edit mode or view mode */}
                {editContent !== null ? (
                  <div className="space-y-200">
                    <MarkdownEditor
                      value={editContent}
                      onChange={setEditContent}
                      placeholder="내용을 수정해주세요."
                      uploadImage={uploadCommunityMarkdownImage}
                    />
                    <div className="flex justify-end gap-150">
                      <button
                        type="button"
                        onClick={() => setEditContent(null)}
                        className="rounded-100 border border-border-default px-300 py-150 font-designer-14m text-gray-600 hover:bg-gray-100"
                      >
                        취소
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        disabled={updateQna.isPending}
                        className="rounded-100 bg-rose-500 px-300 py-150 font-designer-14m text-text-inverse hover:opacity-90 disabled:opacity-50"
                      >
                        {updateQna.isPending ? '저장 중...' : '저장'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <HtmlContent html={qna.content} />
                )}

                {/* Question images */}
                {qna.imageUrls.length > 0 && (
                  <div className="mt-250 flex flex-wrap gap-200">
                    {qna.imageUrls.map((url, i) => (
                      <Image
                        key={i}
                        src={url}
                        alt={`첨부 이미지 ${i + 1}`}
                        width={800}
                        height={450}
                        unoptimized
                        className="max-w-full rounded-100 object-cover"
                      />
                    ))}
                  </div>
                )}

                {/* Reaction buttons */}
                <div className="mt-300 flex gap-150">
                  <button
                    type="button"
                    onClick={() => toggleQReaction('USEFUL')}
                    className={cn(
                      'flex items-center gap-100 rounded-full border px-250 py-150 font-designer-14m transition-colors',
                      qReactions.has('USEFUL')
                        ? 'border-rose-500 text-rose-500'
                        : 'border-border-default text-gray-500 hover:border-gray-400',
                    )}
                  >
                    <Heart className="h-225 w-225" />
                    유용해요 {qna.usefulCount}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleQReaction('CURIOUS')}
                    className={cn(
                      'flex items-center gap-100 rounded-full border px-250 py-150 font-designer-14m transition-colors',
                      qReactions.has('CURIOUS')
                        ? 'border-[#02c76e] text-[#02c76e]'
                        : 'border-border-default text-gray-500 hover:border-gray-400',
                    )}
                  >
                    <HelpCircle className="h-225 w-225" />
                    나도 궁금해요 {qna.curiousCount}
                  </button>
                </div>
              </div>

              {/* Report form */}
              {reportMode && (
                <div className="space-y-200 rounded-150 border border-border-subtle bg-gray-50 p-300">
                  <p className="font-designer-14b text-gray-800">
                    신고 사유를 입력해주세요
                  </p>
                  <textarea
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="신고 사유를 상세히 작성해주세요."
                    className="h-1250 w-full resize-none rounded-100 border border-border-default p-200 font-designer-14r text-gray-800 placeholder:text-gray-400 focus:border-border-brand focus:outline-none"
                  />
                  <div className="flex justify-end gap-150">
                    <button
                      type="button"
                      onClick={() => {
                        setReportMode(false);
                        setReportReason('');
                      }}
                      className="rounded-100 border border-border-default px-300 py-150 font-designer-14m text-gray-600 hover:bg-gray-100"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={handleReport}
                      disabled={reportQna.isPending}
                      className="rounded-100 bg-rose-500 px-300 py-150 font-designer-14m text-text-inverse hover:opacity-90 disabled:opacity-50"
                    >
                      {reportQna.isPending ? '신고 중...' : '신고하기'}
                    </button>
                  </div>
                </div>
              )}

              {/* Delete confirm for question */}
              {deleteMode === 'question' && (
                <div className="space-y-200 rounded-150 border border-rose-200 bg-rose-50 p-300">
                  <p className="font-designer-14b text-gray-800">
                    정말 삭제하시겠어요?
                  </p>
                  <p className="font-designer-14r text-gray-500">
                    삭제 후에는 복구할 수 없어요.
                  </p>
                  <div className="flex justify-end gap-150">
                    <button
                      type="button"
                      onClick={() => setDeleteMode(null)}
                      className="rounded-100 border border-border-default px-300 py-150 font-designer-14m text-gray-600 hover:bg-gray-100"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteQuestion}
                      disabled={deleteQna.isPending}
                      className="rounded-100 bg-rose-500 px-300 py-150 font-designer-14m text-text-inverse hover:opacity-90 disabled:opacity-50"
                    >
                      {deleteQna.isPending ? '삭제 중...' : '삭제'}
                    </button>
                  </div>
                </div>
              )}

              {/* Answers section */}
              <div className="border-t border-border-subtle pt-400">
                <p className="mb-300 font-designer-16b text-gray-800">
                  A.{' '}
                  {qna.answers.length === 0
                    ? '답변 대기 중'
                    : `${qna.answers.length}개의 답변이 있어요`}
                </p>

                {qna.answers.length === 0 ? (
                  <p className="text-center font-designer-14r text-gray-400">
                    아직 답변이 없어요. 빠르게 답변 드릴게요!
                  </p>
                ) : (
                  <div className="space-y-350">
                    {qna.answers.map((answer) => {
                      const myAReaction = aReactions.get(answer.answerId);
                      const isEditingThis =
                        answerEdit !== null &&
                        answerEdit.answerId === answer.answerId;
                      const isDeletingThis = deleteMode === answer.answerId;

                      return (
                        <div
                          key={answer.answerId}
                          className="space-y-250 rounded-150 border border-border-subtle p-300"
                        >
                          {/* Answerer row */}
                          <div className="flex items-center gap-150">
                            <div className="flex h-400 w-400 shrink-0 items-center justify-center rounded-full bg-gray-200">
                              <p className="font-designer-14b text-gray-600">
                                {answer.author.nickname.charAt(0)}
                              </p>
                            </div>
                            <GradeBadge role={answer.author.role} />
                            <div className="flex-1">
                              <p className="font-designer-14b text-gray-800">
                                {answer.author.nickname}
                              </p>
                            </div>
                            <p className="font-designer-14r text-gray-400">
                              {formatDate(answer.createdAt)}
                            </p>
                            {/* Answer ⋮ */}
                            {(answer.canEdit || answer.canDelete) && (
                              <div className="relative shrink-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setMenuOpen(
                                      menuOpen === answer.answerId
                                        ? null
                                        : answer.answerId,
                                    )
                                  }
                                  className="text-gray-400 hover:text-gray-800"
                                >
                                  <MoreVertical className="h-250 w-250" />
                                </button>
                                {menuOpen === answer.answerId && (
                                  <div className="absolute right-0 top-full z-10 mt-75 rounded-100 border border-border-subtle bg-background-default shadow-1">
                                    {answer.canEdit && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setAnswerEdit({
                                            answerId: answer.answerId,
                                            content: answer.content,
                                          });
                                          setMenuOpen(null);
                                        }}
                                        className="flex w-full items-center whitespace-nowrap px-200 py-150 font-designer-14r text-gray-800 hover:bg-gray-100"
                                      >
                                        수정
                                      </button>
                                    )}
                                    {answer.canDelete && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setDeleteMode(answer.answerId);
                                          setMenuOpen(null);
                                        }}
                                        className="flex w-full items-center whitespace-nowrap px-200 py-150 font-designer-14r text-rose-500 hover:bg-gray-100"
                                      >
                                        삭제
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Answer content */}
                          {isEditingThis && answerEdit !== null ? (
                            <div className="space-y-200">
                              <MarkdownEditor
                                value={answerEdit.content}
                                onChange={(v) =>
                                  setAnswerEdit((prev) =>
                                    prev ? { ...prev, content: v } : null,
                                  )
                                }
                                placeholder="답변을 수정해주세요."
                                uploadImage={uploadCommunityMarkdownImage}
                              />
                              <div className="flex justify-end gap-150">
                                <button
                                  type="button"
                                  onClick={() => setAnswerEdit(null)}
                                  className="rounded-100 border border-border-default px-300 py-150 font-designer-14m text-gray-600 hover:bg-gray-100"
                                >
                                  취소
                                </button>
                                <button
                                  type="button"
                                  onClick={handleSaveAnswerEdit}
                                  disabled={updateAnswer.isPending}
                                  className="rounded-100 bg-rose-500 px-300 py-150 font-designer-14m text-text-inverse hover:opacity-90 disabled:opacity-50"
                                >
                                  {updateAnswer.isPending
                                    ? '저장 중...'
                                    : '저장'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <HtmlContent html={answer.content} />
                          )}

                          {/* Answer images */}
                          {answer.imageUrls.length > 0 && (
                            <div className="flex flex-wrap gap-200">
                              {answer.imageUrls.map((url, i) => (
                                <Image
                                  key={i}
                                  src={url}
                                  alt={`답변 이미지 ${i + 1}`}
                                  width={800}
                                  height={450}
                                  unoptimized
                                  className="max-w-full rounded-100 object-cover"
                                />
                              ))}
                            </div>
                          )}

                          {/* Answer delete confirm */}
                          {isDeletingThis && (
                            <div className="space-y-150 rounded-100 border border-rose-200 bg-rose-50 p-200">
                              <p className="font-designer-14b text-gray-800">
                                이 답변을 삭제하시겠어요?
                              </p>
                              <div className="flex justify-end gap-125">
                                <button
                                  type="button"
                                  onClick={() => setDeleteMode(null)}
                                  className="rounded-100 border border-border-default px-250 py-100 font-designer-14m text-gray-600 hover:bg-gray-100"
                                >
                                  취소
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteAnswer(answer.answerId)
                                  }
                                  disabled={deleteAnswer.isPending}
                                  className="rounded-100 bg-rose-500 px-250 py-100 font-designer-14m text-text-inverse hover:opacity-90 disabled:opacity-50"
                                >
                                  {deleteAnswer.isPending
                                    ? '삭제 중...'
                                    : '삭제'}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Answer reactions */}
                          <div className="flex gap-150">
                            <button
                              type="button"
                              onClick={() =>
                                toggleAReaction(
                                  answer.answerId,
                                  qna.qnaId,
                                  'HELPFUL',
                                )
                              }
                              className={cn(
                                'flex items-center gap-100 rounded-full border px-250 py-150 font-designer-13m transition-colors',
                                myAReaction?.has('HELPFUL')
                                  ? 'border-rose-500 text-rose-500'
                                  : 'border-border-default text-gray-500 hover:border-gray-400',
                              )}
                            >
                              <ThumbsUp className="h-200 w-200" />
                              도움돼요 {answer.helpfulCount}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                toggleAReaction(
                                  answer.answerId,
                                  qna.qnaId,
                                  'NOT_HELPFUL',
                                )
                              }
                              className={cn(
                                'flex items-center gap-100 rounded-full border px-250 py-150 font-designer-13m transition-colors',
                                myAReaction?.has('NOT_HELPFUL')
                                  ? 'border-gray-800 text-gray-800'
                                  : 'border-border-default text-gray-500 hover:border-gray-400',
                              )}
                            >
                              <ThumbsDown className="h-200 w-200" />
                              도움안돼요 {answer.notHelpfulCount}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
