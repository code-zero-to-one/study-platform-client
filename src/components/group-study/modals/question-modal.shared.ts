'use client';

import { axiosInstanceForMultipart } from '@/api/client/axios';
import type { QuestionDetailResponse } from '@/api/endpoints/group-study/question';
import {
  QuestionCategory,
  type QuestionFormValues,
} from '@/types/schemas/question.schema';

export const QUESTION_CATEGORY_OPTIONS = [
  { value: QuestionCategory.PAYMENT, label: '결제' },
  { value: QuestionCategory.STUDY_COMMON, label: '스터디 일반' },
  { value: QuestionCategory.LEADER, label: '리더' },
  { value: QuestionCategory.BUG, label: '버그' },
  { value: QuestionCategory.CONCERN, label: '고민' },
] as const;

export const DEFAULT_QUESTION_FORM_VALUES: Partial<QuestionFormValues> = {
  title: '',
  content: '',
  category: undefined,
};

export type StudyType = 'group' | 'premium';

export type QuestionImageDraft =
  | { type: 'keep' }
  | { type: 'remove' }
  | { type: 'replace'; file: File };

export type EditableQuestion = Pick<
  QuestionDetailResponse,
  'questionId' | 'title' | 'content' | 'category' | 'questionImage'
>;

const getImageExtensionFromFile = (file: File) => {
  const mimeSubtype = file.type.split('/')[1]?.toLowerCase();

  switch (mimeSubtype) {
    case 'svg+xml':
      return 'SVG';
    default:
      return mimeSubtype;
  }
};

export const getRequestImageExtension = (image: QuestionImageDraft) => {
  switch (image.type) {
    case 'replace':
      return getImageExtensionFromFile(image.file);
    case 'remove':
      return 'DEFAULT';
    default:
      return undefined;
  }
};

export const getQuestionImageUrl = (question?: EditableQuestion) =>
  question?.questionImage?.resizedImages?.[0]?.resizedImageUrl;

export const uploadQuestionImage = async (uploadUrl: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const url = new URL(uploadUrl);
  const relativePath = url.pathname.replace(/^\/api\/v1\//, '') + url.search;

  await axiosInstanceForMultipart.put(relativePath, formData);
};

export const finalizeQuestionSubmission = async ({
  image,
  imageUploadUrl,
  onAfterImageUpload,
  setIsFinalizing,
}: {
  image: QuestionImageDraft;
  imageUploadUrl?: string;
  onAfterImageUpload?: () => Promise<void>;
  setIsFinalizing: (isFinalizing: boolean) => void;
}) => {
  if (image.type !== 'replace') {
    return;
  }

  setIsFinalizing(true);

  try {
    if (!imageUploadUrl) {
      throw new Error('Missing image upload URL');
    }

    await uploadQuestionImage(imageUploadUrl, image.file);
    await onAfterImageUpload?.();
  } catch (error) {
    console.error('문의 이미지 업로드 오류:', error);
    throw error;
  } finally {
    setIsFinalizing(false);
  }
};
