import Link from 'next/link';
import type { Dispatch, SetStateAction } from 'react';
import AdminCourseField from '@/components/admin/courses/admin-course-field';
import AdminCourseMarkdownField from '@/components/admin/courses/admin-course-markdown-field';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Badge from '@/components/common/ui/badge';
import Button from '@/components/common/ui/button';
import { BaseInput, NativeSelect } from '@/components/common/ui/input';
import BorderedTextarea from '@/components/common/ui/input/bordered-textarea';
import type {
  AdminLessonBuilderFeedsResponse,
  AdminLessonQnaDetailResponse,
  AdminLessonQnaListItem,
  AdminLessonRetrospectiveResponse,
  AdminLessonSummary,
  AdminLessonUpsertRequest,
  AdminRetrospectivePurpose,
} from '@/features/admin/course-management/model/admin-course-management-contract';
import {
  ADMIN_RETROSPECTIVE_PURPOSE_OPTIONS,
  getAdminRetrospectivePurposeMeta,
} from '@/features/admin/course-management/model/admin-course-presentation';

const RetrospectivePurposeBadge = ({
  purpose,
}: {
  purpose: AdminRetrospectivePurpose;
}) => {
  const meta = getAdminRetrospectivePurposeMeta(purpose);

  return <Badge color={meta.color}>{meta.label}</Badge>;
};

type FormatDateTime = (value: string) => string;

interface AdminLessonManagementContentProps {
  allFilteredLessonsSelected: boolean;
  bulkUpdateLessonsMutationPending: boolean;
  createLessonMutationPending: boolean;
  deleteLessonMutationPending: boolean;
  editingLessonId?: number;
  effectiveCourseId?: number;
  filteredLessons: AdminLessonSummary[];
  handleBulkLessonUpdate: (
    request: { isPublished?: boolean; isFree?: boolean },
    confirmMessage: string,
  ) => void;
  handleDeleteLesson: (lesson: AdminLessonSummary) => void;
  handleEditLesson: (lesson: AdminLessonSummary) => void;
  handleMoveLesson: (lessonId: number, direction: -1 | 1) => void;
  handleSubmitLesson: () => void;
  handleToggleLessonSelection: (lessonId: number) => void;
  handleToggleSelectAllLessons: () => void;
  isLessonContextLocked: boolean;
  isLessonDetailHydrating: boolean;
  isLessonFormLocked: boolean;
  isLessonListFiltered: boolean;
  isLessonListInteractionLocked: boolean;
  lessonAccessFilter: 'ALL' | 'FREE' | 'PAID';
  lessonDetailQueryIsFetching: boolean;
  lessonForm: AdminLessonUpsertRequest;
  lessonFormMode: 'create' | 'edit';
  lessonPublishedFilter: 'ALL' | 'PUBLISHED' | 'UNPUBLISHED';
  lessonSearch: string;
  lessonsQueryIsLoading: boolean;
  lessonEditorStateKey: string;
  reorderLessonsMutationPending: boolean;
  selectedLessonIds: number[];
  setLessonAccessFilter: (value: 'ALL' | 'FREE' | 'PAID') => void;
  setLessonForm: Dispatch<SetStateAction<AdminLessonUpsertRequest>>;
  setLessonPublishedFilter: (
    value: 'ALL' | 'PUBLISHED' | 'UNPUBLISHED',
  ) => void;
  setLessonSearch: (value: string) => void;
  resetLessonForm: () => void;
  updateLessonMutationPending: boolean;
  formatDateTime: FormatDateTime;
}

export function AdminLessonManagementContent({
  allFilteredLessonsSelected,
  bulkUpdateLessonsMutationPending,
  createLessonMutationPending,
  deleteLessonMutationPending,
  editingLessonId,
  effectiveCourseId,
  filteredLessons,
  handleBulkLessonUpdate,
  handleDeleteLesson,
  handleEditLesson,
  handleMoveLesson,
  handleSubmitLesson,
  handleToggleLessonSelection,
  handleToggleSelectAllLessons,
  isLessonContextLocked,
  isLessonDetailHydrating,
  isLessonFormLocked,
  isLessonListFiltered,
  isLessonListInteractionLocked,
  lessonAccessFilter,
  lessonDetailQueryIsFetching,
  lessonForm,
  lessonFormMode,
  lessonPublishedFilter,
  lessonSearch,
  lessonsQueryIsLoading,
  lessonEditorStateKey,
  reorderLessonsMutationPending,
  selectedLessonIds,
  setLessonAccessFilter,
  setLessonForm,
  setLessonPublishedFilter,
  setLessonSearch,
  resetLessonForm,
  updateLessonMutationPending,
  formatDateTime,
}: AdminLessonManagementContentProps) {
  return (
    <>
      <div className="mb-150 flex flex-wrap items-end justify-between gap-100">
        <div className="flex flex-wrap items-end gap-100">
          <AdminCourseField label="레슨 찾기">
            <BaseInput
              size="m"
              disabled={isLessonListInteractionLocked}
              value={lessonSearch}
              placeholder="제목 또는 1-3 같은 순서"
              onValueChange={setLessonSearch}
            />
          </AdminCourseField>
          <AdminCourseField label="게시 필터">
            <NativeSelect
              disabled={isLessonListInteractionLocked}
              value={lessonPublishedFilter}
              onChange={(event) =>
                setLessonPublishedFilter(
                  event.target.value as 'ALL' | 'PUBLISHED' | 'UNPUBLISHED',
                )
              }
            >
              <option value="ALL">전체</option>
              <option value="PUBLISHED">게시만</option>
              <option value="UNPUBLISHED">비게시만</option>
            </NativeSelect>
          </AdminCourseField>
          <AdminCourseField label="무료/유료 필터">
            <NativeSelect
              disabled={isLessonListInteractionLocked}
              value={lessonAccessFilter}
              onChange={(event) =>
                setLessonAccessFilter(
                  event.target.value as 'ALL' | 'FREE' | 'PAID',
                )
              }
            >
              <option value="ALL">전체</option>
              <option value="FREE">무료만</option>
              <option value="PAID">유료만</option>
            </NativeSelect>
          </AdminCourseField>
        </div>
        <div className="flex flex-wrap items-center gap-75">
          <span className="font-designer-13r text-text-subtlest">
            선택 {selectedLessonIds.length}개 / 필터 결과{' '}
            {filteredLessons.length}개
          </span>
          {isLessonListFiltered && (
            <span className="font-designer-12r text-text-subtlest">
              필터 중에는 순서 변경을 잠시 막아둡니다.
            </span>
          )}
          <Button
            color="outlined"
            size="xsmall"
            disabled={
              selectedLessonIds.length === 0 || isLessonListInteractionLocked
            }
            loading={bulkUpdateLessonsMutationPending}
            onClick={() =>
              handleBulkLessonUpdate(
                { isPublished: true },
                '선택한 레슨을 모두 게시 상태로 바꿀까요?',
              )
            }
          >
            일괄 게시
          </Button>
          <Button
            color="outlined"
            size="xsmall"
            disabled={
              selectedLessonIds.length === 0 || isLessonListInteractionLocked
            }
            loading={bulkUpdateLessonsMutationPending}
            onClick={() =>
              handleBulkLessonUpdate(
                { isPublished: false },
                '선택한 레슨을 모두 비게시 상태로 바꿀까요?',
              )
            }
          >
            일괄 비게시
          </Button>
          <Button
            color="outlined"
            size="xsmall"
            disabled={
              selectedLessonIds.length === 0 || isLessonListInteractionLocked
            }
            loading={bulkUpdateLessonsMutationPending}
            onClick={() =>
              handleBulkLessonUpdate(
                { isFree: true },
                '선택한 레슨을 모두 무료로 바꿀까요?',
              )
            }
          >
            일괄 무료
          </Button>
          <Button
            color="outlined"
            size="xsmall"
            disabled={
              selectedLessonIds.length === 0 || isLessonListInteractionLocked
            }
            loading={bulkUpdateLessonsMutationPending}
            onClick={() =>
              handleBulkLessonUpdate(
                { isFree: false },
                '선택한 레슨을 모두 유료로 바꿀까요?',
              )
            }
          >
            일괄 유료
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-200">
        <div className="border-border-default rounded-100 overflow-hidden border">
          <table className="w-full">
            <thead className="bg-background-alternative border-border-default border-b">
              <tr>
                <th className="py-100 pl-150 text-left">
                  <input
                    checked={allFilteredLessonsSelected}
                    disabled={isLessonListInteractionLocked}
                    type="checkbox"
                    onChange={handleToggleSelectAllLessons}
                  />
                </th>
                <th className="font-designer-13m text-text-subtle py-100 pl-150 text-left">
                  순서
                </th>
                <th className="font-designer-13m text-text-subtle py-100 pl-100 text-left">
                  레슨
                </th>
                <th className="font-designer-13m text-text-subtle py-100 pl-100 text-left">
                  상태
                </th>
                <th className="py-100 pr-150" />
              </tr>
            </thead>
            <tbody>
              {lessonsQueryIsLoading && (
                <tr>
                  <td
                    className="font-designer-14r text-text-subtle py-300 text-center"
                    colSpan={5}
                  >
                    레슨을 불러오는 중입니다.
                  </td>
                </tr>
              )}
              {!lessonsQueryIsLoading && filteredLessons.length === 0 && (
                <tr>
                  <td
                    className="font-designer-14r text-text-subtle py-300 text-center"
                    colSpan={5}
                  >
                    조건에 맞는 레슨이 없습니다.
                  </td>
                </tr>
              )}
              {filteredLessons.map((lesson, index) => (
                <tr
                  key={lesson.lessonId}
                  className="border-border-default border-b"
                >
                  <td className="py-150 pl-150 align-top">
                    <input
                      checked={selectedLessonIds.includes(lesson.lessonId)}
                      disabled={isLessonListInteractionLocked}
                      type="checkbox"
                      onChange={() =>
                        handleToggleLessonSelection(lesson.lessonId)
                      }
                    />
                  </td>
                  <td className="font-designer-14r text-text-default py-150 pl-150 align-top">
                    {lesson.chapterNumber}-{lesson.lessonNumber}
                  </td>
                  <td className="py-150 pl-100 align-top">
                    <div className="flex flex-col gap-50">
                      <span className="font-designer-14m text-text-default">
                        {lesson.title}
                      </span>
                      <div className="flex flex-wrap gap-50">
                        <RetrospectivePurposeBadge
                          purpose={lesson.retrospectivePurpose}
                        />
                        <Badge color={lesson.isPublished ? 'green' : 'gray'}>
                          {lesson.isPublished ? '게시' : '비게시'}
                        </Badge>
                        <Badge color={lesson.isFree ? 'blue' : 'gray'}>
                          {lesson.isFree ? '무료' : '유료'}
                        </Badge>
                      </div>
                      <span className="font-designer-13r text-text-subtlest">
                        회고 {lesson.retrospectiveCount}개 · 수정{' '}
                        {formatDateTime(lesson.updatedAt)}
                      </span>
                    </div>
                  </td>
                  <td className="py-150 pl-100 align-top">
                    <p className="font-designer-12r text-text-subtlest">
                      {
                        getAdminRetrospectivePurposeMeta(
                          lesson.retrospectivePurpose,
                        ).helper
                      }
                    </p>
                  </td>
                  <td className="py-150 pr-150 align-top">
                    <div className="flex justify-end gap-50">
                      <Button
                        color="secondary"
                        size="xsmall"
                        disabled={
                          isLessonListFiltered ||
                          index === 0 ||
                          isLessonListInteractionLocked
                        }
                        loading={reorderLessonsMutationPending}
                        onClick={() => handleMoveLesson(lesson.lessonId, -1)}
                      >
                        위
                      </Button>
                      <Button
                        color="secondary"
                        size="xsmall"
                        disabled={
                          isLessonListFiltered ||
                          index === filteredLessons.length - 1 ||
                          isLessonListInteractionLocked
                        }
                        loading={reorderLessonsMutationPending}
                        onClick={() => handleMoveLesson(lesson.lessonId, 1)}
                      >
                        아래
                      </Button>
                      <Button
                        color="secondary"
                        size="xsmall"
                        disabled={isLessonContextLocked}
                        onClick={() => handleEditLesson(lesson)}
                      >
                        수정
                      </Button>
                      <Link
                        className={cn(
                          isLessonContextLocked &&
                            'pointer-events-none opacity-60',
                        )}
                        href={`/admin/courses/lessons/${lesson.lessonId}`}
                      >
                        <Button
                          color="secondary"
                          size="xsmall"
                          disabled={isLessonContextLocked}
                        >
                          상세
                        </Button>
                      </Link>
                      <Button
                        color="outlined"
                        size="xsmall"
                        disabled={isLessonListInteractionLocked}
                        loading={deleteLessonMutationPending}
                        onClick={() => handleDeleteLesson(lesson)}
                      >
                        삭제
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <div className="mb-150 flex items-center justify-between gap-100">
            <div>
              <h3 className="font-designer-18b text-text-default">
                {lessonFormMode === 'create' ? '레슨 생성' : '레슨 수정'}
              </h3>
              {lessonFormMode === 'edit' && editingLessonId && (
                <p className="font-designer-12r text-text-subtlest mt-25">
                  {isLessonDetailHydrating
                    ? '레슨 상세를 불러오는 중이라 잠시 입력이 잠겨 있습니다.'
                    : '레슨 상세를 불러와 본문/돌아보기 목적까지 함께 수정합니다.'}
                </p>
              )}
            </div>
            <Button
              color="outlined"
              size="xsmall"
              disabled={isLessonContextLocked}
              onClick={resetLessonForm}
            >
              새 레슨 입력
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-150">
            <AdminCourseField label="챕터">
              <BaseInput
                size="m"
                type="number"
                min={1}
                disabled={isLessonFormLocked}
                value={String(lessonForm.chapterNumber)}
                onValueChange={(chapterNumber) =>
                  setLessonForm((prev) => ({
                    ...prev,
                    chapterNumber: Number(chapterNumber),
                  }))
                }
              />
            </AdminCourseField>
            <AdminCourseField label="레슨">
              <BaseInput
                size="m"
                type="number"
                min={1}
                disabled={isLessonFormLocked}
                value={String(lessonForm.lessonNumber)}
                onValueChange={(lessonNumber) =>
                  setLessonForm((prev) => ({
                    ...prev,
                    lessonNumber: Number(lessonNumber),
                  }))
                }
              />
            </AdminCourseField>
            <AdminCourseField label="예상 시간(분)">
              <BaseInput
                size="m"
                type="number"
                min={1}
                disabled={isLessonFormLocked}
                value={String(lessonForm.estimatedMinutes)}
                onValueChange={(estimatedMinutes) =>
                  setLessonForm((prev) => ({
                    ...prev,
                    estimatedMinutes: Number(estimatedMinutes),
                  }))
                }
              />
            </AdminCourseField>
          </div>
          <div className="mt-150 flex flex-col gap-150">
            <AdminCourseField label="레슨 제목">
              <BaseInput
                size="m"
                disabled={isLessonFormLocked}
                value={lessonForm.title}
                placeholder="1일차 오리엔테이션"
                onValueChange={(title) =>
                  setLessonForm((prev) => ({ ...prev, title }))
                }
              />
            </AdminCourseField>
            <AdminCourseField
              label="돌아보기 목적"
              helper={
                getAdminRetrospectivePurposeMeta(
                  lessonForm.retrospectivePurpose,
                ).helper
              }
            >
              <NativeSelect
                disabled={isLessonFormLocked}
                value={lessonForm.retrospectivePurpose}
                onChange={(event) =>
                  setLessonForm((prev) => ({
                    ...prev,
                    retrospectivePurpose: event.target
                      .value as AdminRetrospectivePurpose,
                  }))
                }
              >
                {ADMIN_RETROSPECTIVE_PURPOSE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </NativeSelect>
            </AdminCourseField>
            <div className="grid grid-cols-2 gap-150">
              <AdminCourseField label="무료 공개">
                <NativeSelect
                  disabled={isLessonFormLocked}
                  value={lessonForm.isFree ? 'true' : 'false'}
                  onChange={(event) =>
                    setLessonForm((prev) => ({
                      ...prev,
                      isFree: event.target.value === 'true',
                    }))
                  }
                >
                  <option value="false">유료 레슨</option>
                  <option value="true">무료 레슨</option>
                </NativeSelect>
              </AdminCourseField>
              <AdminCourseField label="게시 상태">
                <NativeSelect
                  disabled={isLessonFormLocked}
                  value={lessonForm.isPublished ? 'true' : 'false'}
                  onChange={(event) =>
                    setLessonForm((prev) => ({
                      ...prev,
                      isPublished: event.target.value === 'true',
                    }))
                  }
                >
                  <option value="false">비게시</option>
                  <option value="true">게시</option>
                </NativeSelect>
              </AdminCourseField>
            </div>
            <AdminCourseMarkdownField
              editorStateKey={lessonEditorStateKey}
              value={lessonForm.content}
              helper="긴 레슨 본문은 마크다운/리치 텍스트 에디터로 작성합니다. 저장 값은 그대로 public 레슨 상세에 노출됩니다."
              isHydrating={isLessonFormLocked}
              hydratingText={
                createLessonMutationPending
                  ? '레슨 저장 중입니다.'
                  : '레슨 본문을 불러오는 중입니다.'
              }
              placeholder="레슨 본문을 작성하세요. 마크다운/이미지 붙여넣기, 드래그 앤 드롭, 코드블록, 제목을 사용할 수 있습니다."
              onChange={(content) =>
                setLessonForm((prev) => ({
                  ...prev,
                  content,
                }))
              }
            />
          </div>
          <div className="mt-150 flex justify-end gap-75">
            <Button
              color="outlined"
              size="small"
              disabled={isLessonContextLocked}
              onClick={resetLessonForm}
            >
              초기화
            </Button>
            <Button
              size="small"
              disabled={!effectiveCourseId || isLessonFormLocked}
              loading={
                lessonDetailQueryIsFetching ||
                createLessonMutationPending ||
                updateLessonMutationPending
              }
              onClick={handleSubmitLesson}
            >
              {lessonFormMode === 'create' ? '레슨 생성' : '레슨 저장'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

interface AdminLessonRetrospectivesContentProps {
  editingLessonId?: number;
  lessonRetrospectives?: AdminLessonRetrospectiveResponse['retrospectives'];
  lessonRetrospectivesLoading: boolean;
  formatDateTime: FormatDateTime;
}

export function AdminLessonRetrospectivesContent({
  editingLessonId,
  lessonRetrospectives,
  lessonRetrospectivesLoading,
  formatDateTime,
}: AdminLessonRetrospectivesContentProps) {
  if (!editingLessonId) {
    return (
      <p className="font-designer-14r text-text-subtle">
        현재 선택된 레슨이 없습니다. 레슨 목록에서 수정 버튼을 눌러 제출 내역을
        확인하세요.
      </p>
    );
  }

  if (lessonRetrospectivesLoading) {
    return (
      <p className="font-designer-14r text-text-subtle">
        돌아보기 제출 목록을 불러오는 중입니다.
      </p>
    );
  }

  if ((lessonRetrospectives?.length ?? 0) === 0) {
    return (
      <p className="font-designer-14r text-text-subtle">
        아직 제출된 돌아보기가 없습니다.
      </p>
    );
  }

  return (
    <div className="grid gap-125">
      {lessonRetrospectives?.map((retro) => (
        <article
          key={retro.retrospectiveId}
          className="border-border-default rounded-100 border p-150"
        >
          <div className="mb-75 flex flex-wrap items-center gap-75">
            <Badge
              color={retro.purpose === 'SUBJECTIVE_QUIZ' ? 'orange' : 'blue'}
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
            <p className="font-designer-13r text-text-brand mb-75 break-all underline">
              {retro.artifactValue}
            </p>
          )}
          <p className="font-designer-14r text-text-default whitespace-pre-wrap">
            {retro.content}
          </p>
        </article>
      ))}
    </div>
  );
}

interface AdminLessonBuilderFeedContentProps {
  editingLessonId?: number;
  feeds?: AdminLessonBuilderFeedsResponse['feeds'];
  isAwaitingBuilderFeedRefresh: boolean;
  isLoading: boolean;
  builderFeedOrderDrafts: Record<number, string>;
  setBuilderFeedOrderDrafts: Dispatch<SetStateAction<Record<number, string>>>;
  handleToggleBuilderFeedCuration: (args: {
    feedId: number;
    currentOperatorPick: boolean;
    currentFeatured: boolean;
    nextOperatorPick?: boolean;
    nextFeatured?: boolean;
  }) => void;
  formatDateTime: FormatDateTime;
}

export function AdminLessonBuilderFeedContent({
  editingLessonId,
  feeds,
  isAwaitingBuilderFeedRefresh,
  isLoading,
  builderFeedOrderDrafts,
  setBuilderFeedOrderDrafts,
  handleToggleBuilderFeedCuration,
  formatDateTime,
}: AdminLessonBuilderFeedContentProps) {
  if (!editingLessonId) {
    return (
      <p className="font-designer-14r text-text-subtle">
        현재 선택된 레슨이 없습니다. 레슨 목록에서 수정 버튼을 눌러 Builder Feed
        운영 대상을 선택하세요.
      </p>
    );
  }

  if (isLoading) {
    return (
      <p className="font-designer-14r text-text-subtle">
        Builder Feed 목록을 불러오는 중입니다.
      </p>
    );
  }

  if ((feeds?.length ?? 0) === 0) {
    return (
      <p className="font-designer-14r text-text-subtle">
        아직 이 레슨에 연결된 Builder Feed가 없습니다.
      </p>
    );
  }

  return (
    <div className="grid gap-125">
      {feeds?.map((feed) => (
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
              {feed.nickname} · member {feed.memberId} · 좋아요 {feed.likeCount}{' '}
              · 댓글 {feed.commentCount} · {formatDateTime(feed.createdAt)}
            </span>
          </div>

          <p className="font-designer-14r text-text-default whitespace-pre-wrap">
            {feed.content}
          </p>

          {feed.imageUrls.length > 0 && (
            <div className="mt-100 flex flex-col gap-50">
              {feed.imageUrls.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-designer-13m text-text-brand underline"
                >
                  이미지 열기
                </a>
              ))}
            </div>
          )}

          <div className="mt-125 flex flex-wrap items-end gap-100">
            <Button
              color={feed.operatorPick ? 'secondary' : 'outlined'}
              size="xsmall"
              disabled={isAwaitingBuilderFeedRefresh}
              loading={isAwaitingBuilderFeedRefresh}
              onClick={() =>
                handleToggleBuilderFeedCuration({
                  feedId: feed.feedId,
                  currentOperatorPick: feed.operatorPick,
                  currentFeatured: feed.featured,
                  nextOperatorPick: !feed.operatorPick,
                })
              }
            >
              {feed.operatorPick ? 'operator pick 해제' : 'operator pick 지정'}
            </Button>
            <Button
              color={feed.featured ? 'secondary' : 'outlined'}
              size="xsmall"
              disabled={isAwaitingBuilderFeedRefresh}
              loading={isAwaitingBuilderFeedRefresh}
              onClick={() =>
                handleToggleBuilderFeedCuration({
                  feedId: feed.feedId,
                  currentOperatorPick: feed.operatorPick,
                  currentFeatured: feed.featured,
                  nextFeatured: !feed.featured,
                })
              }
            >
              {feed.featured ? 'showcase 해제' : 'showcase 지정'}
            </Button>
            <label className="flex items-center gap-75">
              <span className="font-designer-12r text-text-subtle">
                showcase 순서
              </span>
              <BaseInput
                size="m"
                type="number"
                min={1}
                disabled={isAwaitingBuilderFeedRefresh}
                value={builderFeedOrderDrafts[feed.feedId] ?? ''}
                onValueChange={(value) =>
                  setBuilderFeedOrderDrafts((prev) => ({
                    ...prev,
                    [feed.feedId]: value,
                  }))
                }
              />
            </label>
            <Button
              color="secondary"
              size="xsmall"
              disabled={!feed.featured || isAwaitingBuilderFeedRefresh}
              loading={isAwaitingBuilderFeedRefresh}
              onClick={() =>
                handleToggleBuilderFeedCuration({
                  feedId: feed.feedId,
                  currentOperatorPick: feed.operatorPick,
                  currentFeatured: feed.featured,
                  nextFeatured: true,
                })
              }
            >
              순서 저장
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}

interface AdminLessonQnaContentProps {
  qnaCount: number;
  qnas?: AdminLessonQnaListItem[];
  selectedQna?: AdminLessonQnaDetailResponse;
  selectedQnaId?: number;
  qnaAnswerContent: string;
  qnaDetailLoading: boolean;
  qnaListLoading: boolean;
  answerMutationPending: boolean;
  editingLessonId?: number;
  setQnaAnswerContent: (value: string) => void;
  setSelectedQnaId: (value: number) => void;
  handleSubmitQnaAnswer: () => void;
  formatDateTime: FormatDateTime;
}

export function AdminLessonQnaContent({
  qnaCount,
  qnas,
  selectedQna,
  selectedQnaId,
  qnaAnswerContent,
  qnaDetailLoading,
  qnaListLoading,
  answerMutationPending,
  editingLessonId,
  setQnaAnswerContent,
  setSelectedQnaId,
  handleSubmitQnaAnswer,
  formatDateTime,
}: AdminLessonQnaContentProps) {
  if (!editingLessonId) {
    return (
      <p className="font-designer-14r text-text-subtle">
        현재 선택된 레슨이 없습니다. 레슨 목록에서 수정 버튼을 눌러 QnA 관리
        대상을 선택하세요.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-200">
      <div className="border-border-default rounded-100 overflow-hidden border">
        <div className="border-border-default bg-background-alternative border-b px-150 py-100">
          <p className="font-designer-13m text-text-subtle">
            질문 목록 · {qnaCount}개
          </p>
        </div>
        <div className="max-h-modal flex flex-col overflow-y-auto">
          {qnaListLoading && (
            <p className="font-designer-14r text-text-subtle p-150">
              질문을 불러오는 중입니다.
            </p>
          )}
          {!qnaListLoading && (qnas?.length ?? 0) === 0 && (
            <p className="font-designer-14r text-text-subtle p-150">
              등록된 질문이 없습니다.
            </p>
          )}
          {qnas?.map((qna) => (
            <button
              key={qna.qnaId}
              disabled={answerMutationPending}
              type="button"
              onClick={() => setSelectedQnaId(qna.qnaId)}
              className={cn(
                'border-border-default flex flex-col items-start gap-50 border-b px-150 py-125 text-left',
                selectedQnaId === qna.qnaId && 'bg-fill-brand-subtle-default',
              )}
            >
              <div className="flex w-full items-center justify-between gap-100">
                <span className="font-designer-14m text-text-default">
                  {qna.title}
                </span>
                <Badge
                  color={qna.author.role === 'MANAGER' ? 'orange' : 'blue'}
                >
                  {qna.author.role}
                </Badge>
              </div>
              <p className="font-designer-12r text-text-subtlest">
                {qna.author.nickname} · 답변 {qna.answerCount}개 · 조회{' '}
                {qna.viewCount} · {formatDateTime(qna.createdAt)}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="border-border-default rounded-100 border p-150">
        {qnaDetailLoading ? (
          <p className="font-designer-14r text-text-subtle">
            질문 상세를 불러오는 중입니다.
          </p>
        ) : !selectedQna ? (
          <p className="font-designer-14r text-text-subtle">
            왼쪽에서 질문을 선택하세요.
          </p>
        ) : (
          <div className="flex flex-col gap-150">
            <div>
              <div className="flex items-center gap-75">
                <h3 className="font-designer-18b text-text-default">
                  {selectedQna.title}
                </h3>
                <Badge
                  color={
                    selectedQna.author.role === 'MANAGER' ? 'orange' : 'blue'
                  }
                >
                  {selectedQna.author.role}
                </Badge>
              </div>
              <p className="font-designer-12r text-text-subtlest mt-50">
                작성자 {selectedQna.author.nickname} · 조회{' '}
                {selectedQna.viewCount} ·{' '}
                {formatDateTime(selectedQna.createdAt)}
              </p>
            </div>
            <div className="border-border-subtle rounded-100 border p-125">
              <p className="font-designer-14r text-text-default whitespace-pre-wrap">
                {selectedQna.content}
              </p>
              {selectedQna.imageUrls.length > 0 && (
                <div className="mt-125 flex flex-col gap-50">
                  {selectedQna.imageUrls.map((url) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-designer-13m text-text-brand underline"
                    >
                      첨부 이미지 열기
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-100">
              <h4 className="font-designer-16b text-text-default">
                답변 {selectedQna.answers.length}개
              </h4>
              {selectedQna.answers.length === 0 && (
                <p className="font-designer-14r text-text-subtle">
                  아직 등록된 답변이 없습니다.
                </p>
              )}
              {selectedQna.answers.map((answer) => (
                <div
                  key={answer.answerId}
                  className="border-border-subtle rounded-100 border p-125"
                >
                  <div className="mb-50 flex items-center gap-75">
                    <Badge
                      color={
                        answer.author.role === 'MANAGER' ? 'orange' : 'blue'
                      }
                    >
                      {answer.author.role}
                    </Badge>
                    <span className="font-designer-13m text-text-default">
                      {answer.author.nickname}
                    </span>
                    <span className="font-designer-12r text-text-subtlest">
                      {formatDateTime(answer.createdAt)}
                    </span>
                  </div>
                  <p className="font-designer-14r text-text-default whitespace-pre-wrap">
                    {answer.content}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-100">
              <AdminCourseField label="관리자 답변">
                <BorderedTextarea
                  disabled={answerMutationPending}
                  value={qnaAnswerContent}
                  placeholder="운영자/매니저 답변을 입력하세요."
                  onChange={(event) => setQnaAnswerContent(event.target.value)}
                />
              </AdminCourseField>
              <div className="flex justify-end">
                <Button
                  size="small"
                  disabled={answerMutationPending}
                  loading={answerMutationPending}
                  onClick={handleSubmitQnaAnswer}
                >
                  답변 등록
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
