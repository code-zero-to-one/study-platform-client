import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  axiosInstanceForMultipartV5,
  axiosInstanceV5,
} from '@/api/client/axios';
import type { AdminLessonDetailResponse } from '@/features/admin/course-management/model/admin-course-management-contract';
import {
  createAdminLessonsFromNotionZips,
  getAdminLessonDetail,
  importAdminLessonContentZip,
} from './admin-course-management-api';

vi.mock('@/api/client/axios', () => ({
  axiosInstanceForMultipartV5: {
    post: vi.fn(),
  },
  axiosInstanceV5: {
    get: vi.fn(),
  },
}));

const mockedGet = vi.mocked(axiosInstanceV5.get);
const mockedMultipartPost = vi.mocked(axiosInstanceForMultipartV5.post);

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
    mockedMultipartPost.mockReset();
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

  it('imports a single Notion ZIP with the expected L-10A field name', async () => {
    const file = new File(['zip'], 'lesson.zip', { type: 'application/zip' });
    mockedMultipartPost.mockResolvedValueOnce({
      data: {
        statusCode: 200,
        timestamp: '2026-05-18T10:00:00',
        content: lessonContent,
        message: null,
      },
    });

    await expect(
      importAdminLessonContentZip({ lessonId: 11, file }),
    ).resolves.toMatchObject({ lessonId: 1 });

    const [url, formData] = mockedMultipartPost.mock.calls[0];
    expect(url).toBe('admin/lessons/11/imports/notion-zip');
    expect(formData).toBeInstanceOf(FormData);
    expect((formData as FormData).get('file')).toBe(file);
  });

  it('creates lessons from multiple Notion ZIPs with repeated files fields', async () => {
    const files = [
      new File(['zip-a'], 'lesson-a.zip', { type: 'application/zip' }),
      new File(['zip-b'], 'lesson-b.zip', { type: 'application/zip' }),
    ];
    mockedMultipartPost.mockResolvedValueOnce({
      data: {
        statusCode: 201,
        timestamp: '2026-05-18T10:00:00',
        content: {
          lessonCount: 2,
          lessons: [
            {
              lessonId: 101,
              chapterNumber: 1,
              lessonNumber: 4,
              title: 'AI 공방 설치 I',
            },
            {
              lessonId: 102,
              chapterNumber: 1,
              lessonNumber: 5,
              title: 'AI 공방 설치 II',
            },
          ],
        },
        message: null,
      },
    });

    await expect(
      createAdminLessonsFromNotionZips({ courseId: 7, files }),
    ).resolves.toMatchObject({ lessonCount: 2 });

    const [url, formData] = mockedMultipartPost.mock.calls[0];
    expect(url).toBe('admin/courses/7/lessons/imports/notion-zips');
    expect((formData as FormData).getAll('files')).toEqual(files);
  });
});
