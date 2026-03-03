import { getMentorIntroImageUploadTicket } from '@/features/mentoring/api/mentor-api';

export interface MentorMarkdownImageUploadTicket {
  uploadUrl: string;
  publicUrl: string;
}

export const requestMentorMarkdownImageUploadTicket = async ({
  fileName,
  fileType: _fileType,
  fileSize: _fileSize,
}: {
  fileName: string;
  fileType: string;
  fileSize: number;
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
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: file.type
      ? {
          'Content-Type': file.type,
        }
      : undefined,
    body: file,
  });

  if (!response.ok) {
    throw new Error('이미지 파일 업로드에 실패했습니다.');
  }
};
