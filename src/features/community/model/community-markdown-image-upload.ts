import { isApiError } from '@/api/client/api-error';
import { createCommunityContentImageUploadTicket } from '@/features/community/api/community-api';
import { getCommunityContentImageUploadErrorMessage } from '@/features/community/api/community-api';
import { registerCommunityMarkdownTrustedImageUrl } from '@/types/community/markdown';

const readCommunityUploadError = async (response: Response) => {
  const errorText = (await response.text()).trim();

  if (!errorText) {
    return undefined;
  }

  try {
    return JSON.parse(errorText);
  } catch {
    return new Error(errorText);
  }
};

export interface CommunityMarkdownImageUploadTicket {
  uploadUrl: string;
  publicUrl: string;
}

export const requestCommunityMarkdownImageUploadTicket = async ({
  fileName,
  fileSize: _fileSize,
  fileType,
}: {
  fileName: string;
  fileType: string;
  fileSize: number;
}) => {
  try {
    const ticket = await createCommunityContentImageUploadTicket({
      fileName,
      fileType,
    });

    registerCommunityMarkdownTrustedImageUrl(ticket.publicUrl);

    return ticket;
  } catch (error) {
    throw new Error(
      getCommunityContentImageUploadErrorMessage(
        error,
        '커뮤니티 이미지 업로드 준비에 실패했습니다.',
      ),
    );
  }
};

export const uploadCommunityMarkdownImageFile = async ({
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
    const uploadError = await readCommunityUploadError(response);

    if (isApiError(uploadError)) {
      throw new Error(
        getCommunityContentImageUploadErrorMessage(
          uploadError,
          '커뮤니티 이미지 업로드에 실패했습니다.',
        ),
      );
    }

    throw new Error(
      getCommunityContentImageUploadErrorMessage(
        uploadError,
        '커뮤니티 이미지 업로드에 실패했습니다.',
      ),
    );
  }
};

export const uploadCommunityMarkdownImage = async (
  file: File,
): Promise<string> => {
  const ticket = await requestCommunityMarkdownImageUploadTicket({
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
  });

  await uploadCommunityMarkdownImageFile({
    uploadUrl: ticket.uploadUrl,
    file,
  });

  return ticket.publicUrl;
};
