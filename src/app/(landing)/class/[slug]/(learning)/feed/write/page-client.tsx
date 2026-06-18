'use client';

import { ArrowLeft, ChevronDown, Plus, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  type Dispatch,
  type RefObject,
  Suspense,
  useReducer,
  useRef,
} from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { normalizeImageFileForUpload } from '@/components/common/ui/editor/image-utils';
import MarkdownEditor from '@/components/common/ui/editor/markdown-editor';
import { uploadCommunityMarkdownImage } from '@/features/community/model/community-markdown-image-upload';
import {
  useCreateBuilderFeed,
  useGetBuilderFeedDetail,
  useGetCourseCurriculum,
  useGetCourseDetail,
  useUpdateBuilderFeed,
} from '@/hooks/queries/course/course-queries';
import { useToastStore } from '@/stores/use-toast-store';
import type { BuilderFeedDetailResponse } from '@/types/api/course.types';
import {
  hasMeaningfulCommunityMarkdownContent,
  normalizeCommunityMarkdownImageSourcesForStorage,
  toCommunityContentImagePath,
} from '@/types/community/markdown';

const LEGACY_BUILDER_FEED_IMAGE_PATH_PREFIXES = ['upload/builder-feed/'];
const EMPTY_FEED_MESSAGE = '내용 또는 사진을 추가해주세요.';

const FEED_NOTICE = [
  '작성한 피드는 언제든지 수정하거나 삭제할 수 있습니다.',
  '다른 수강생에게 불쾌감을 줄 수 있는 내용은 운영 정책에 따라 삭제될 수 있습니다.',
];

const MAX_IMAGE_COUNT = 10;

interface AttachedImage {
  previewUrl: string;
  key: string;
}

const stripUrlQueryAndFragment = (value: string) =>
  value.split('#', 2)[0].split('?', 2)[0];

const toLegacyBuilderFeedImagePath = (url: string) => {
  const normalizePath = (path: string) => {
    const normalizedPath = stripUrlQueryAndFragment(path.trim()).replace(
      /^\/+/,
      '',
    );

    return normalizedPath === 'upload/feed' ||
      normalizedPath.startsWith('upload/feed.') ||
      normalizedPath.startsWith('upload/feed/') ||
      LEGACY_BUILDER_FEED_IMAGE_PATH_PREFIXES.some((prefix) =>
        normalizedPath.startsWith(prefix),
      )
      ? normalizedPath
      : undefined;
  };

  const directPath = normalizePath(url);
  if (directPath) {
    return directPath;
  }

  try {
    return normalizePath(new URL(url).pathname);
  } catch {
    return undefined;
  }
};

const toBuilderFeedAttachmentImageKey = (url: string) => {
  return toCommunityContentImagePath(url) ?? toLegacyBuilderFeedImagePath(url);
};

const toAttachmentImageUploadErrorMessage = (file: File, error: unknown) => {
  if (error instanceof Error && error.message.trim()) {
    return `${file.name}: ${error.message.trim()}`;
  }

  return `${file.name}: 이미지 업로드에 실패했습니다.`;
};

export default function FeedWritePage() {
  return (
    <Suspense fallback={null}>
      <FeedWritePageContent />
    </Suspense>
  );
}

function FeedWritePageContent() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();

  const feedIdParam = searchParams.get('feedId');
  const parsedFeedId = feedIdParam ? parseInt(feedIdParam, 10) : null;
  const editFeedId =
    parsedFeedId !== null && !Number.isNaN(parsedFeedId) ? parsedFeedId : null;

  const { data: existingFeed } = useGetBuilderFeedDetail(editFeedId ?? 0);

  // 편집 모드는 기존 피드 로딩 완료 후 폼을 마운트해 초기값을 lazy-init로 주입한다.
  if (editFeedId !== null && !existingFeed) return null;

  return (
    <FeedWriteForm
      key={editFeedId ?? 'new'}
      slug={slug}
      editFeedId={editFeedId}
      existingFeed={existingFeed ?? null}
    />
  );
}

function readCreateDraft(slug: string): {
  content: string;
  lessonId: number | null;
  feedId: number | null;
} {
  const empty: {
    content: string;
    lessonId: number | null;
    feedId: number | null;
  } = { content: '', lessonId: null, feedId: null };
  if (typeof window === 'undefined') return empty;
  const raw = localStorage.getItem(`course-feed-draft-${slug}`);
  if (!raw) return empty;
  try {
    const { content, lessonId, feedId } = JSON.parse(raw);
    return {
      content: typeof content === 'string' ? content : '',
      lessonId: typeof lessonId === 'number' ? lessonId : null,
      feedId: typeof feedId === 'number' ? feedId : null,
    };
  } catch {
    return empty;
  }
}

interface FeedWriteInit {
  existingFeed: BuilderFeedDetailResponse | null;
  draft: { content: string; lessonId: number | null; feedId: number | null };
}

interface FeedWriteState {
  courseOpen: boolean;
  selectedLessonId: number | null;
  lessonOpen: boolean;
  text: string;
  images: AttachedImage[];
  isUploadingImage: boolean;
}

type FeedWriteAction =
  | { type: 'toggleCourse' }
  | { type: 'closeCourse' }
  | { type: 'toggleLesson' }
  | { type: 'selectLesson'; lessonId: number }
  | { type: 'setText'; text: string }
  | { type: 'addImages'; images: AttachedImage[] }
  | { type: 'removeImage'; index: number }
  | { type: 'setUploadingImage'; value: boolean };

function createInitialFeedWriteState({
  existingFeed,
  draft,
}: FeedWriteInit): FeedWriteState {
  return {
    courseOpen: false,
    selectedLessonId: draft.lessonId,
    lessonOpen: false,
    text: existingFeed?.content ?? draft.content,
    images: existingFeed
      ? existingFeed.imageUrls
          .map((url) => {
            const key = toBuilderFeedAttachmentImageKey(url);

            return key ? { previewUrl: url, key } : undefined;
          })
          .filter((image): image is AttachedImage => image !== undefined)
      : [],
    isUploadingImage: false,
  };
}

function feedWriteReducer(
  state: FeedWriteState,
  action: FeedWriteAction,
): FeedWriteState {
  switch (action.type) {
    case 'toggleCourse':
      return { ...state, courseOpen: !state.courseOpen };
    case 'closeCourse':
      return { ...state, courseOpen: false };
    case 'toggleLesson':
      return { ...state, lessonOpen: !state.lessonOpen };
    case 'selectLesson':
      return {
        ...state,
        selectedLessonId: action.lessonId,
        lessonOpen: false,
      };
    case 'setText':
      return { ...state, text: action.text };
    case 'addImages':
      return { ...state, images: [...state.images, ...action.images] };
    case 'removeImage': {
      const next = [...state.images];
      next.splice(action.index, 1);
      return { ...state, images: next };
    }
    case 'setUploadingImage':
      return { ...state, isUploadingImage: action.value };
    default:
      return state;
  }
}

function FeedCourseSelectors({
  course,
  courseOpen,
  lessonOpen,
  selectedLessonLabel,
  allLessons,
  dispatch,
}: {
  course: string;
  courseOpen: boolean;
  lessonOpen: boolean;
  selectedLessonLabel: string;
  allLessons: { lessonId: number; label: string }[];
  dispatch: Dispatch<FeedWriteAction>;
}) {
  return (
    <>
      <div>
        <p className="mb-150 font-designer-16b text-gray-800">
          어떤 코스에서 만든 결과물인가요?
        </p>
        <div className="relative">
          <button
            type="button"
            onClick={() => dispatch({ type: 'toggleCourse' })}
            className="flex w-full items-center justify-between rounded-100 border border-border-default px-250 py-175 font-designer-16r text-gray-800"
          >
            {course}
            <ChevronDown
              className={cn(
                'size-300 transition-transform',
                courseOpen && 'rotate-180',
              )}
            />
          </button>
          {courseOpen && (
            <div className="absolute left-0 top-full z-10 mt-75 w-full rounded-100 border border-border-default bg-background-default shadow-1">
              {['바이브 코딩 입문자 코스'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => dispatch({ type: 'closeCourse' })}
                  className="flex w-full items-center bg-gray-50 px-250 py-175 font-designer-16r text-gray-800 hover:bg-gray-100"
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => dispatch({ type: 'toggleLesson' })}
          className="flex size-full items-center justify-between rounded-100 border border-border-default px-250 py-175 font-designer-16r text-gray-800"
        >
          {selectedLessonLabel}
          <ChevronDown
            className={cn(
              'size-300 transition-transform',
              lessonOpen && 'rotate-180',
            )}
          />
        </button>
        {lessonOpen && (
          <div className="absolute left-0 top-full z-10 mt-75 max-h-3750 w-full overflow-y-auto rounded-100 border border-border-default bg-background-default shadow-1">
            {allLessons.map((l) => (
              <button
                key={l.lessonId}
                type="button"
                onClick={() =>
                  dispatch({
                    type: 'selectLesson',
                    lessonId: l.lessonId,
                  })
                }
                className="flex w-full items-center bg-gray-50 px-250 py-175 font-designer-16r text-gray-800 hover:bg-gray-100"
              >
                {l.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function FeedImageUploader({
  images,
  isUploading,
  inputRef,
  onImagesAdd,
  onImageRemove,
}: {
  images: AttachedImage[];
  isUploading: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onImagesAdd: (files: File[]) => Promise<void>;
  onImageRemove: (index: number) => void;
}) {
  return (
    <div>
      <p className="mb-50 font-designer-14r text-gray-500">
        * 최대 {MAX_IMAGE_COUNT}개의 사진을 등록할 수 있어요.
      </p>
      <div className="flex flex-wrap gap-150">
        {images.map((img, i) => (
          <div key={img.key} className="relative size-1500 shrink-0">
            <Image
              src={img.previewUrl}
              alt={`첨부 이미지 ${i + 1}`}
              fill
              unoptimized
              sizes="150px"
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
        {images.length < MAX_IMAGE_COUNT && (
          <button
            type="button"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
            className={cn(
              'flex size-1500 shrink-0 flex-col items-center justify-center gap-75 rounded-150 border border-border-default bg-gray-200',
              isUploading
                ? 'cursor-not-allowed opacity-50'
                : 'hover:border-rose-400',
            )}
          >
            <Plus className="size-300 text-gray-400" />
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        aria-label="이미지 첨부"
        className="hidden"
        onChange={async (e) => {
          const target = e.target;
          await onImagesAdd(Array.from(target.files ?? []));
          target.value = '';
        }}
      />
    </div>
  );
}

function FeedWriteNotice() {
  return (
    <div className="rounded-200 border border-gray-200 p-200">
      <p className="mb-100 font-designer-16m text-gray-400">유의사항</p>
      <ul className="list-disc space-y-75 pl-300 font-designer-13r text-gray-400">
        {FEED_NOTICE.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function FeedWriteActions({
  isEditMode,
  submitLabel,
  submitPending,
  draftPending,
  onCancel,
  onSaveDraft,
  onSubmit,
}: {
  isEditMode: boolean;
  submitLabel: string;
  submitPending: boolean;
  draftPending: boolean;
  onCancel: () => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="flex gap-200">
      {isEditMode ? (
        <button
          type="button"
          onClick={onCancel}
          className="flex h-775 flex-1 items-center justify-center rounded-100 border border-border-default font-designer-16m text-gray-800"
        >
          취소
        </button>
      ) : (
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={draftPending}
          className="flex h-775 flex-1 items-center justify-center rounded-100 border border-rose-400 font-designer-16m text-rose-500 disabled:opacity-50"
        >
          임시저장
        </button>
      )}
      <button
        type="button"
        onClick={onSubmit}
        disabled={submitPending}
        className="flex h-775 flex-1 items-center justify-center rounded-100 bg-background-brand-default font-designer-16m text-text-inverse disabled:bg-gray-300"
      >
        {submitLabel}
      </button>
    </div>
  );
}

function FeedWriteForm({
  slug,
  editFeedId,
  existingFeed,
}: {
  slug: string;
  editFeedId: number | null;
  existingFeed: BuilderFeedDetailResponse | null;
}) {
  const router = useRouter();
  const showToast = useToastStore((s) => s.showToast);
  const isEditMode = editFeedId !== null;

  // create 모드 임시저장 초안 — 마운트 시 1회 파싱.
  const draftRef = useRef<ReturnType<typeof readCreateDraft> | null>(null);
  if (draftRef.current === null) {
    draftRef.current = existingFeed
      ? { content: '', lessonId: null, feedId: null }
      : readCreateDraft(slug);
  }
  const draft = draftRef.current;

  const course = '바이브 코딩 입문자 코스';
  const [state, dispatch] = useReducer(
    feedWriteReducer,
    { existingFeed, draft },
    createInitialFeedWriteState,
  );
  const {
    courseOpen,
    selectedLessonId,
    lessonOpen,
    text,
    images,
    isUploadingImage,
  } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const draftFeedIdRef = useRef<number | null>(draft.feedId);

  const { data: courseData } = useGetCourseDetail(slug);
  const courseId = courseData?.courseId ?? 0;
  const { data: curriculum } = useGetCourseCurriculum(slug);
  const createFeed = useCreateBuilderFeed();
  const updateFeed = useUpdateBuilderFeed();

  const allLessons =
    curriculum?.chapters.flatMap((ch) =>
      ch.lessons.map((l) => ({
        lessonId: l.lessonId,
        label: `Lesson ${String(l.order).padStart(2, '0')}. ${l.title}`,
      })),
    ) ?? [];

  const selectedLessonLabel =
    allLessons.find((l) => l.lessonId === selectedLessonId)?.label ??
    'Lesson 선택';

  async function handleImagesAdd(files: File[]) {
    if (files.length === 0) {
      return;
    }
    const remainingSlots = Math.max(0, 10 - images.length);
    if (remainingSlots === 0) {
      showToast(`최대 ${MAX_IMAGE_COUNT}장까지 첨부 가능합니다.`, 'error');
      return;
    }
    dispatch({ type: 'setUploadingImage', value: true });
    const nextImages: AttachedImage[] = [];
    const errors: string[] = [];

    try {
      for (const file of files.slice(0, remainingSlots)) {
        try {
          const normalizedFile = await normalizeImageFileForUpload(file);
          const publicUrl = await uploadCommunityMarkdownImage(normalizedFile);
          const key = toCommunityContentImagePath(publicUrl);
          if (!key) {
            throw new Error('업로드 이미지 path를 확인할 수 없습니다.');
          }
          const previewUrl = URL.createObjectURL(normalizedFile);
          nextImages.push({ previewUrl, key });
        } catch (error) {
          errors.push(toAttachmentImageUploadErrorMessage(file, error));
        }
      }

      if (nextImages.length > 0) {
        dispatch({ type: 'addImages', images: nextImages });
      }
      if (files.length > remainingSlots) {
        errors.push(`최대 ${MAX_IMAGE_COUNT}장까지 첨부 가능합니다.`);
      }
      if (errors.length > 0) {
        showToast(errors.join(' '), 'error');
      }
    } finally {
      dispatch({ type: 'setUploadingImage', value: false });
    }
  }

  function handleImageRemove(index: number) {
    const removed = images[index];
    if (removed?.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(removed.previewUrl);
    }
    dispatch({ type: 'removeImage', index });
  }

  function handleSaveDraft() {
    if (!selectedLessonId) {
      showToast('레슨을 선택해주세요.', 'error');
      return;
    }
    if (!hasMeaningfulCommunityMarkdownContent(text) && images.length === 0) {
      showToast(EMPTY_FEED_MESSAGE, 'error');
      return;
    }
    const contentForSubmit =
      normalizeCommunityMarkdownImageSourcesForStorage(text);
    const persistDraft = (feedId: number) => {
      draftFeedIdRef.current = feedId;
      localStorage.setItem(
        `course-feed-draft-${slug}`,
        JSON.stringify({
          content: text,
          lessonId: selectedLessonId,
          feedId,
        }),
      );
      showToast('임시저장되었어요.');
    };
    if (draftFeedIdRef.current) {
      updateFeed.mutate(
        {
          feedId: draftFeedIdRef.current,
          request: {
            content: contentForSubmit,
            imageKeys: images.map((img) => img.key),
            status: 'DRAFT',
          },
        },
        {
          onSuccess: () => persistDraft(draftFeedIdRef.current!),
          onError: () => showToast('임시저장에 실패했어요.', 'error'),
        },
      );
    } else {
      createFeed.mutate(
        {
          courseId,
          request: {
            lessonId: selectedLessonId,
            content: contentForSubmit,
            imageKeys: images.map((img) => img.key),
            status: 'DRAFT',
          },
        },
        {
          onSuccess: (data) => persistDraft(data.feedId),
          onError: () => showToast('임시저장에 실패했어요.', 'error'),
        },
      );
    }
  }

  function handleSubmit() {
    const contentForSubmit =
      normalizeCommunityMarkdownImageSourcesForStorage(text);
    if (isEditMode) {
      if (!hasMeaningfulCommunityMarkdownContent(text) && images.length === 0) {
        showToast(EMPTY_FEED_MESSAGE, 'error');
        return;
      }
      updateFeed.mutate(
        {
          feedId: editFeedId,
          request: {
            content: contentForSubmit,
            imageKeys: images.map((i) => i.key),
            status: 'PUBLISHED',
          },
        },
        {
          onSuccess: () => {
            showToast('피드가 수정되었어요!');
            router.push(`/class/${slug}/feed/${editFeedId}`);
          },
          onError: () => showToast('수정에 실패했어요.', 'error'),
        },
      );
    } else {
      if (!selectedLessonId) {
        showToast('레슨을 선택해주세요.', 'error');
        return;
      }
      if (!hasMeaningfulCommunityMarkdownContent(text) && images.length === 0) {
        showToast(EMPTY_FEED_MESSAGE, 'error');
        return;
      }
      const navigateToPublished = (feedId: number) => {
        localStorage.removeItem(`course-feed-draft-${slug}`);
        showToast('피드가 등록되었어요!');
        router.push(`/class/${slug}/feed/${feedId}`);
      };
      if (draftFeedIdRef.current) {
        const feedId = draftFeedIdRef.current;
        updateFeed.mutate(
          {
            feedId,
            request: {
              content: contentForSubmit,
              imageKeys: images.map((img) => img.key),
              status: 'PUBLISHED',
            },
          },
          {
            onSuccess: () => navigateToPublished(feedId),
            onError: () => showToast('등록에 실패했어요.', 'error'),
          },
        );
      } else {
        createFeed.mutate(
          {
            courseId,
            request: {
              lessonId: selectedLessonId,
              content: contentForSubmit,
              imageKeys: images.map((img) => img.key),
            },
          },
          {
            onSuccess: (data) => navigateToPublished(data.feedId),
            onError: () => showToast('등록에 실패했어요.', 'error'),
          },
        );
      }
    }
  }

  const backHref = isEditMode
    ? `/class/${slug}/feed/${editFeedId}`
    : `/class/${slug}/home?tab=feed`;
  const backLabel = isEditMode ? '피드로 돌아가기' : '빌더 피드 돌아가기';
  const submitLabel = isEditMode ? '수정하기' : '등록하기';
  const submitPending = isEditMode
    ? updateFeed.isPending || isUploadingImage
    : createFeed.isPending || updateFeed.isPending || isUploadingImage;

  return (
    <>
      <div className="w-full pb-800">
        <div className="w-full px-3000 pt-500">
          <Link
            href={backHref}
            className="inline-flex items-center gap-125 font-designer-14m text-gray-800"
          >
            <ArrowLeft className="size-300" />
            {backLabel}
          </Link>
        </div>
        <div className="w-full px-3000">
          <div className="mt-400 space-y-400">
            {/* Course/Lesson selectors — create mode only */}
            {!isEditMode && (
              <FeedCourseSelectors
                course={course}
                courseOpen={courseOpen}
                lessonOpen={lessonOpen}
                selectedLessonLabel={selectedLessonLabel}
                allLessons={allLessons}
                dispatch={dispatch}
              />
            )}

            {/* Image upload */}
            <FeedImageUploader
              images={images}
              isUploading={isUploadingImage}
              inputRef={fileInputRef}
              onImagesAdd={handleImagesAdd}
              onImageRemove={handleImageRemove}
            />

            {/* Text content */}
            <MarkdownEditor
              value={text}
              onChange={(v) => dispatch({ type: 'setText', text: v })}
              uploadImage={uploadCommunityMarkdownImage}
              placeholder={
                isEditMode
                  ? '내용을 수정해주세요.'
                  : '코딩을 하며 다양한 순간을 글로 작성해보세요! 이번 레슨에서 배운 것, 새롭게 알게 된 것을 자유롭게 작성해보세요.'
              }
            />

            {/* Notice */}
            <FeedWriteNotice />

            {/* CTAs */}
            <FeedWriteActions
              isEditMode={isEditMode}
              submitLabel={submitLabel}
              submitPending={submitPending}
              draftPending={
                createFeed.isPending || updateFeed.isPending || isUploadingImage
              }
              onCancel={() => router.push(`/class/${slug}/feed/${editFeedId}`)}
              onSaveDraft={handleSaveDraft}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </>
  );
}
