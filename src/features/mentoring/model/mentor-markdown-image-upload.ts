import { axiosInstance } from '@/api/client/axios';

export interface MentorMarkdownImageUploadTicket {
  uploadUrl: string;
  publicUrl: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const toTrimmedString = (value: unknown) => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
};

const extractUploadTicket = (
  value: unknown,
): MentorMarkdownImageUploadTicket | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }

  const uploadUrl =
    toTrimmedString(value.uploadUrl) ??
    toTrimmedString(value.signedUrl) ??
    toTrimmedString(value.presignedUrl);
  const publicUrl =
    toTrimmedString(value.publicUrl) ??
    toTrimmedString(value.fileUrl) ??
    toTrimmedString(value.url) ??
    (uploadUrl ? uploadUrl.split('?')[0] : undefined);

  if (!uploadUrl || !publicUrl) {
    return undefined;
  }

  return {
    uploadUrl,
    publicUrl,
  };
};

export const requestMentorMarkdownImageUploadTicket = async ({
  fileName,
  fileType,
  fileSize,
}: {
  fileName: string;
  fileType: string;
  fileSize: number;
}) => {
  const extension = fileName.split('.').pop()?.toLowerCase().trim();
  const response = await axiosInstance.post('/files/images', {
    fileName,
    extension,
    contentType: fileType,
    fileSize,
  });
  const body = response.data;
  const ticket =
    extractUploadTicket(body?.content) ??
    extractUploadTicket(body) ??
    extractUploadTicket(body?.data?.content) ??
    extractUploadTicket(body?.data);

  if (!ticket) {
    throw new Error('이미지 업로드 URL 응답 형식이 올바르지 않습니다.');
  }

  return ticket;
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
