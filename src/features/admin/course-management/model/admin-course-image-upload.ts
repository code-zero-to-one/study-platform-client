import { axiosInstanceV5 } from '@/api/client/axios';
import type { ApiBaseResponse } from '@/features/admin/course-management/model/admin-course-management-contract';
import { uploadCommunityMarkdownImage } from '@/features/community/model/community-markdown-image-upload';
import { getFileExtension } from '@/utils/markdown-content-images';

interface AdminLessonContentImageUploadUrlResponse {
  uploadUrl: string;
  publicUrl: string;
}

export const uploadAdminCourseImage = async (file: File): Promise<string> => {
  return uploadCommunityMarkdownImage(file);
};

const readUploadError = async (response: Response) => {
  const errorText = (await response.text()).trim();

  if (!errorText) {
    return '이미지 파일 업로드에 실패했습니다.';
  }

  try {
    const parsed = JSON.parse(errorText) as { message?: unknown };
    return typeof parsed.message === 'string'
      ? parsed.message
      : '이미지 파일 업로드에 실패했습니다.';
  } catch {
    return errorText;
  }
};

const getAdminLessonImageExtension = (file: File) => {
  const extension = getFileExtension(file.name);

  if (!extension || extension === 'blob') {
    return file.type.split('/')[1]?.toUpperCase() ?? '';
  }

  return extension.toUpperCase();
};

const uploadLessonContentImageFile = async ({
  uploadUrl,
  file,
}: {
  uploadUrl: string;
  file: File;
}) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await readUploadError(response));
  }
};

export const uploadAdminLessonContentImage = async ({
  lessonId,
  file,
}: {
  lessonId: number;
  file: File;
}): Promise<string> => {
  const extension = getAdminLessonImageExtension(file);

  if (!extension) {
    throw new Error('이미지 파일 확장자를 확인할 수 없습니다.');
  }

  const response = await axiosInstanceV5.post<
    ApiBaseResponse<AdminLessonContentImageUploadUrlResponse>
  >(`admin/lessons/${lessonId}/content-images/upload-url`, null, {
    params: { extension },
  });
  const ticket = response.data.content;

  await uploadLessonContentImageFile({
    uploadUrl: ticket.uploadUrl,
    file,
  });

  return ticket.publicUrl;
};
