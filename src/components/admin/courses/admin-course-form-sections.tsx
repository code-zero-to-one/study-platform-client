import type { ChangeEvent } from 'react';
import AdminCourseField from '@/components/admin/courses/admin-course-field';
import AdminCourseThumbnailField from '@/components/admin/courses/admin-course-thumbnail-field';
import Button from '@/components/common/ui/button';
import { BaseInput, NativeSelect } from '@/components/common/ui/input';
import BorderedTextarea from '@/components/common/ui/input/bordered-textarea';
import type {
  AdminCourseFormValues,
  AdminCourseStatus,
} from '@/features/admin/course-management/model/admin-course-management-contract';

interface AdminCourseFormContentProps {
  courseForm: AdminCourseFormValues;
  courseFormMode: 'create' | 'edit';
  courseThumbnailFileName?: string;
  courseThumbnailHasFile: boolean;
  courseThumbnailPreviewUrl?: string;
  courseThumbnailStatusText: string;
  handleChangeCourseThumbnail: (event: ChangeEvent<HTMLInputElement>) => void;
  handleClearCourseThumbnailSelection: () => void;
  handleQuickCourseStatusChange: (status: AdminCourseStatus) => void;
  handleSubmitCourse: () => void;
  isCourseFormLocked: boolean;
  isQuickCourseStatusChangeEnabled: boolean;
  isUploadingCourseThumbnail: boolean;
  resetCourseForm: () => void;
  selectedCourseStatus?: AdminCourseStatus;
  statusOptions: Array<{ value: AdminCourseStatus; label: string }>;
  thumbnailAccept: string;
  updateCourseFormField: <K extends keyof AdminCourseFormValues>(
    key: K,
    value: AdminCourseFormValues[K],
  ) => void;
  toDateTimeLocal: (value?: string) => string;
  toKstOffsetDateTime: (value: string) => string | undefined;
  updateCoursePending: boolean;
}

export function AdminCourseFormContent({
  courseForm,
  courseFormMode,
  courseThumbnailFileName,
  courseThumbnailHasFile,
  courseThumbnailPreviewUrl,
  courseThumbnailStatusText,
  handleChangeCourseThumbnail,
  handleClearCourseThumbnailSelection,
  handleQuickCourseStatusChange,
  handleSubmitCourse,
  isCourseFormLocked,
  isQuickCourseStatusChangeEnabled,
  isUploadingCourseThumbnail,
  resetCourseForm,
  selectedCourseStatus,
  statusOptions,
  thumbnailAccept,
  toDateTimeLocal,
  toKstOffsetDateTime,
  updateCourseFormField,
  updateCoursePending,
}: AdminCourseFormContentProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-150">
        <AdminCourseField
          label="Slug"
          helper="소문자, 숫자, 하이픈만 허용됩니다. 운영용 식별자이며 코스 찾기는 목록 선택으로 진행합니다."
        >
          <BaseInput
            size="m"
            disabled={isCourseFormLocked}
            value={courseForm.slug}
            placeholder="class-v0-6"
            onValueChange={(slug) => updateCourseFormField('slug', slug)}
          />
        </AdminCourseField>
        <AdminCourseField label="상태">
          <NativeSelect
            disabled={isCourseFormLocked}
            value={courseForm.status}
            onChange={(event) =>
              updateCourseFormField(
                'status',
                event.target.value as AdminCourseStatus,
              )
            }
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
        </AdminCourseField>
        <AdminCourseField label="제목">
          <BaseInput
            size="m"
            disabled={isCourseFormLocked}
            value={courseForm.title}
            placeholder="제로원 클래스"
            onValueChange={(title) => updateCourseFormField('title', title)}
          />
        </AdminCourseField>
        <AdminCourseField
          label="카드 헤드라인"
          helper="코스 카드 상단에 짧게 노출할 한 줄 메시지입니다."
        >
          <BaseInput
            size="m"
            disabled={isCourseFormLocked}
            value={courseForm.cardHeadline}
            placeholder="퇴근 후 바로 만드는 바이브 코딩"
            onValueChange={(cardHeadline) =>
              updateCourseFormField('cardHeadline', cardHeadline)
            }
          />
        </AdminCourseField>
        <AdminCourseField
          label="카드 요약"
          helper="코스 카드 본문에 노출할 1~2줄 요약입니다."
        >
          <BaseInput
            size="m"
            disabled={isCourseFormLocked}
            value={courseForm.cardSummary}
            placeholder="5일 동안 MVP를 완성하는 실전형 클래스"
            onValueChange={(cardSummary) =>
              updateCourseFormField('cardSummary', cardSummary)
            }
          />
        </AdminCourseField>
        <AdminCourseField
          label="정가"
          helper="정가와 현재 할인가를 각각 입력합니다."
        >
          <BaseInput
            size="m"
            type="number"
            min={0}
            disabled={isCourseFormLocked}
            value={courseForm.regularPrice}
            placeholder="59900"
            onValueChange={(regularPrice) =>
              updateCourseFormField('regularPrice', regularPrice)
            }
          />
        </AdminCourseField>
        <AdminCourseField label="할인가">
          <BaseInput
            size="m"
            type="number"
            min={0}
            disabled={isCourseFormLocked}
            value={courseForm.discountPrice}
            placeholder="39900"
            onValueChange={(discountPrice) =>
              updateCourseFormField('discountPrice', discountPrice)
            }
          />
        </AdminCourseField>
        <AdminCourseField label="기간(일)" helper="durationDays로 저장됩니다.">
          <BaseInput
            size="m"
            type="number"
            min={1}
            disabled={isCourseFormLocked}
            value={courseForm.durationDays}
            placeholder="5"
            onValueChange={(durationDays) =>
              updateCourseFormField('durationDays', durationDays)
            }
          />
        </AdminCourseField>
      </div>
      <div className="mt-150 flex flex-col gap-150">
        <AdminCourseField
          label="빠른 상태 변경"
          helper={
            courseFormMode === 'edit'
              ? '비공개(HIDDEN)로 바꾼 뒤에도 다시 오픈 예정/공개로 변경할 수 있습니다.'
              : '기존 코스를 수정 중일 때만 사용할 수 있습니다.'
          }
        >
          <div className="flex flex-wrap gap-75">
            {statusOptions.map((option) => (
              <Button
                key={option.value}
                color={
                  selectedCourseStatus === option.value
                    ? 'secondary'
                    : 'outlined'
                }
                size="xsmall"
                disabled={
                  !isQuickCourseStatusChangeEnabled || isCourseFormLocked
                }
                loading={
                  updateCoursePending && selectedCourseStatus !== option.value
                }
                onClick={() => handleQuickCourseStatusChange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </AdminCourseField>
        <AdminCourseField
          label="썸네일 이미지"
          helper="코스 목록 카드에 노출되는 대표 이미지입니다. URL 직접 입력 대신 이미지 파일을 첨부하면 저장 시 자동 업로드됩니다."
        >
          <AdminCourseThumbnailField
            accept={thumbnailAccept}
            canClear={courseThumbnailHasFile}
            fileName={courseThumbnailFileName}
            isUploading={isCourseFormLocked}
            previewUrl={courseThumbnailPreviewUrl}
            statusText={courseThumbnailStatusText}
            onChange={handleChangeCourseThumbnail}
            onClear={handleClearCourseThumbnailSelection}
          />
        </AdminCourseField>
        <AdminCourseField label="얼리버드 종료 시각(KST)">
          <BaseInput
            size="m"
            type="datetime-local"
            disabled={isCourseFormLocked}
            value={toDateTimeLocal(courseForm.earlyBirdEndsAt)}
            onValueChange={(value) =>
              updateCourseFormField(
                'earlyBirdEndsAt',
                toKstOffsetDateTime(value) ?? null,
              )
            }
          />
        </AdminCourseField>
        <AdminCourseField
          label="카드 태그"
          helper="쉼표 또는 줄바꿈으로 여러 태그를 구분합니다. 카드 인원/학습/추천/탐색 카운트는 서버 계산값이라 여기서 입력하지 않습니다."
        >
          <BorderedTextarea
            disabled={isCourseFormLocked}
            value={courseForm.cardTags}
            placeholder="혜택, Claude Pro 1개월 Gift"
            onChange={(event) =>
              updateCourseFormField('cardTags', event.target.value)
            }
          />
        </AdminCourseField>
        <AdminCourseField label="설명">
          <BorderedTextarea
            disabled={isCourseFormLocked}
            value={courseForm.description}
            placeholder="공개 상세 화면에 노출될 클래스 소개를 입력하세요."
            onChange={(event) =>
              updateCourseFormField('description', event.target.value)
            }
          />
        </AdminCourseField>
      </div>
      <div className="mt-150 flex justify-end gap-75">
        <Button
          color="outlined"
          size="small"
          disabled={isCourseFormLocked}
          onClick={resetCourseForm}
        >
          초기화
        </Button>
        <Button
          size="small"
          disabled={isCourseFormLocked}
          loading={isCourseFormLocked}
          onClick={handleSubmitCourse}
        >
          {isUploadingCourseThumbnail
            ? '썸네일 업로드 중...'
            : courseFormMode === 'create'
              ? '코스 생성'
              : '코스 저장'}
        </Button>
      </div>
    </>
  );
}

interface AdminCourseCompletionMessageContentProps {
  completionMessage: string;
  completionMessageHydrating: boolean;
  completionMessageUpdatedAt?: string;
  effectiveCourseId?: number;
  formatDateTime: (value?: string) => string;
  onChangeCompletionMessage: (value: string) => void;
  onSaveCompletionMessage: () => void;
  upsertCompletionMessagePending: boolean;
}

export function AdminCourseCompletionMessageContent({
  completionMessage,
  completionMessageHydrating,
  completionMessageUpdatedAt,
  effectiveCourseId,
  formatDateTime,
  onChangeCompletionMessage,
  onSaveCompletionMessage,
  upsertCompletionMessagePending,
}: AdminCourseCompletionMessageContentProps) {
  return (
    <>
      <BorderedTextarea
        disabled={
          !effectiveCourseId ||
          completionMessageHydrating ||
          upsertCompletionMessagePending
        }
        value={completionMessage}
        placeholder="완주를 축하합니다! 다음 단계로 이어갈 수 있도록 안내 메시지를 입력하세요."
        onChange={(event) => onChangeCompletionMessage(event.target.value)}
      />
      <div className="mt-150 flex items-center justify-between gap-100">
        <span className="font-designer-13r text-text-subtlest">
          {completionMessageHydrating
            ? '완주 메시지를 불러오는 중입니다.'
            : `마지막 저장: ${formatDateTime(completionMessageUpdatedAt)}`}
        </span>
        <Button
          size="small"
          disabled={
            !effectiveCourseId ||
            completionMessageHydrating ||
            upsertCompletionMessagePending
          }
          loading={upsertCompletionMessagePending}
          onClick={onSaveCompletionMessage}
        >
          메시지 저장
        </Button>
      </div>
    </>
  );
}
