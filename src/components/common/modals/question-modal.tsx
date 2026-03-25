'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { XIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { axiosInstanceForMultipart } from '@/api/client/axios';
import Button from '@/components/common/ui/button';
import { SingleDropdown } from '@/components/common/ui/dropdown';
import FormField from '@/components/common/ui/form/form-field';
import ImageUploadInput from '@/components/common/ui/image-upload-input';
import { BaseInput, TextAreaInput } from '@/components/common/ui/input';
import { Modal } from '@/components/common/ui/modal';
import {
  useCreateQuestion,
  useModifyQuestion,
} from '@/hooks/queries/question-api';
import { useScrollToNextField } from '@/hooks/use-scroll-to-next-field';
import { useToastStore } from '@/stores/use-toast-store';
import {
  QUESTION_CONTENT_MAX_LENGTH,
  questionSchema,
  QUESTION_TITLE_MAX_LENGTH,
  QuestionCategory,
  type QuestionFormValues,
} from '@/types/schemas/question.schema';

const QUESTION_CATEGORY_OPTIONS = [
  { value: QuestionCategory.PAYMENT, label: '결제' },
  { value: QuestionCategory.STUDY_COMMON, label: '스터디 일반' },
  { value: QuestionCategory.LEADER, label: '리더' },
  { value: QuestionCategory.BUG, label: '버그' },
  { value: QuestionCategory.CONCERN, label: '고민' },
] as const;

const DEFAULT_FORM_VALUES: Partial<QuestionFormValues> = {
  title: '',
  content: '',
  category: undefined,
};

interface QuestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studyId: number;
  studyType?: 'group' | 'premium';
  onAfterSubmit?: () => void;
  mode?: 'create' | 'edit';
  questionId?: number;
  initialValues?: {
    title?: string;
    content?: string;
    category?: QuestionCategory;
    imageUrl?: string;
  };
}

const revokeObjectUrl = (url?: string) => {
  if (url?.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

const getImageExtension = (file: File) => {
  const mimeSubtype = file.type.split('/')[1]?.toLowerCase();

  switch (mimeSubtype) {
    case 'svg+xml':
      return 'SVG';
    default:
      return mimeSubtype;
  }
};

export default function QuestionModal({
  open,
  onOpenChange,
  studyId,
  studyType,
  onAfterSubmit,
  mode = 'create',
  questionId,
  initialValues,
}: QuestionModalProps) {
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);
  const createQuestionMutation = useCreateQuestion();
  const modifyQuestionMutation = useModifyQuestion();
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    undefined,
  );
  const [isImageRemoved, setIsImageRemoved] = useState(false);
  const [isFinalizingSubmission, setIsFinalizingSubmission] = useState(false);

  const queryClient = useQueryClient();
  const isEditMode = mode === 'edit' && !!questionId;
  const initialTitle = initialValues?.title ?? '';
  const initialContent = initialValues?.content ?? '';
  const initialCategory = initialValues?.category;
  const initialImageUrl = initialValues?.imageUrl;

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const { handleSubmit, reset } = form;
  const scrollToNext = useScrollToNextField();
  const isPending =
    createQuestionMutation.isPending ||
    modifyQuestionMutation.isPending ||
    isFinalizingSubmission;

  useEffect(() => {
    if (!open) {
      return;
    }

    reset(
      isEditMode
        ? {
            title: initialTitle,
            content: initialContent,
            category: initialCategory,
          }
        : DEFAULT_FORM_VALUES,
    );

    setImageFile(undefined);
    setImagePreview((currentPreview) => {
      revokeObjectUrl(currentPreview);

      return isEditMode ? initialImageUrl : undefined;
    });
    setIsImageRemoved(false);
    setIsFinalizingSubmission(false);
  }, [
    initialCategory,
    initialContent,
    initialImageUrl,
    initialTitle,
    isEditMode,
    open,
    reset,
  ]);

  useEffect(() => {
    return () => {
      revokeObjectUrl(imagePreview);
    };
  }, [imagePreview]);

  const handlePreviewChange = (nextPreview?: string) => {
    setImagePreview((currentPreview) => {
      revokeObjectUrl(currentPreview);

      return nextPreview;
    });
  };

  const handleChangeImage = (file: File | undefined) => {
    if (file) {
      setImageFile(file);
      setIsImageRemoved(false);
      handlePreviewChange(URL.createObjectURL(file));

      return;
    }

    setImageFile(undefined);
    setIsImageRemoved(Boolean(isEditMode && initialImageUrl));
    handlePreviewChange(undefined);
  };

  const uploadImage = async (uploadUrl: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const url = new URL(uploadUrl);
    const relativePath = url.pathname.replace(/^\/api\/v1\//, '') + url.search;

    await axiosInstanceForMultipart.put(relativePath, formData);
  };

  const resetImageState = () => {
    setImageFile(undefined);
    setIsImageRemoved(false);
    handlePreviewChange(undefined);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setIsFinalizingSubmission(false);
      reset(DEFAULT_FORM_VALUES);
      resetImageState();
    }
    onOpenChange(isOpen);
  };

  const finalizeSubmission = (
    message: string,
    variant: 'success' | 'info' = 'success',
  ) => {
    showToast(message, variant);
    handleOpenChange(false);

    if (onAfterSubmit) {
      onAfterSubmit();

      return;
    }

    router.push(
      `/inquiry?groupStudyId=${studyId}${studyType ? `&studyType=${studyType}` : ''}`,
    );
  };

  const handleSuccess = async (imageUploadUrl?: string) => {
    const successMessage = isEditMode
      ? '문의가 성공적으로 수정되었습니다.'
      : '문의가 성공적으로 제출되었습니다.';
    const imageUploadFailedMessage = isEditMode
      ? '문의는 수정되었지만 이미지 업로드에 실패해 첨부 이미지는 저장되지 않았습니다.'
      : '문의는 제출되었지만 이미지 업로드에 실패해 첨부 이미지는 저장되지 않았습니다.';

    if (!imageFile) {
      finalizeSubmission(successMessage);

      return;
    }

    setIsFinalizingSubmission(true);

    if (!imageUploadUrl) {
      finalizeSubmission(imageUploadFailedMessage, 'info');

      return;
    }

    try {
      await uploadImage(imageUploadUrl, imageFile);
      // S3 업로드 완료 후 재무효화: 훅의 onSuccess가 업로드 전에 실행되므로
      // 이 시점에 다시 무효화해야 이미지가 포함된 최신 데이터를 가져올 수 있다.
      if (isEditMode && questionId) {
        await queryClient.invalidateQueries({
          queryKey: ['question', studyId, questionId],
        });
      }
      finalizeSubmission(successMessage);
    } catch (error) {
      console.error('문의 이미지 업로드 오류:', error);
      finalizeSubmission(imageUploadFailedMessage, 'info');
    }
  };

  const onSubmit = (data: QuestionFormValues) => {
    const imageExtension = imageFile
      ? getImageExtension(imageFile)
      : isEditMode && isImageRemoved
        ? 'DEFAULT'
        : undefined;

    const request = {
      title: data.title,
      content: data.content,
      category: data.category,
      imageExtension,
    };

    if (isEditMode && questionId) {
      modifyQuestionMutation.mutate(
        {
          groupStudyId: studyId,
          questionId,
          request,
        },
        {
          onSuccess: async (result) => {
            await handleSuccess(result.imageUploadUrl);
          },
          onError: (error) => {
            showToast('문의 수정에 실패했습니다. 다시 시도해주세요.', 'error');
            console.error('문의 수정 오류:', error);
          },
        },
      );

      return;
    }

    createQuestionMutation.mutate(
      {
        groupStudyId: studyId,
        request,
      },
      {
        onSuccess: async (result) => {
          await handleSuccess(result.imageUploadUrl);
        },
        onError: (error) => {
          showToast('문의 제출에 실패했습니다. 다시 시도해주세요.', 'error');
          console.error('문의 제출 오류:', error);
        },
      },
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="medium" className="w-full sm:max-w-500">
          <Modal.Header className="border-border-default flex items-center justify-between border-b">
            <Modal.Title className="font-designer-20b text-text-strong">
              {isEditMode ? '스터디 문의 수정하기' : '스터디 문의하기'}
            </Modal.Title>
            <Modal.Close>
              <XIcon />
            </Modal.Close>
          </Modal.Header>
          <FormProvider {...form}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex min-h-0 flex-1 flex-col"
            >
              <Modal.Body className="flex flex-col gap-300">
                <FormField<QuestionFormValues, 'category'>
                  name="category"
                  label="문의 종류"
                  direction="vertical"
                  required
                  scrollable
                  onAfterChange={() => scrollToNext('category')}
                >
                  <SingleDropdown
                    options={QUESTION_CATEGORY_OPTIONS}
                    placeholder="선택해주세요"
                  />
                </FormField>
                <FormField<QuestionFormValues, 'title'>
                  name="title"
                  label="제목"
                  direction="vertical"
                  required
                  scrollable
                  onAfterBlurFilled={() => scrollToNext('title')}
                >
                  <BaseInput
                    maxLength={QUESTION_TITLE_MAX_LENGTH}
                    placeholder="제목을 입력하세요"
                    hideMeta={false}
                  />
                </FormField>
                <FormField<QuestionFormValues, 'content'>
                  name="content"
                  label="내용"
                  direction="vertical"
                  required
                  scrollable
                >
                  <TextAreaInput
                    placeholder="내용을 입력하세요"
                    maxLength={QUESTION_CONTENT_MAX_LENGTH}
                    className="font-designer-16m text-text-default h-auto min-h-150"
                  />
                </FormField>
                <div className="flex flex-col gap-100">
                  <span className="font-designer-16m text-text-strong">
                    이미지 첨부
                    <span className="font-designer-14r text-text-assistive ml-50">
                      (선택)
                    </span>
                  </span>
                  <ImageUploadInput
                    image={imagePreview}
                    onChangeImage={handleChangeImage}
                  />
                </div>
              </Modal.Body>
              <Modal.Footer className="flex justify-end gap-100">
                <Button
                  type="button"
                  color="secondary"
                  onClick={() => handleOpenChange(false)}
                >
                  취소
                </Button>
                <Button type="submit" color="primary" disabled={isPending}>
                  {isPending
                    ? isEditMode
                      ? '수정 중...'
                      : '제출 중...'
                    : isEditMode
                      ? '문의 수정'
                      : '문의 제출'}
                </Button>
              </Modal.Footer>
            </form>
          </FormProvider>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
