import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axiosInstanceV5 } from '@/api/client/axios';
import type { AdminLessonDetailResponse } from '@/features/admin/course-management/model/admin-course-management-contract';
import { getAdminLessonDetail } from './admin-course-management-api';

vi.mock('@/api/client/axios', () => ({
  axiosInstanceV5: {
    get: vi.fn(),
  },
}));

const mockedGet = vi.mocked(axiosInstanceV5.get);

const lessonContent: AdminLessonDetailResponse = {
  lessonId: 1,
  chapterNumber: 1,
  lessonNumber: 1,
  title: '1일차 오리엔테이션',
  description: null,
  content: '<p>본문</p>',
  estimatedMinutes: 30,
  retrospectivePurpose: 'PRACTICE_PROOF' as const,
  isFree: true,
  isPublished: true,
};

describe('admin course management api', () => {
  beforeEach(() => {
    mockedGet.mockReset();
  });

  it('unwraps the standard Axios BaseResponse envelope for lesson detail', async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        statusCode: 200,
        timestamp: '2026-05-15T20:00:00',
        content: lessonContent,
        message: null,
      },
    });

    await expect(getAdminLessonDetail(1)).resolves.toMatchObject({
      lessonId: 1,
      content: '<p>본문</p>',
    });
  });

  it('also accepts an already-unwrapped BaseResponse after retry interceptors', async () => {
    mockedGet.mockResolvedValueOnce({
      statusCode: 200,
      timestamp: '2026-05-15T20:00:00',
      content: { ...lessonContent, content: undefined },
      message: null,
    });

    await expect(getAdminLessonDetail(1)).resolves.toMatchObject({
      lessonId: 1,
      content: '',
    });
  });
});
