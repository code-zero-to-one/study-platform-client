'use client';

import {
  Heart,
  HelpCircle,
  MoreVertical,
  ThumbsDown,
  ThumbsUp,
  X,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import UserAvatar from '@/components/common/ui/avatar';
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
import type {
  LessonQnaDetailAnswer,
  LessonQnaDetailResponse,
} from '@/types/api/course.types';
import { analyzeError } from '@/utils/error-handler';

const UserProfileModal = dynamic(
  () => import('@/components/common/modals/user-profile-modal'),
  { ssr: false },
);

interface Props {
  qnaId: number | null;
  onClose: () => void;
}

const ROLE_BADGE_SRC: Record<string, string> = {
  BUILDER: '/class/builder.png',
  MANAGER: '/class/manager.png',
};

function RoleBadge({ role }: { role: string }) {
  const src = ROLE_BADGE_SRC[role.toUpperCase()];
  if (!src) return null;
  return (
    <Image src={src} width={14} height={14} alt={role} className="shrink-0" />
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
  });
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

interface DeleteConfirmProps {
  label: string;
  onCancel: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

function DeleteConfirm({
  label,
  onCancel,
  onConfirm,
  isPending,
}: DeleteConfirmProps) {
  return (
    <div className="space-y-150 rounded-100 border border-rose-200 bg-rose-50 p-200">
      <p className="font-designer-14b text-gray-800">{label}</p>
      <div className="flex justify-end gap-125">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-100 border border-border-default px-250 py-100 font-designer-14m text-gray-600 hover:bg-gray-100"
        >
          취소
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isPending}
          className="rounded-100 bg-rose-500 px-250 py-100 font-designer-14m text-text-inverse hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? '삭제 중...' : '삭제'}
        </button>
      </div>
    </div>
  );
}

interface QuestionSectionProps {
  qna: LessonQnaDetailResponse;
  onDeleted: () => void;
}

function QuestionSection({ qna, onDeleted }: QuestionSectionProps) {
  const showToast = useToastStore((s) => s.showToast);

  const [menuOpen, setMenuOpen] = useState(false);
  const [editContent, setEditContent] = useState<string | null>(null);
  const [deleteMode, setDeleteMode] = useState(false);
  const [reportMode, setReportMode] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reactions, setReactions] = useState<Set<'USEFUL' | 'CURIOUS'>>(
    new Set(),
  );

  const reactQna = useReactLessonQna();
  const updateQna = useUpdateLessonQna();
  const deleteQna = useDeleteLessonQna();
  const reportQna = useReportLessonQna();

  function toggleReaction(type: 'USEFUL' | 'CURIOUS') {
    setReactions((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
    reactQna.mutate(
      { qnaId: qna.qnaId, request: { reactionType: type } },
      {
        onSuccess: (result) => {
          setReactions((prev) => {
            const next = new Set(prev);
            if (result.isActive) next.add(result.reactionType);
            else next.delete(result.reactionType);
            return next;
          });
        },
      },
    );
  }

  function handleSaveEdit() {
    if (editContent === null) return;
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

  function handleDelete() {
    deleteQna.mutate(
      { qnaId: qna.qnaId },
      {
        onSuccess: () => {
          showToast('삭제되었습니다.');
          onDeleted();
        },
        onError: (error) => {
          const { userMessage } = analyzeError(error);
          showToast(userMessage, 'error');
        },
      },
    );
  }

  function handleReport() {
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
    <div>
      {/* Question title */}
      <div className="mb-150 flex items-start gap-200">
        <span className="font-designer-20b text-text-brand">Q.</span>
        <h3 className="font-designer-20b text-gray-800">
          {stripHtml(qna.title)}
        </h3>
      </div>

      {/* Author row */}
      <div className="mb-300 flex items-center gap-150">
        <UserProfileModal
          memberId={qna.author.memberId}
          trigger={
            <button
              type="button"
              className="cursor-pointer"
              aria-label={`${qna.author.nickname} 프로필 보기`}
            >
              <UserAvatar
                image={undefined}
                size={34}
                alt={qna.author.nickname}
              />
            </button>
          }
        />
        <div className="flex flex-1 items-center gap-50">
          <p className="font-designer-14m text-gray-800">
            {qna.author.nickname}
          </p>
          <RoleBadge role={qna.author.role} />
        </div>
        <div className="flex items-center gap-125">
          <p className="font-designer-14r text-gray-400">
            조회 수 {qna.viewCount}
          </p>
          <p className="font-designer-14r text-gray-400">
            {formatDate(qna.createdAt)}
          </p>
        </div>
        {/* Question ⋮ menu */}
        {(qna.canEdit || qna.canDelete || qna.canReport) && (
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="text-gray-400 hover:text-gray-800"
            >
              <MoreVertical className="h-250 w-250" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-10 mt-75 rounded-100 border border-border-subtle bg-background-default shadow-1">
                {qna.canEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditContent(qna.content);
                      setMenuOpen(false);
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
                      setDeleteMode(true);
                      setMenuOpen(false);
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
                      setMenuOpen(false);
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

      {/* Question content card */}
      <div className="rounded-200 border border-gray-200 p-250">
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
      </div>

      {/* Reaction buttons */}
      <div className="mt-300 flex gap-150">
        <button
          type="button"
          onClick={() => toggleReaction('USEFUL')}
          className={cn(
            'flex items-center gap-100 rounded-full border px-250 py-150 font-designer-14m transition-colors',
            reactions.has('USEFUL')
              ? 'border-rose-500 text-rose-500'
              : 'border-border-default text-gray-500 hover:border-gray-400',
          )}
        >
          <Heart
            className={cn(
              'h-225 w-225',
              reactions.has('USEFUL') && 'fill-current',
            )}
          />
          유용해요 {qna.usefulCount}
        </button>
        <button
          type="button"
          onClick={() => toggleReaction('CURIOUS')}
          className={cn(
            'flex items-center gap-100 rounded-full border px-250 py-150 font-designer-14m transition-colors',
            reactions.has('CURIOUS')
              ? 'border-[#02c76e] text-[#02c76e]'
              : 'border-border-default text-gray-500 hover:border-gray-400',
          )}
        >
          <HelpCircle
            className={cn(
              'h-225 w-225',
              reactions.has('CURIOUS') && 'fill-current',
            )}
          />
          나도 궁금해요 {qna.curiousCount}
        </button>
      </div>

      {/* Report form */}
      {reportMode && (
        <div className="mt-300 space-y-200 rounded-150 border border-border-subtle bg-gray-50 p-300">
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

      {/* Delete confirm */}
      {deleteMode && (
        <div className="mt-300">
          <DeleteConfirm
            label="정말 삭제하시겠어요?"
            onCancel={() => setDeleteMode(false)}
            onConfirm={handleDelete}
            isPending={deleteQna.isPending}
          />
        </div>
      )}
    </div>
  );
}

interface AnswerItemProps {
  answer: LessonQnaDetailAnswer;
  qnaId: number;
}

function AnswerItem({ answer, qnaId }: AnswerItemProps) {
  const showToast = useToastStore((s) => s.showToast);

  const [menuOpen, setMenuOpen] = useState(false);
  const [editContent, setEditContent] = useState<string | null>(null);
  const [deleteMode, setDeleteMode] = useState(false);
  const [questionReactions, setQuestionReactions] = useState<
    Set<'HELPFUL' | 'NOT_HELPFUL'>
  >(new Set());

  const reactAnswer = useReactLessonQnaAnswer();
  const updateAnswer = useUpdateLessonQnaAnswer();
  const deleteAnswer = useDeleteLessonQnaAnswer();

  function toggleReaction(type: 'HELPFUL' | 'NOT_HELPFUL') {
    setQuestionReactions((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.clear();
        next.add(type);
      }
      return next;
    });
    reactAnswer.mutate({
      answerId: answer.answerId,
      qnaId,
      request: { reactionType: type },
    });
  }

  function handleSaveEdit() {
    if (editContent === null) return;
    updateAnswer.mutate(
      {
        answerId: answer.answerId,
        qnaId,
        request: { content: editContent },
      },
      {
        onSuccess: () => {
          setEditContent(null);
          showToast('답변이 수정되었습니다.');
        },
        onError: (error) => {
          const { userMessage } = analyzeError(error);
          showToast(userMessage, 'error');
        },
      },
    );
  }

  function handleDelete() {
    deleteAnswer.mutate(
      { answerId: answer.answerId, qnaId },
      {
        onSuccess: () => {
          setDeleteMode(false);
          showToast('답변이 삭제되었습니다.');
        },
        onError: (error) => {
          const { userMessage } = analyzeError(error);
          showToast(userMessage, 'error');
        },
      },
    );
  }

  return (
    <div className="space-y-250 rounded-200 border border-gray-200 bg-background-alternative p-250">
      {/* A. label */}
      <div className="flex items-center gap-200">
        <span className="font-designer-20b text-text-brand">A.</span>
        <span className="font-designer-18b text-gray-800">답변</span>
      </div>

      {/* Answerer row */}
      <div className="flex items-center gap-150">
        <UserProfileModal
          memberId={answer.author.memberId}
          trigger={
            <button
              type="button"
              className="cursor-pointer"
              aria-label={`${answer.author.nickname} 프로필 보기`}
            >
              <UserAvatar
                image={undefined}
                size={34}
                alt={answer.author.nickname}
              />
            </button>
          }
        />
        <div className="flex flex-1 items-center gap-50">
          <p className="font-designer-14m text-gray-800">
            {answer.author.nickname}
          </p>
          <RoleBadge role={answer.author.role} />
        </div>
        <p className="font-designer-14r text-gray-400">
          {formatDate(answer.createdAt)}
        </p>
        {/* Answer ⋮ menu */}
        {(answer.canEdit || answer.canDelete) && (
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="text-gray-400 hover:text-gray-800"
            >
              <MoreVertical className="h-250 w-250" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-10 mt-75 rounded-100 border border-border-subtle bg-background-default shadow-1">
                {answer.canEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditContent(answer.content);
                      setMenuOpen(false);
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
                      setDeleteMode(true);
                      setMenuOpen(false);
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
      {editContent !== null ? (
        <div className="space-y-200">
          <MarkdownEditor
            value={editContent}
            onChange={setEditContent}
            placeholder="답변을 수정해주세요."
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

      {/* Delete confirm */}
      {deleteMode && (
        <DeleteConfirm
          label="이 답변을 삭제하시겠어요?"
          onCancel={() => setDeleteMode(false)}
          onConfirm={handleDelete}
          isPending={deleteAnswer.isPending}
        />
      )}

      {/* Answer reactions */}
      <div className="flex gap-150">
        <button
          type="button"
          onClick={() => toggleReaction('HELPFUL')}
          className={cn(
            'flex items-center gap-100 rounded-full border px-250 py-150 font-designer-13m transition-colors',
            questionReactions.has('HELPFUL')
              ? 'border-rose-500 text-rose-500'
              : 'border-border-default text-gray-500 hover:border-gray-400',
          )}
        >
          <ThumbsUp className="h-200 w-200" />
          도움돼요 {answer.helpfulCount}
        </button>
        <button
          type="button"
          onClick={() => toggleReaction('NOT_HELPFUL')}
          className={cn(
            'flex items-center gap-100 rounded-full border px-250 py-150 font-designer-13m transition-colors',
            questionReactions.has('NOT_HELPFUL')
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
}

export function LessonQnaDetailModal({ qnaId, onClose }: Props) {
  const { data: qna, isLoading } = useGetLessonQnaDetail(qnaId);

  if (qnaId === null) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-1000/40" onClick={onClose} />
      <div className="relative z-10 mx-400 flex max-h-modal w-full max-w-10000 flex-col overflow-hidden rounded-200 bg-background-default shadow-3">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-375 top-375 z-10 text-gray-400 hover:text-gray-800"
        >
          <X className="h-300 w-300" />
        </button>

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
              <p className="font-designer-14r text-gray-500">
                {qna.courseTitle} &gt; {qna.lessonTitle}
              </p>

              <QuestionSection key={qna.qnaId} qna={qna} onDeleted={onClose} />

              <div className="border-t border-border-subtle pt-400">
                {qna.answers.length === 0 ? (
                  <p className="text-center font-designer-14r text-gray-400">
                    아직 답변이 없어요. 빠르게 답변 드릴게요!
                  </p>
                ) : (
                  <div className="space-y-350">
                    {qna.answers.map((answer) => (
                      <AnswerItem
                        key={answer.answerId}
                        answer={answer}
                        qnaId={qna.qnaId}
                      />
                    ))}
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
