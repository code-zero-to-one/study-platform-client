'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Badge from '@/components/common/ui/badge';
import Button from '@/components/common/ui/button';
import { BaseInput, NativeSelect } from '@/components/common/ui/input';
import Pagination from '@/components/common/ui/pagination';
import type {
  AdminCourseStatus,
  AdminCourseSummary,
} from '@/features/admin/course-management/model/admin-course-management-contract';
import {
  useAdminCourseLessonsQuery,
  useAdminCoursesQuery,
  useDeleteAdminCourseMutation,
} from '@/features/admin/course-management/model/use-admin-course-management-query';
import { useToastStore } from '@/stores/use-toast-store';

const COURSE_STATUS_OPTIONS: Array<{
  value: AdminCourseStatus;
  label: string;
  color: 'green' | 'orange' | 'gray';
}> = [
  { value: 'OPEN', label: '공개', color: 'green' },
  { value: 'COMING_SOON', label: '오픈 예정', color: 'orange' },
  { value: 'HIDDEN', label: '비공개', color: 'gray' },
];

const formatDateTime = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const getStatusMeta = (status: AdminCourseStatus) =>
  COURSE_STATUS_OPTIONS.find((option) => option.value === status) ??
  COURSE_STATUS_OPTIONS[2];

const CourseStatusBadge = ({ status }: { status: AdminCourseStatus }) => {
  const meta = getStatusMeta(status);

  return (
    <Badge color={meta.color} shape="rectangle">
      {meta.label}
    </Badge>
  );
};

const AdminCourseSummaryPanel = ({
  selectedCourse,
}: {
  selectedCourse?: AdminCourseSummary;
}) => {
  const lessonsQuery = useAdminCourseLessonsQuery(selectedCourse?.courseId);
  const lessons = lessonsQuery.data ?? [];
  const publishedLessonCount = lessons.filter(
    (lesson) => lesson.isPublished,
  ).length;
  const freeLessonCount = lessons.filter((lesson) => lesson.isFree).length;

  if (!selectedCourse) {
    return (
      <aside className="border-border-default bg-background-default rounded-150 flex min-h-screen flex-col justify-center border p-200">
        <p className="font-designer-18b text-text-default">코스를 선택하세요</p>
        <p className="font-designer-14r text-text-subtle mt-75">
          왼쪽 목록에서 코스를 선택하면 상태, 레슨 수, 수강생 수와 관리 이동
          버튼을 확인할 수 있습니다.
        </p>
      </aside>
    );
  }

  return (
    <aside className="border-border-default bg-background-default rounded-150 flex min-h-screen flex-col border p-200">
      <div className="border-border-subtle border-b pb-150">
        <div className="mb-100 flex items-center justify-between gap-100">
          <CourseStatusBadge status={selectedCourse.status} />
          <span className="font-designer-12r text-text-subtlest">
            ID {selectedCourse.courseId}
          </span>
        </div>
        <h2 className="font-designer-24b text-text-default">
          {selectedCourse.title}
        </h2>
        <p className="font-designer-13r text-text-subtlest mt-50 break-all">
          slug: {selectedCourse.slug}
        </p>
      </div>

      <dl className="mt-150 grid grid-cols-2 gap-x-150 gap-y-125">
        <div>
          <dt className="font-designer-12r text-text-subtle">레슨 수</dt>
          <dd className="font-designer-16b text-text-default mt-25">
            {selectedCourse.lessonCount}개
          </dd>
        </div>
        <div>
          <dt className="font-designer-12r text-text-subtle">수강생 수</dt>
          <dd className="font-designer-16b text-text-default mt-25">
            {selectedCourse.enrolledCount}명
          </dd>
        </div>
        <div>
          <dt className="font-designer-12r text-text-subtle">게시/비게시</dt>
          <dd className="font-designer-16b text-text-default mt-25">
            {lessonsQuery.isLoading
              ? '불러오는 중'
              : `${publishedLessonCount} / ${Math.max(lessons.length - publishedLessonCount, 0)}`}
          </dd>
        </div>
        <div>
          <dt className="font-designer-12r text-text-subtle">무료/유료</dt>
          <dd className="font-designer-16b text-text-default mt-25">
            {lessonsQuery.isLoading
              ? '불러오는 중'
              : `${freeLessonCount} / ${Math.max(lessons.length - freeLessonCount, 0)}`}
          </dd>
        </div>
        <div>
          <dt className="font-designer-12r text-text-subtle">가격</dt>
          <dd className="font-designer-16b text-text-default mt-25">
            상세 편집에서 확인
          </dd>
        </div>
        <div>
          <dt className="font-designer-12r text-text-subtle">수정일</dt>
          <dd className="font-designer-16b text-text-default mt-25">
            {formatDateTime(selectedCourse.updatedAt)}
          </dd>
        </div>
      </dl>

      <div className="mt-200 flex flex-col gap-75">
        <Button
          color="secondary"
          size="small"
          onClick={() => {
            navigator.clipboard
              .writeText(selectedCourse.slug)
              .catch((): undefined => undefined);
            useToastStore
              .getState()
              .showToast('slug를 복사했습니다.', 'success');
          }}
        >
          slug 복사
        </Button>
        <Button asChild size="small">
          <Link href={`/admin/courses/${selectedCourse.courseId}`}>
            코스 정보 편집
          </Link>
        </Button>
        <Button asChild color="secondary" size="small">
          <Link href={`/admin/courses/${selectedCourse.courseId}/lessons`}>
            레슨 관리로 이동
          </Link>
        </Button>
        <Button asChild color="outlined" size="small">
          <Link href="/class/vibe-intro" target="_blank">
            공개 코스 페이지 열기
          </Link>
        </Button>
      </div>

      <p className="font-designer-13r text-text-subtlest mt-auto pt-200">
        코스 count 값은 서버 계산값입니다. 이 화면에서는 직접 입력하지 않습니다.
      </p>
    </aside>
  );
};

export default function AdminCourseListPageClient() {
  const [statusFilter, setStatusFilter] = useState<AdminCourseStatus | ''>('');
  const [accessFilter, setAccessFilter] = useState<'ALL' | 'FREE' | 'PAID'>(
    'ALL',
  );
  const [courseSearch, setCourseSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCourseId, setSelectedCourseId] = useState<
    number | undefined
  >();
  const coursesQuery = useAdminCoursesQuery({
    status: statusFilter || undefined,
    page: page - 1,
    size: 20,
  });
  const deleteCourseMutation = useDeleteAdminCourseMutation();
  const courses = coursesQuery.data?.content ?? [];
  const filteredCourses = useMemo(() => {
    const keyword = courseSearch.trim().toLowerCase();

    return courses.filter((course) => {
      const keywordMatched =
        !keyword ||
        [course.title, course.slug].some((value) =>
          value.toLowerCase().includes(keyword),
        );

      return keywordMatched;
    });
  }, [courseSearch, courses]);
  const selectedCourse =
    courses.find((course) => course.courseId === selectedCourseId) ??
    filteredCourses[0];

  const handleDeleteCourse = (course: AdminCourseSummary) => {
    if (deleteCourseMutation.isPending) return;
    const confirmed = window.confirm(
      `${course.title} 코스를 삭제할까요? 수강 이력이 있으면 실제 삭제되지 않고 비공개 처리됩니다.`,
    );
    if (!confirmed) return;

    deleteCourseMutation.mutate(course.courseId, {
      onSuccess: () => {
        if (selectedCourseId === course.courseId) {
          setSelectedCourseId(undefined);
        }
      },
    });
  };

  return (
    <main className="flex flex-col gap-200 p-200">
      <header className="flex items-start justify-between gap-200">
        <div>
          <h1 className="font-designer-24b text-text-default">코스 관리</h1>
          <p className="font-designer-14r text-text-subtle mt-75">
            코스 목록을 선택하고 요약 정보를 확인합니다. 상세 편집과 레슨 관리는
            선택 코스 기준으로 이동합니다.
          </p>
        </div>
        <Button asChild size="small">
          <Link href="/admin/courses/new">새 코스 등록</Link>
        </Button>
      </header>

      <section className="grid min-h-screen grid-cols-2 gap-200">
        <div className="border-border-default bg-background-default rounded-150 flex min-h-screen flex-col border p-200">
          <div className="mb-150 flex flex-wrap items-end justify-between gap-125">
            <div className="flex flex-wrap items-end gap-100">
              <label className="flex flex-col gap-50">
                <span className="font-designer-13m text-text-subtle">상태</span>
                <NativeSelect
                  value={statusFilter}
                  onChange={(event) => {
                    setPage(1);
                    setStatusFilter(
                      event.target.value as AdminCourseStatus | '',
                    );
                  }}
                >
                  <option value="">전체</option>
                  {COURSE_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </NativeSelect>
              </label>
              <label className="flex flex-col gap-50">
                <span className="font-designer-13m text-text-subtle">
                  유료/무료
                </span>
                <NativeSelect
                  value={accessFilter}
                  onChange={(event) =>
                    setAccessFilter(
                      event.target.value as 'ALL' | 'FREE' | 'PAID',
                    )
                  }
                >
                  <option value="ALL">전체</option>
                  <option value="FREE">무료</option>
                  <option value="PAID">유료</option>
                </NativeSelect>
              </label>
            </div>
            <BaseInput
              size="m"
              value={courseSearch}
              placeholder="코스 제목 또는 slug 검색"
              onValueChange={setCourseSearch}
            />
          </div>

          {accessFilter !== 'ALL' && (
            <p className="font-designer-12r text-text-subtlest mb-100">
              코스 유료/무료 필터는 가격 상세 조회 API 연동 후 실제 필터로
              확장합니다.
            </p>
          )}

          <div className="border-border-default rounded-100 overflow-auto border">
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
                {coursesQuery.isLoading && (
                  <tr>
                    <td
                      className="font-designer-14r text-text-subtle py-300 text-center"
                      colSpan={5}
                    >
                      코스 목록을 불러오는 중입니다.
                    </td>
                  </tr>
                )}
                {!coursesQuery.isLoading && filteredCourses.length === 0 && (
                  <tr>
                    <td
                      className="font-designer-14r text-text-subtle py-300 text-center"
                      colSpan={5}
                    >
                      조건에 맞는 코스가 없습니다.
                    </td>
                  </tr>
                )}
                {filteredCourses.map((course) => (
                  <tr
                    key={course.courseId}
                    className={cn(
                      'border-border-default border-b',
                      selectedCourse?.courseId === course.courseId &&
                        'bg-fill-brand-subtle-default',
                    )}
                  >
                    <td className="p-0">
                      <button
                        className="flex h-full w-full flex-col items-start gap-25 px-150 py-150 text-left"
                        type="button"
                        onClick={() => setSelectedCourseId(course.courseId)}
                      >
                        <span className="font-designer-14m text-text-default">
                          {course.title}
                        </span>
                        <span className="font-designer-13r text-text-subtlest">
                          slug: {course.slug}
                        </span>
                      </button>
                    </td>
                    <td className="py-150 pl-100">
                      <CourseStatusBadge status={course.status} />
                    </td>
                    <td className="font-designer-14r text-text-default py-150 pl-100">
                      {course.lessonCount}개 / {course.enrolledCount}명
                    </td>
                    <td className="font-designer-14r text-text-default py-150 pl-100">
                      {formatDateTime(course.updatedAt)}
                    </td>
                    <td className="py-150 pr-150">
                      <div className="flex justify-end gap-75">
                        <Button asChild color="secondary" size="xsmall">
                          <Link href={`/admin/courses/${course.courseId}`}>
                            수정
                          </Link>
                        </Button>
                        <Button
                          color="outlined"
                          size="xsmall"
                          loading={deleteCourseMutation.isPending}
                          onClick={() => handleDeleteCourse(course)}
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

          {(coursesQuery.data?.totalPages ?? 1) > 1 && (
            <Pagination
              className="mt-200"
              page={page}
              totalPages={coursesQuery.data?.totalPages ?? 1}
              onChangePage={setPage}
            />
          )}
        </div>

        <AdminCourseSummaryPanel selectedCourse={selectedCourse} />
      </section>

      <div className="font-designer-16b text-text-subtle px-50">
        아래로 이동하면 선택 코스 편집 화면으로 이어집니다.
      </div>
    </main>
  );
}
