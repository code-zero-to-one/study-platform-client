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
import { type Dispatch, type RefObject, use, useReducer, useRef } from 'react';
import { RoleBadge } from '@/components/class/builder-feed-utils';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { normalizeImageFileForUpload } from '@/components/common/ui/editor/image-utils';
import MarkdownEditor from '@/components/common/ui/editor/markdown-editor';
import TiptapHtmlContent from '@/components/common/ui/rich-text/tiptap-html-content';
import { useAuth } from '@/features/auth/model/use-auth';
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
} from '@/hooks/queries/course/course-queries';
import { useToastStore } from '@/stores/use-toast-store';
import type {
  LessonQnaDetailAnswer,
  LessonQnaDetailResponse,
} from '@/types/api/course.types';
import { AUTH_ROLE_IDS } from '@/types/auth/domain';
import { analyzeError } from '@/utils/error-handler';
import { stripHtml } from '@/utils/markdown-content-text';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

type MenuTarget = 'question' | number;

type QReaction = 'USEFUL' | 'CURIOUS';
type AReaction = 'HELPFUL' | 'NOT_HELPFUL';

const MAX_IMAGE_COUNT = 10;

interface QnaDetailState {
  menuOpen: MenuTarget | null;
  editContent: string | null;
  deleteMode: MenuTarget | null;
  reportMode: boolean;
  reportReason: string;
  answerEdit: { answerId: number; content: string } | null;
  qReactions: Set<QReaction>;
  aReactions: Map<number, Set<AReaction>>;
  showAnswerForm: boolean;
  newAnswer: string;
  answerImages: { previewUrl: string; key: string }[];
  isUploadingAnswerImage: boolean;
}

type QnaDetailAction =
  | { type: 'toggleMenu'; target: MenuTarget }
  | { type: 'closeMenu' }
  | { type: 'openEdit'; content: string }
  | { type: 'setEditContent'; content: string }
  | { type: 'cancelEdit' }
  | { type: 'openDelete'; target: MenuTarget }
  | { type: 'closeDelete' }
  | { type: 'openReport' }
  | { type: 'closeReport' }
  | { type: 'setReportReason'; reason: string }
  | { type: 'openAnswerEdit'; answerId: number; content: string }
  | { type: 'setAnswerEditContent'; content: string }
  | { type: 'cancelAnswerEdit' }
  | { type: 'toggleQReaction'; reactionType: QReaction }
  | { type: 'reconcileQReaction'; reactionType: QReaction; isActive: boolean }
  | { type: 'toggleAReaction'; answerId: number; reactionType: AReaction }
  | { type: 'toggleAnswerForm' }
  | { type: 'setNewAnswer'; content: string }
  | { type: 'addAnswerImage'; image: { previewUrl: string; key: string } }
  | { type: 'removeAnswerImage'; index: number }
  | { type: 'setUploadingAnswerImage'; value: boolean }
  | { type: 'resetAnswerForm' };

const INITIAL_QNA_DETAIL: QnaDetailState = {
  menuOpen: null,
  editContent: null,
  deleteMode: null,
  reportMode: false,
  reportReason: '',
  answerEdit: null,
  qReactions: new Set(),
  aReactions: new Map(),
  showAnswerForm: false,
  newAnswer: '',
  answerImages: [],
  isUploadingAnswerImage: false,
};

function qnaDetailReducer(
  state: QnaDetailState,
  action: QnaDetailAction,
): QnaDetailState {
  switch (action.type) {
    case 'toggleMenu':
      return {
        ...state,
        menuOpen: state.menuOpen === action.target ? null : action.target,
      };
    case 'closeMenu':
      return { ...state, menuOpen: null };
    case 'openEdit':
      return { ...state, editContent: action.content, menuOpen: null };
    case 'setEditContent':
      return { ...state, editContent: action.content };
    case 'cancelEdit':
      return { ...state, editContent: null };
    case 'openDelete':
      return { ...state, deleteMode: action.target, menuOpen: null };
    case 'closeDelete':
      return { ...state, deleteMode: null };
    case 'openReport':
      return { ...state, reportMode: true, menuOpen: null };
    case 'closeReport':
      return { ...state, reportMode: false, reportReason: '' };
    case 'setReportReason':
      return { ...state, reportReason: action.reason };
    case 'openAnswerEdit':
      return {
        ...state,
        answerEdit: {
          answerId: action.answerId,
          content: action.content,
        },
        menuOpen: null,
      };
    case 'setAnswerEditContent':
      return state.answerEdit
        ? {
            ...state,
            answerEdit: {
              ...state.answerEdit,
              content: action.content,
            },
          }
        : state;
    case 'cancelAnswerEdit':
      return { ...state, answerEdit: null };
    case 'toggleQReaction': {
      const next = new Set(state.qReactions);
      if (next.has(action.reactionType)) {
        next.delete(action.reactionType);
      } else {
        next.clear();
        next.add(action.reactionType);
      }
      return { ...state, qReactions: next };
    }
    case 'reconcileQReaction': {
      const next = new Set(state.qReactions);
      if (action.isActive) next.add(action.reactionType);
      else next.delete(action.reactionType);
      return { ...state, qReactions: next };
    }
    case 'toggleAReaction': {
      const map = new Map(state.aReactions);
      const current = new Set(map.get(action.answerId) ?? []);
      if (current.has(action.reactionType)) {
        current.delete(action.reactionType);
      } else {
        current.clear();
        current.add(action.reactionType);
      }
      map.set(action.answerId, current);
      return { ...state, aReactions: map };
    }
    case 'toggleAnswerForm':
      return { ...state, showAnswerForm: !state.showAnswerForm };
    case 'setNewAnswer':
      return { ...state, newAnswer: action.content };
    case 'addAnswerImage':
      return {
        ...state,
        answerImages: [...state.answerImages, action.image],
      };
    case 'removeAnswerImage': {
      const next = [...state.answerImages];
      next.splice(action.index, 1);
      return { ...state, answerImages: next };
    }
    case 'setUploadingAnswerImage':
      return { ...state, isUploadingAnswerImage: action.value };
    case 'resetAnswerForm':
      return {
        ...state,
        showAnswerForm: false,
        newAnswer: '',
        answerImages: [],
      };
    default:
      return state;
  }
}

function QnaReportForm({
  reportReason,
  isPending,
  dispatch,
  onSubmit,
}: {
  reportReason: string;
  isPending: boolean;
  dispatch: Dispatch<QnaDetailAction>;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-200 rounded-150 border border-border-subtle bg-gray-50 p-300">
      <p className="font-designer-14b text-gray-800">
        신고 사유를 입력해주세요
      </p>
      <textarea
        aria-label="신고 사유"
        value={reportReason}
        onChange={(e) =>
          dispatch({
            type: 'setReportReason',
            reason: e.target.value,
          })
        }
        placeholder="신고 사유를 상세히 작성해주세요."
        className="h-1250 w-full resize-none rounded-100 border border-border-default p-200 font-designer-14r text-gray-800 placeholder:text-gray-400 focus:border-border-brand focus:outline-none"
      />
      <div className="flex justify-end gap-150">
        <button
          type="button"
          onClick={() => dispatch({ type: 'closeReport' })}
          className="rounded-100 border border-border-default px-300 py-150 font-designer-14m text-gray-600 hover:bg-gray-100"
        >
          취소
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isPending}
          className="rounded-100 bg-rose-500 px-300 py-150 font-designer-14m text-text-inverse hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? '신고 중...' : '신고하기'}
        </button>
      </div>
    </div>
  );
}

function QnaDeleteConfirm({
  isPending,
  dispatch,
  onConfirm,
}: {
  isPending: boolean;
  dispatch: Dispatch<QnaDetailAction>;
  onConfirm: () => void;
}) {
  return (
    <div className="space-y-200 rounded-150 border border-rose-200 bg-rose-50 p-300">
      <p className="font-designer-14b text-gray-800">정말 삭제하시겠어요?</p>
      <p className="font-designer-14r text-gray-500">
        삭제 후에는 복구할 수 없어요.
      </p>
      <div className="flex justify-end gap-150">
        <button
          type="button"
          onClick={() => dispatch({ type: 'closeDelete' })}
          className="rounded-100 border border-border-default px-300 py-150 font-designer-14m text-gray-600 hover:bg-gray-100"
        >
          취소
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isPending}
          className="rounded-100 bg-rose-500 px-300 py-150 font-designer-14m text-text-inverse hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? '삭제 중...' : '삭제'}
        </button>
      </div>
    </div>
  );
}

function QnaAnswerItem({
  answer,
  qnaId,
  menuOpen,
  answerEdit,
  isDeleting,
  myReaction,
  updatePending,
  deletePending,
  dispatch,
  onSaveEdit,
  onDelete,
  onToggleReaction,
}: {
  answer: LessonQnaDetailAnswer;
  qnaId: number;
  menuOpen: MenuTarget | null;
  answerEdit: { answerId: number; content: string } | null;
  isDeleting: boolean;
  myReaction: Set<AReaction> | undefined;
  updatePending: boolean;
  deletePending: boolean;
  dispatch: Dispatch<QnaDetailAction>;
  onSaveEdit: () => void;
  onDelete: (answerId: number) => void;
  onToggleReaction: (answerId: number, qnaId: number, type: AReaction) => void;
}) {
  const isEditingThis =
    answerEdit !== null && answerEdit.answerId === answer.answerId;

  return (
    <div className="space-y-250 rounded-150 border border-border-subtle p-300">
      {/* Answerer row */}
      <div className="flex items-center gap-150">
        <div className="flex size-400 shrink-0 items-center justify-center rounded-full bg-gray-200">
          <p className="font-designer-14b text-gray-600">
            {answer.author.nickname.charAt(0)}
          </p>
        </div>
        <RoleBadge variant={answer.author.role} />
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
                dispatch({
                  type: 'toggleMenu',
                  target: answer.answerId,
                })
              }
              className="text-gray-400 hover:text-gray-800"
            >
              <MoreVertical className="size-250" />
            </button>
            {menuOpen === answer.answerId && (
              <>
                <button
                  type="button"
                  aria-label="메뉴 닫기"
                  className="fixed inset-0 z-10"
                  onClick={() => dispatch({ type: 'closeMenu' })}
                />
                <div className="absolute right-0 top-full z-20 mt-75 rounded-100 border border-border-subtle bg-background-default shadow-1">
                  {answer.canEdit && (
                    <button
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: 'openAnswerEdit',
                          answerId: answer.answerId,
                          content: answer.content,
                        })
                      }
                      className="flex w-full items-center whitespace-nowrap px-200 py-150 font-designer-14r text-gray-800 hover:bg-gray-100"
                    >
                      수정
                    </button>
                  )}
                  {answer.canDelete && (
                    <button
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: 'openDelete',
                          target: answer.answerId,
                        })
                      }
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
              dispatch({
                type: 'setAnswerEditContent',
                content: v,
              })
            }
            placeholder="답변을 수정해주세요."
            uploadImage={uploadCommunityMarkdownImage}
          />
          <div className="flex justify-end gap-150">
            <button
              type="button"
              onClick={() => dispatch({ type: 'cancelAnswerEdit' })}
              className="rounded-100 border border-border-default px-300 py-150 font-designer-14m text-gray-600 hover:bg-gray-100"
            >
              취소
            </button>
            <button
              type="button"
              onClick={onSaveEdit}
              disabled={updatePending}
              className="rounded-100 bg-rose-500 px-300 py-150 font-designer-14m text-text-inverse hover:opacity-90 disabled:opacity-50"
            >
              {updatePending ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      ) : (
        <TiptapHtmlContent html={answer.content} />
      )}

      {/* Answer images */}
      {answer.imageUrls.length > 0 && (
        <div className="flex flex-wrap gap-200">
          {answer.imageUrls.map((url, i) => (
            <Image
              key={url ?? i}
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
      {isDeleting && (
        <div className="space-y-150 rounded-100 border border-rose-200 bg-rose-50 p-200">
          <p className="font-designer-14b text-gray-800">
            이 답변을 삭제하시겠어요?
          </p>
          <div className="flex justify-end gap-125">
            <button
              type="button"
              onClick={() => dispatch({ type: 'closeDelete' })}
              className="rounded-100 border border-border-default px-250 py-100 font-designer-14m text-gray-600 hover:bg-gray-100"
            >
              취소
            </button>
            <button
              type="button"
              onClick={() => onDelete(answer.answerId)}
              disabled={deletePending}
              className="rounded-100 bg-rose-500 px-250 py-100 font-designer-14m text-text-inverse hover:opacity-90 disabled:opacity-50"
            >
              {deletePending ? '삭제 중...' : '삭제'}
            </button>
          </div>
        </div>
      )}

      {/* Answer reactions */}
      <div className="flex gap-150">
        <button
          type="button"
          onClick={() => onToggleReaction(answer.answerId, qnaId, 'HELPFUL')}
          className={cn(
            'flex items-center gap-100 whitespace-nowrap rounded-full border px-250 py-150 font-designer-13m transition-colors',
            myReaction?.has('HELPFUL')
              ? 'border-rose-500 text-rose-500'
              : 'border-border-default text-gray-500 hover:border-gray-400',
          )}
        >
          <ThumbsUp className="size-200" />
          도움돼요 {answer.helpfulCount}
        </button>
        <button
          type="button"
          onClick={() =>
            onToggleReaction(answer.answerId, qnaId, 'NOT_HELPFUL')
          }
          className={cn(
            'flex items-center gap-100 whitespace-nowrap rounded-full border px-250 py-150 font-designer-13m transition-colors',
            myReaction?.has('NOT_HELPFUL')
              ? 'border-gray-800 text-gray-800'
              : 'border-border-default text-gray-500 hover:border-gray-400',
          )}
        >
          <ThumbsDown className="size-200" />
          도움안돼요 {answer.notHelpfulCount}
        </button>
      </div>
    </div>
  );
}

function QnaAnswerForm({
  newAnswer,
  answerImages,
  isUploading,
  isPending,
  inputRef,
  dispatch,
  onImageAdd,
  onImageRemove,
  onSubmit,
  onCancel,
}: {
  newAnswer: string;
  answerImages: { previewUrl: string; key: string }[];
  isUploading: boolean;
  isPending: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  dispatch: Dispatch<QnaDetailAction>;
  onImageAdd: (file: File) => Promise<void>;
  onImageRemove: (index: number) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="border-t border-border-subtle pt-500">
      <p className="mb-400 font-designer-16b text-gray-800">답변하기</p>
      <div className="space-y-400">
        <MarkdownEditor
          value={newAnswer}
          onChange={(v) => dispatch({ type: 'setNewAnswer', content: v })}
          placeholder="답변을 기다리고 있습니다."
          uploadImage={uploadCommunityMarkdownImage}
        />
        <div className="space-y-250">
          <p className="font-designer-16b text-gray-800">이미지 첨부하기</p>
          <div className="flex flex-wrap gap-150">
            {answerImages.map((img, i) => (
              <div key={img.key} className="relative size-1625 shrink-0">
                <Image
                  src={img.previewUrl}
                  alt={`첨부 이미지 ${i + 1}`}
                  fill
                  unoptimized
                  sizes="25vw"
                  className="rounded-150 object-cover"
                />
                <button
                  type="button"
                  aria-label={`이미지 ${i + 1} 삭제`}
                  onClick={() => onImageRemove(i)}
                  className="absolute -right-75 -top-75 flex size-200 items-center justify-center rounded-full bg-gray-800 text-background-default"
                >
                  <X className="size-125" />
                </button>
              </div>
            ))}
            {answerImages.length < 10 && (
              <button
                type="button"
                disabled={isUploading}
                onClick={() => inputRef.current?.click()}
                className={cn(
                  'flex size-1625 shrink-0 flex-col items-center justify-center rounded-150 border border-border-default bg-gray-200',
                  isUploading
                    ? 'cursor-not-allowed opacity-50'
                    : 'hover:border-rose-400',
                )}
              >
                <Plus className="size-300 text-gray-400" />
              </button>
            )}
          </div>
          <p className="font-designer-14r text-gray-500">
            * 최대 {MAX_IMAGE_COUNT}개의 사진을 등록할 수 있어요. / 10MB 이하의
            파일만 등록할 수 있어요.
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            aria-label="이미지 첨부"
            className="hidden"
            onChange={async (e) => {
              const target = e.target;
              const file = target.files?.[0];
              if (file) await onImageAdd(file);
              target.value = '';
            }}
          />
        </div>
        <div className="border-t border-border-subtle" />
        <div className="flex gap-200">
          <button
            type="button"
            onClick={onCancel}
            className="flex h-700 flex-1 items-center justify-center rounded-100 border border-background-brand-default font-designer-16b text-text-brand"
          >
            임시저장
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isPending}
            className="flex h-700 flex-1 items-center justify-center rounded-100 bg-background-brand-default font-designer-16b text-text-inverse disabled:opacity-50"
          >
            {isPending ? '등록 중...' : '등록하기'}
          </button>
        </div>
      </div>
    </div>
  );
}

function QnaQuestionSection({
  qna,
  menuOpen,
  editContent,
  qReactions,
  dispatch,
  updatePending,
  onSaveEdit,
  onToggleQReaction,
}: {
  qna: LessonQnaDetailResponse;
  menuOpen: QnaDetailState['menuOpen'];
  editContent: QnaDetailState['editContent'];
  qReactions: QnaDetailState['qReactions'];
  dispatch: Dispatch<QnaDetailAction>;
  updatePending: boolean;
  onSaveEdit: () => void;
  onToggleQReaction: (type: QReaction) => void;
}) {
  return (
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
                dispatch({
                  type: 'toggleMenu',
                  target: 'question',
                })
              }
              className="text-gray-400 hover:text-gray-800"
            >
              <MoreVertical className="size-250" />
            </button>
            {menuOpen === 'question' && (
              <>
                <button
                  type="button"
                  aria-label="메뉴 닫기"
                  className="fixed inset-0 z-10"
                  onClick={() => dispatch({ type: 'closeMenu' })}
                />
                <div className="absolute right-0 top-full z-20 mt-75 rounded-100 border border-border-subtle bg-background-default shadow-1">
                  {qna.canEdit && (
                    <button
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: 'openEdit',
                          content: qna.content,
                        })
                      }
                      className="flex w-full items-center whitespace-nowrap px-200 py-150 font-designer-14r text-gray-800 hover:bg-gray-100"
                    >
                      수정
                    </button>
                  )}
                  {qna.canDelete && (
                    <button
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: 'openDelete',
                          target: 'question',
                        })
                      }
                      className="flex w-full items-center whitespace-nowrap px-200 py-150 font-designer-14r text-rose-500 hover:bg-gray-100"
                    >
                      삭제
                    </button>
                  )}
                  {qna.canReport && (
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'openReport' })}
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
          <div className="flex size-350 shrink-0 items-center justify-center rounded-full bg-gray-200">
            <p className="font-designer-12r text-gray-600">
              {qna.author.nickname.charAt(0)}
            </p>
          </div>
          <p className="font-designer-14b text-gray-800">
            {qna.author.nickname}
          </p>
          <RoleBadge variant={qna.author.role} />
        </div>
        <p className="font-designer-14r text-gray-400">
          {formatDate(qna.createdAt)} 작성
        </p>
        <p className="font-designer-14r text-gray-400">조회 {qna.viewCount}</p>
      </div>

      {/* Content: edit mode or view mode */}
      {editContent !== null ? (
        <div className="space-y-200">
          <MarkdownEditor
            value={editContent}
            onChange={(v) => dispatch({ type: 'setEditContent', content: v })}
            placeholder="내용을 수정해주세요."
            uploadImage={uploadCommunityMarkdownImage}
          />
          <div className="flex justify-end gap-150">
            <button
              type="button"
              onClick={() => dispatch({ type: 'cancelEdit' })}
              className="rounded-100 border border-border-default px-300 py-150 font-designer-14m text-gray-600 hover:bg-gray-100"
            >
              취소
            </button>
            <button
              type="button"
              onClick={onSaveEdit}
              disabled={updatePending}
              className="rounded-100 bg-rose-500 px-300 py-150 font-designer-14m text-text-inverse hover:opacity-90 disabled:opacity-50"
            >
              {updatePending ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      ) : (
        <TiptapHtmlContent html={qna.content} />
      )}

      {/* Question images */}
      {qna.imageUrls.length > 0 && (
        <div className="mt-250 flex flex-wrap gap-200">
          {qna.imageUrls.map((url, i) => (
            <Image
              key={url ?? i}
              src={url}
              alt={`첨부 이미지 ${i + 1}`}
              width={800}
              height={450}
              unoptimized
              sizes="(max-width: 768px) 100vw, 50vw"
              className="max-w-full rounded-100 object-cover"
            />
          ))}
        </div>
      )}

      {/* Reaction buttons */}
      <div className="mt-300 flex gap-150">
        <button
          type="button"
          onClick={() => onToggleQReaction('USEFUL')}
          className={cn(
            'flex items-center gap-100 whitespace-nowrap rounded-full border px-250 py-150 font-designer-14m transition-colors',
            qReactions.has('USEFUL')
              ? 'border-rose-500 text-rose-500'
              : 'border-border-default text-gray-500 hover:border-gray-400',
          )}
        >
          <Heart
            className={cn(
              'size-225',
              qReactions.has('USEFUL') && 'fill-current',
            )}
          />
          유용해요 {qna.usefulCount}
        </button>
        <button
          type="button"
          onClick={() => onToggleQReaction('CURIOUS')}
          className={cn(
            'flex items-center gap-100 whitespace-nowrap rounded-full border px-250 py-150 font-designer-14m transition-colors',
            qReactions.has('CURIOUS')
              ? 'border-[#02c76e] text-[#02c76e]'
              : 'border-border-default text-gray-500 hover:border-gray-400',
          )}
        >
          <HelpCircle
            className={cn(
              'size-225',
              qReactions.has('CURIOUS') && 'fill-current',
            )}
          />
          나도 궁금해요 {qna.curiousCount}
        </button>
      </div>
    </div>
  );
}

function QnaLoadedContent({
  qna,
  state,
  dispatch,
  answerImageInputRef,
  pending,
  onToggleQReaction,
  onToggleAReaction,
  onSaveEdit,
  onDeleteQuestion,
  onSaveAnswerEdit,
  onDeleteAnswer,
  onReport,
  onAnswerImageAdd,
  onAnswerImageRemove,
  onSubmitAnswer,
  onCancelAnswerForm,
}: {
  qna: LessonQnaDetailResponse;
  state: QnaDetailState;
  dispatch: Dispatch<QnaDetailAction>;
  answerImageInputRef: RefObject<HTMLInputElement | null>;
  pending: {
    updateQna: boolean;
    deleteQna: boolean;
    reportQna: boolean;
    updateAnswer: boolean;
    deleteAnswer: boolean;
    createAnswer: boolean;
  };
  onToggleQReaction: (type: QReaction) => void;
  onToggleAReaction: (
    answerId: number,
    parentQnaId: number,
    type: AReaction,
  ) => void;
  onSaveEdit: () => void;
  onDeleteQuestion: () => void;
  onSaveAnswerEdit: () => void;
  onDeleteAnswer: (answerId: number) => void;
  onReport: () => void;
  onAnswerImageAdd: (file: File) => Promise<void>;
  onAnswerImageRemove: (index: number) => void;
  onSubmitAnswer: () => void;
  onCancelAnswerForm: () => void;
}) {
  const {
    menuOpen,
    deleteMode,
    reportMode,
    reportReason,
    answerEdit,
    aReactions,
    showAnswerForm,
    newAnswer,
    answerImages,
    isUploadingAnswerImage,
  } = state;

  return (
    <div className="space-y-400">
      {/* Breadcrumb */}
      <p className="font-designer-14r text-gray-500">
        {qna.courseTitle} &gt; {qna.lessonTitle}
      </p>

      {/* Question section */}
      <QnaQuestionSection
        qna={qna}
        menuOpen={menuOpen}
        editContent={state.editContent}
        qReactions={state.qReactions}
        dispatch={dispatch}
        updatePending={pending.updateQna}
        onSaveEdit={onSaveEdit}
        onToggleQReaction={onToggleQReaction}
      />

      {/* Report form */}
      {reportMode && (
        <QnaReportForm
          reportReason={reportReason}
          isPending={pending.reportQna}
          dispatch={dispatch}
          onSubmit={onReport}
        />
      )}

      {/* Delete confirm for question */}
      {deleteMode === 'question' && (
        <QnaDeleteConfirm
          isPending={pending.deleteQna}
          dispatch={dispatch}
          onConfirm={onDeleteQuestion}
        />
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
            {qna.answers.map((answer) => (
              <QnaAnswerItem
                key={answer.answerId}
                answer={answer}
                qnaId={qna.qnaId}
                menuOpen={menuOpen}
                answerEdit={answerEdit}
                isDeleting={deleteMode === answer.answerId}
                myReaction={aReactions.get(answer.answerId)}
                updatePending={pending.updateAnswer}
                deletePending={pending.deleteAnswer}
                dispatch={dispatch}
                onSaveEdit={onSaveAnswerEdit}
                onDelete={onDeleteAnswer}
                onToggleReaction={onToggleAReaction}
              />
            ))}
          </div>
        )}
      </div>

      {/* Answer creation form — shown when 답변하기 button clicked */}
      {showAnswerForm && (
        <QnaAnswerForm
          newAnswer={newAnswer}
          answerImages={answerImages}
          isUploading={isUploadingAnswerImage}
          isPending={pending.createAnswer}
          inputRef={answerImageInputRef}
          dispatch={dispatch}
          onImageAdd={onAnswerImageAdd}
          onImageRemove={onAnswerImageRemove}
          onSubmit={onSubmitAnswer}
          onCancel={onCancelAnswerForm}
        />
      )}
    </div>
  );
}

export default function QnaDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { id, slug } = use(params);
  const qnaId = parseInt(id, 10);
  const router = useRouter();
  const { data: authData } = useAuth();
  const isAdmin = authData?.roleIds.includes(AUTH_ROLE_IDS.ADMIN) ?? false;
  const { data: qna, isLoading } = useGetLessonQnaDetail(qnaId);
  const showToast = useToastStore((s) => s.showToast);

  const [state, dispatch] = useReducer(qnaDetailReducer, INITIAL_QNA_DETAIL);
  const { editContent, reportReason, answerEdit, newAnswer, answerImages } =
    state;
  const answerImageInputRef = useRef<HTMLInputElement>(null);

  const reactQna = useReactLessonQna();
  const reactAnswer = useReactLessonQnaAnswer();
  const updateQna = useUpdateLessonQna();
  const deleteQna = useDeleteLessonQna();
  const updateAnswer = useUpdateLessonQnaAnswer();
  const deleteAnswer = useDeleteLessonQnaAnswer();
  const reportQna = useReportLessonQna();
  const createAnswer = useCreateLessonQnaAnswer();

  function toggleQReaction(type: QReaction) {
    if (!qna) return;
    dispatch({ type: 'toggleQReaction', reactionType: type });
    reactQna.mutate(
      { qnaId: qna.qnaId, request: { reactionType: type } },
      {
        onSuccess: (result) =>
          dispatch({
            type: 'reconcileQReaction',
            reactionType: result.reactionType,
            isActive: result.isActive,
          }),
      },
    );
  }

  function toggleAReaction(
    answerId: number,
    parentQnaId: number,
    type: AReaction,
  ) {
    dispatch({ type: 'toggleAReaction', answerId, reactionType: type });
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
          dispatch({ type: 'cancelEdit' });
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
          router.push(`/class/${slug}/home?tab=qna`);
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
          dispatch({ type: 'cancelAnswerEdit' });
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
          dispatch({ type: 'closeDelete' });
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
          dispatch({ type: 'closeReport' });
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
    dispatch({ type: 'setUploadingAnswerImage', value: true });
    try {
      const normalizedFile = await normalizeImageFileForUpload(file);
      const publicUrl = await uploadCommunityMarkdownImage(normalizedFile);
      const key = new URL(publicUrl).pathname.slice(1);
      const previewUrl = URL.createObjectURL(normalizedFile);
      dispatch({ type: 'addAnswerImage', image: { previewUrl, key } });
    } catch {
      showToast('이미지 업로드에 실패했습니다.', 'error');
    } finally {
      dispatch({ type: 'setUploadingAnswerImage', value: false });
    }
  }

  function handleAnswerImageRemove(index: number) {
    URL.revokeObjectURL(answerImages[index].previewUrl);
    dispatch({ type: 'removeAnswerImage', index });
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
          answerImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
          dispatch({ type: 'resetAnswerForm' });
        },
        onError: (error) => {
          const { userMessage } = analyzeError(error);
          showToast(userMessage, 'error');
        },
      },
    );
  }

  function handleCancelAnswerForm() {
    answerImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    dispatch({ type: 'resetAnswerForm' });
  }

  return (
    <div className="w-full px-3000 py-750">
      <Link
        href={`/class/${slug}/home?tab=qna`}
        className="inline-flex items-center gap-125 font-designer-14m text-gray-800"
      >
        <ArrowLeft className="size-300" />
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
          <QnaLoadedContent
            qna={qna}
            state={state}
            dispatch={dispatch}
            answerImageInputRef={answerImageInputRef}
            pending={{
              updateQna: updateQna.isPending,
              deleteQna: deleteQna.isPending,
              reportQna: reportQna.isPending,
              updateAnswer: updateAnswer.isPending,
              deleteAnswer: deleteAnswer.isPending,
              createAnswer: createAnswer.isPending,
            }}
            onToggleQReaction={toggleQReaction}
            onToggleAReaction={toggleAReaction}
            onSaveEdit={handleSaveEdit}
            onDeleteQuestion={handleDeleteQuestion}
            onSaveAnswerEdit={handleSaveAnswerEdit}
            onDeleteAnswer={handleDeleteAnswer}
            onReport={handleReport}
            onAnswerImageAdd={handleAnswerImageAdd}
            onAnswerImageRemove={handleAnswerImageRemove}
            onSubmitAnswer={handleSubmitAnswer}
            onCancelAnswerForm={handleCancelAnswerForm}
          />
        )}
      </div>

      {isAdmin && (
        <div className="fixed bottom-400 left-1/2 z-50 -translate-x-1/2">
          <button
            type="button"
            onClick={() => dispatch({ type: 'toggleAnswerForm' })}
            className="flex h-875 w-4500 items-center justify-center rounded-full bg-background-brand-default font-designer-24m text-text-inverse shadow-3"
          >
            답변하기
          </button>
        </div>
      )}
    </div>
  );
}
