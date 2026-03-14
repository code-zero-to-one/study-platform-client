import {
  issueMentoringMessageAttachmentUploadTicket,
  type MentoringAttachmentUploadTicket,
} from '@/features/mentoring/api/mentoring-lifecycle-api';

export const requestMentoringMessageAttachmentUploadTicket = async ({
  fileName,
  fileType,
  fileSize,
  attachmentType,
}: {
  fileName: string;
  fileType: string;
  fileSize: number;
  attachmentType: 'FILE' | 'INLINE_IMAGE';
}): Promise<MentoringAttachmentUploadTicket> => {
  return issueMentoringMessageAttachmentUploadTicket({
    fileName,
    fileSize,
    mimeType: fileType || 'application/octet-stream',
    attachmentType,
  });
};

export const uploadMentoringMessageAttachmentFile = async ({
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
    throw new Error('첨부파일 업로드에 실패했습니다.');
  }
};
