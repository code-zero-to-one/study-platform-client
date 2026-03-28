import { getMentorIntroImageUploadTicket } from '@/features/mentoring/api/mentor-api';

export interface MentorMarkdownImageUploadTicket {
  uploadUrl: string;
  publicUrl: string;
}

export const requestMentorMarkdownImageUploadTicket = async ({
  fileName,
}: {
  fileName: string;
}) => {
  return getMentorIntroImageUploadTicket({
    fileName,
  });
};

export const uploadMentorMarkdownImageFile = async ({
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
    throw new Error('이미지 파일 업로드에 실패했습니다.');
  }
};
