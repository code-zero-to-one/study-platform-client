import type { ReactNode } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Button from '@/components/common/ui/button';
import { BaseInput, NativeSelect } from '@/components/common/ui/input';
import Pagination from '@/components/common/ui/pagination';
import type {
  AdminCourseStatus,
  AdminCourseSummary,
} from '@/features/admin/course-management/model/admin-course-management-contract';

interface AdminCourseOverviewContentProps {
  builderFeedCount: number;
  editingLessonId?: number;
  freeLessonCount: number;
  lessonCount: number;
  publishedLessonCount: number;
  qnaCount: number;
  retrospectiveCount: number;
  selectedCourse?: AdminCourseSummary;
  selectedStatusLabel: string;
}

export function AdminCourseOverviewContent({
  builderFeedCount,
  editingLessonId,
  freeLessonCount,
  lessonCount,
  publishedLessonCount,
  qnaCount,
  retrospectiveCount,
  selectedCourse,
  selectedStatusLabel,
}: AdminCourseOverviewContentProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-125 md:grid-cols-4">
        <div className="border-border-default rounded-100 border p-150">
          <p className="font-designer-12r text-text-subtle">코스 상태</p>
          <p className="font-designer-20b text-text-default mt-50">
            {selectedCourse ? selectedStatusLabel : '-'}
          </p>
        </div>
        <div className="border-border-default rounded-100 border p-150">
          <p className="font-designer-12r text-text-subtle">총 레슨</p>
          <p className="font-designer-20b text-text-default mt-50">
            {lessonCount}개
          </p>
        </div>
        <div className="border-border-default rounded-100 border p-150">
          <p className="font-designer-12r text-text-subtle">게시 / 비게시</p>
          <p className="font-designer-20b text-text-default mt-50">
            {publishedLessonCount} /{' '}
            {Math.max(lessonCount - publishedLessonCount, 0)}
          </p>
        </div>
        <div className="border-border-default rounded-100 border p-150">
          <p className="font-designer-12r text-text-subtle">무료 / 유료</p>
          <p className="font-designer-20b text-text-default mt-50">
            {freeLessonCount} / {Math.max(lessonCount - freeLessonCount, 0)}
          </p>
        </div>
      </div>
      {editingLessonId && (
        <div className="mt-125 grid grid-cols-3 gap-125">
          <div className="border-border-default rounded-100 border p-150">
            <p className="font-designer-12r text-text-subtle">선택 레슨 QnA</p>
            <p className="font-designer-20b text-text-default mt-50">
              {qnaCount}개
            </p>
          </div>
          <div className="border-border-default rounded-100 border p-150">
            <p className="font-designer-12r text-text-subtle">
              선택 레슨 돌아보기
            </p>
            <p className="font-designer-20b text-text-default mt-50">
              {retrospectiveCount}개
            </p>
          </div>
          <div className="border-border-default rounded-100 border p-150">
            <p className="font-designer-12r text-text-subtle">
              선택 레슨 Builder Feed
            </p>
            <p className="font-designer-20b text-text-default mt-50">
              {builderFeedCount}개
            </p>
          </div>
        </div>
      )}
    </>
  );
}

interface AdminCourseListContentProps {
  courseSearch: string;
  coursesLoading: boolean;
  filteredCourses: AdminCourseSummary[];
  isCourseSelectionLocked: boolean;
  isSelectedCourseHiddenBySearch: boolean;
  onCopySlug: (slug: string) => void;
  onEditCourse: (course: AdminCourseSummary) => void;
  onDeleteCourse: (course: AdminCourseSummary) => void;
  onResetCourseSearch: () => void;
  onSelectCourse: (courseId: number) => void;
  onSetCourseSearch: (value: string) => void;
  onSetPage: (page: number) => void;
  onSetStatusFilter: (value: AdminCourseStatus | '') => void;
  page: number;
  renderCourseStatusBadge: (status: AdminCourseStatus) => ReactNode;
  selectedCourseId?: number;
  statusFilter: AdminCourseStatus | '';
  statusOptions: Array<{ value: AdminCourseStatus; label: string }>;
  totalCourses: number;
  totalPages: number;
  visibleCourses: AdminCourseSummary[];
  formatDateTime: (value: string) => string;
  deleteCoursePending: boolean;
}

export function AdminCourseListContent({
  courseSearch,
  coursesLoading,
  deleteCoursePending,
  filteredCourses,
  formatDateTime,
  isCourseSelectionLocked,
  isSelectedCourseHiddenBySearch,
  onCopySlug,
  onDeleteCourse,
  onEditCourse,
  onResetCourseSearch,
  onSelectCourse,
  onSetCourseSearch,
  onSetPage,
  onSetStatusFilter,
  page,
  renderCourseStatusBadge,
  selectedCourseId,
  statusFilter,
  statusOptions,
  totalCourses,
  totalPages,
  visibleCourses,
}: AdminCourseListContentProps) {
  return (
    <>
      <div className="mb-150 flex items-center justify-between gap-150">
        <div className="flex items-center gap-100">
          <span className="font-designer-13m text-text-subtle">상태</span>
          <NativeSelect
            disabled={isCourseSelectionLocked}
            value={statusFilter}
            onChange={(event) =>
              onSetStatusFilter(event.target.value as AdminCourseStatus | '')
            }
          >
            <option value="">전체</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="flex items-center gap-100">
          <BaseInput
            size="m"
            disabled={isCourseSelectionLocked}
            value={courseSearch}
            placeholder="코스 제목으로 찾기"
            onValueChange={onSetCourseSearch}
          />
          <span className="font-designer-13r text-text-subtlest">
            총 {totalCourses}개
          </span>
        </div>
      </div>

      <div className="border-border-default rounded-100 overflow-hidden border">
        <table className="w-full">
          <thead className="bg-background-alternative border-border-default border-b">
            <tr>
              <th className="font-designer-13m text-text-subtle py-100 pl-150 text-left">
                코스
              </th>
              <th className="font-designer-13m text-text-subtle py-100 pl-100 text-left">
                상태
              </th>
              <th className="font-designer-13m text-text-subtle py-100 pl-100 text-left">
                레슨/수강
              </th>
              <th className="font-designer-13m text-text-subtle py-100 pl-100 text-left">
                수정일
              </th>
              <th className="py-100 pr-150" />
            </tr>
          </thead>
          <tbody>
            {coursesLoading && (
              <tr>
                <td
                  className="font-designer-14r text-text-subtle py-300 text-center"
                  colSpan={5}
                >
                  코스 목록을 불러오는 중입니다.
                </td>
              </tr>
            )}
            {!coursesLoading && filteredCourses.length === 0 && (
              <tr>
                <td
                  className="font-designer-14r text-text-subtle py-300 text-center"
                  colSpan={5}
                >
                  <div className="flex flex-col items-center gap-100">
                    <span>
                      {visibleCourses.length === 0
                        ? '등록된 코스가 없습니다.'
                        : '검색 조건에 맞는 코스가 없습니다.'}
                    </span>
                    {isSelectedCourseHiddenBySearch && (
                      <div className="flex flex-col items-center gap-75">
                        <span className="font-designer-13r text-text-subtlest">
                          현재 선택된 코스는 검색 결과에서 숨겨져 있습니다.
                        </span>
                        <Button
                          color="secondary"
                          size="xsmall"
                          disabled={isCourseSelectionLocked}
                          onClick={onResetCourseSearch}
                        >
                          검색 초기화
                        </Button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            )}
            {filteredCourses.map((course) => (
              <tr
                key={course.courseId}
                className={cn(
                  'border-border-default border-b',
                  selectedCourseId === course.courseId &&
                    'bg-fill-brand-subtle-default',
                )}
              >
                <td className="p-0">
                  <button
                    className="flex h-full w-full flex-col items-start gap-25 px-150 py-150 text-left"
                    disabled={isCourseSelectionLocked}
                    onClick={() => onSelectCourse(course.courseId)}
                    type="button"
                  >
                    <span className="font-designer-14m text-text-default">
                      {course.title}
                    </span>
                    <span className="font-designer-13r text-text-subtlest">
                      slug: {course.slug} · ID {course.courseId}
                    </span>
                  </button>
                </td>
                <td className="py-150 pl-100">
                  {renderCourseStatusBadge(course.status)}
                </td>
                <td className="font-designer-14r text-text-default py-150 pl-100">
                  {course.lessonCount}개 / {course.enrolledCount}명
                </td>
                <td className="font-designer-14r text-text-default py-150 pl-100">
                  {formatDateTime(course.updatedAt)}
                </td>
                <td className="py-150 pr-150">
                  <div className="flex justify-end gap-75">
                    <Button
                      color="secondary"
                      size="xsmall"
                      onClick={() => onCopySlug(course.slug)}
                    >
                      slug 복사
                    </Button>
                    <Button
                      color="secondary"
                      size="xsmall"
                      disabled={isCourseSelectionLocked}
                      onClick={() => onEditCourse(course)}
                    >
                      수정
                    </Button>
                    <Button
                      color="outlined"
                      size="xsmall"
                      disabled={deleteCoursePending}
                      loading={deleteCoursePending}
                      onClick={() => onDeleteCourse(course)}
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

      {totalPages > 1 && (
        <Pagination
          className="mt-200"
          page={page}
          totalPages={totalPages}
          onChangePage={(nextPage) => {
            if (isCourseSelectionLocked) {
              return;
            }

            onSetPage(nextPage);
          }}
        />
      )}
    </>
  );
}
