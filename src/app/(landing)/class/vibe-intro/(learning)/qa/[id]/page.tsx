'use client';

import {
  ArrowLeft,
  Heart,
  HelpCircle,
  MoreVertical,
  Plus,
  ThumbsDown,
  ThumbsUp,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useRef, useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import MarkdownEditor from '@/components/common/ui/editor/markdown-editor';
import { uploadCommunityMarkdownImage } from '@/features/community/model/community-markdown-image-upload';
import {
  useCreateLessonQnaAnswer,
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

function GradeBadge({ role }: { role: string }) {
  const letter = role.charAt(0).toUpperCase();
  return (
    <div className="flex h-350 w-350 shrink-0 items-center justify-center rounded-full bg-rose-100 font-designer-14b text-rose-500">
      {letter}
    </div>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

function HtmlContent({ html }: { html: string }) {
  return (
    <div className="tiptap-editor">
      <div
        className="tiptap font-designer-16r leading-relaxed text-gray-800"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

type MenuTarget = 'question' | number;

export default function QnaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const qnaId = parseInt(id, 10);
  const router = useRouter();
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
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [newAnswer, setNewAnswer] = useState('');
  const [answerImages, setAnswerImages] = useState<
    { previewUrl: string; key: string }[]
  >([]);
  const [isUploadingAnswerImage, setIsUploadingAnswerImage] = useState(false);
  const answerImageInputRef = useRef<HTMLInputElement>(null);

  const reactQna = useReactLessonQna();
  const reactAnswer = useReactLessonQnaAnswer();
  const updateQna = useUpdateLessonQna();
  const deleteQna = useDeleteLessonQna();
  const updateAnswer = useUpdateLessonQnaAnswer();
  const deleteAnswer = useDeleteLessonQnaAnswer();
  const reportQna = useReportLessonQna();
  const createAnswer = useCreateLessonQnaAnswer();

  function toggleQReaction(type: 'USEFUL' | 'CURIOUS') {
    if (!qna) return;
    setQReactions((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
    reactQna.mutate(
      { qnaId: qna.qnaId, request: { reactionType: type } },
      {
        onSuccess: (result) => {
          setQReactions((prev) => {
            const next = new Set(prev);
            if (result.isActive) next.add(result.reactionType);
            else next.delete(result.reactionType);
            return next;
          });
        },
      },
    );
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
          router.push('/class/vibe-intro/qa');
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

  async function handleAnswerImageAdd(file: File) {
    if (answerImages.length >= 10) {
      showToast('최대 10장까지 첨부 가능합니다.', 'error');
      return;
    }
    setIsUploadingAnswerImage(true);
    try {
      const publicUrl = await uploadCommunityMarkdownImage(file);
      const key = new URL(publicUrl).pathname.slice(1);
      const previewUrl = URL.createObjectURL(file);
      setAnswerImages((prev) => [...prev, { previewUrl, key }]);
    } catch {
      showToast('이미지 업로드에 실패했습니다.', 'error');
    } finally {
      setIsUploadingAnswerImage(false);
    }
  }

  function handleAnswerImageRemove(index: number) {
    setAnswerImages((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].previewUrl);
      next.splice(index, 1);
      return next;
    });
  }

  function handleSubmitAnswer() {
    if (!qna) return;
    if (!newAnswer.replace(/<[^>]*>/g, '').trim()) {
      showToast('답변 내용을 입력해주세요.', 'error');
      return;
    }
    createAnswer.mutate(
      {
        qnaId: qna.qnaId,
        request: {
          content: newAnswer,
          imageKeys: answerImages.map((img) => img.key),
        },
      },
      {
        onSuccess: () => {
          showToast('답변이 등록되었어요!');
          setShowAnswerForm(false);
          setNewAnswer('');
          answerImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
          setAnswerImages([]);
        },
        onError: (error) => {
          const { userMessage } = analyzeError(error);
          showToast(userMessage, 'error');
        },
      },
    );
  }

  return (
    <div className="mx-auto w-full max-w-page px-600 py-750">
      <Link
        href="/class/vibe-intro/qa"
        className="inline-flex items-center gap-125 font-designer-14m text-gray-800"
      >
        <ArrowLeft className="h-300 w-300" />
        질문답변 목록
      </Link>

      <div className="mt-400">
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
              {/* Title row with menu */}
              <div className="mb-200 flex items-start justify-between gap-200">
                <h3 className="font-designer-20b">
                  <span className="text-rose-500">Q.</span>{' '}
                  <span className="text-gray-800">{stripHtml(qna.title)}</span>
                </h3>
                {/* ⋮ menu */}
                {(qna.canEdit || qna.canDelete || qna.canReport) && (
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setMenuOpen(menuOpen === 'question' ? null : 'question')
                      }
                      className="text-gray-400 hover:text-gray-800"
                    >
                      <MoreVertical className="h-250 w-250" />
                    </button>
                    {menuOpen === 'question' && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setMenuOpen(null)}
                        />
                        <div className="absolute right-0 top-full z-20 mt-75 rounded-100 border border-border-subtle bg-background-default shadow-1">
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
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Essential info row */}
              <div className="mb-300 flex items-center gap-150">
                <div className="flex items-center gap-100">
                  <div className="flex h-350 w-350 shrink-0 items-center justify-center rounded-full bg-gray-200">
                    <p className="font-designer-12r text-gray-600">
                      {qna.author.nickname.charAt(0)}
                    </p>
                  </div>
                  <p className="font-designer-14b text-gray-800">
                    {qna.author.nickname}
                  </p>
                  <GradeBadge role={qna.author.role} />
                </div>
                <p className="font-designer-14r text-gray-400">
                  {formatDate(qna.createdAt)} 작성
                </p>
                <p className="font-designer-14r text-gray-400">
                  조회 {qna.viewCount}
                </p>
              </div>

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
                            {formatDate(answer.createdAt)} 작성
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
                                <>
                                  <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setMenuOpen(null)}
                                  />
                                  <div className="absolute right-0 top-full z-20 mt-75 rounded-100 border border-border-subtle bg-background-default shadow-1">
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
                                </>
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
                                {updateAnswer.isPending ? '저장 중...' : '저장'}
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
                                {deleteAnswer.isPending ? '삭제 중...' : '삭제'}
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

            {/* Answer creation form — shown when 답변하기 button clicked */}
            {showAnswerForm && (
              <div className="border-t border-border-subtle pt-500">
                <p className="mb-400 font-designer-16b text-gray-800">
                  답변하기
                </p>
                <div className="space-y-400">
                  <MarkdownEditor
                    value={newAnswer}
                    onChange={setNewAnswer}
                    placeholder="답변을 기다리고 있습니다."
                    uploadImage={uploadCommunityMarkdownImage}
                  />
                  <div className="space-y-250">
                    <p className="font-designer-16b text-gray-800">
                      이미지 첨부하기
                    </p>
                    <div className="flex flex-wrap gap-150">
                      {answerImages.map((img, i) => (
                        <div
                          key={img.key}
                          className="relative h-1625 w-1625 shrink-0"
                        >
                          <Image
                            src={img.previewUrl}
                            alt={`첨부 이미지 ${i + 1}`}
                            fill
                            unoptimized
                            className="rounded-150 object-cover"
                          />
                          <button
                            type="button"
                            aria-label={`이미지 ${i + 1} 삭제`}
                            onClick={() => handleAnswerImageRemove(i)}
                            className="absolute -right-75 -top-75 flex h-200 w-200 items-center justify-center rounded-full bg-gray-800 text-background-default"
                          >
                            <X className="h-125 w-125" />
                          </button>
                        </div>
                      ))}
                      {answerImages.length < 10 && (
                        <button
                          type="button"
                          disabled={isUploadingAnswerImage}
                          onClick={() => answerImageInputRef.current?.click()}
                          className={cn(
                            'flex h-1625 w-1625 shrink-0 flex-col items-center justify-center rounded-150 border border-border-default bg-gray-200',
                            isUploadingAnswerImage
                              ? 'cursor-not-allowed opacity-50'
                              : 'hover:border-rose-400',
                          )}
                        >
                          <Plus className="h-300 w-300 text-gray-400" />
                        </button>
                      )}
                    </div>
                    <p className="font-designer-14r text-gray-500">
                      * 최대 10개의 사진을 등록할 수 있어요. / 10MB 이하의
                      파일만 등록할 수 있어요.
                    </p>
                    <input
                      ref={answerImageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const target = e.target;
                        const file = target.files?.[0];
                        if (file) await handleAnswerImageAdd(file);
                        target.value = '';
                      }}
                    />
                  </div>
                  <div className="border-t border-border-subtle" />
                  <div className="flex gap-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAnswerForm(false);
                        setNewAnswer('');
                        answerImages.forEach((img) =>
                          URL.revokeObjectURL(img.previewUrl),
                        );
                        setAnswerImages([]);
                      }}
                      className="flex h-700 flex-1 items-center justify-center rounded-100 border border-background-brand-default font-designer-16b text-text-brand"
                    >
                      임시저장
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitAnswer}
                      disabled={createAnswer.isPending}
                      className="flex h-700 flex-1 items-center justify-center rounded-100 bg-background-brand-default font-designer-16b text-text-inverse disabled:opacity-50"
                    >
                      {createAnswer.isPending ? '등록 중...' : '등록하기'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating 답변하기 button — always visible regardless of answer count */}
      <div className="fixed bottom-400 left-1/2 z-50 -translate-x-1/2">
        <button
          type="button"
          onClick={() => setShowAnswerForm((prev) => !prev)}
          className="flex h-875 w-4500 items-center justify-center rounded-full bg-background-brand-default font-designer-24m text-text-inverse shadow-3"
        >
          답변하기
        </button>
      </div>
    </div>
  );
}
