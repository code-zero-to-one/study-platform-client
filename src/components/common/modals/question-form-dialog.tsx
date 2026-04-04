'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import {
  DEFAULT_QUESTION_FORM_VALUES,
  QUESTION_CATEGORY_OPTIONS,
  type QuestionImageDraft,
} from '@/components/common/modals/question-modal.shared';
import Button from '@/components/common/ui/button';
import { SingleDropdown } from '@/components/common/ui/dropdown';
import FormField from '@/components/common/ui/form/form-field';
import ImageUploadInput from '@/components/common/ui/image-upload-input';
import { BaseInput, TextAreaInput } from '@/components/common/ui/input';
import { Modal } from '@/components/common/ui/modal';
import { useScrollToNextField } from '@/hooks/use-scroll-to-next-field';
import {
  QUESTION_CONTENT_MAX_LENGTH,
  questionSchema,
  QUESTION_TITLE_MAX_LENGTH,
  type QuestionFormValues,
} from '@/types/schemas/question.schema';

interface QuestionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  submitText: string;
  defaultValues?: Partial<QuestionFormValues>;
  initialImageUrl?: string;
  isSubmitting?: boolean;
  onSubmit: (
    values: QuestionFormValues,
    image: QuestionImageDraft,
  ) => Promise<void> | void;
}

const revokeObjectUrl = (url?: string) => {
  if (url?.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

export default function QuestionFormDialog({
  open,
  onOpenChange,
  title,
  submitText,
  defaultValues,
  initialImageUrl,
  isSubmitting = false,
  onSubmit,
}: QuestionFormDialogProps) {
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    undefined,
  );
  const [isImageRemoved, setIsImageRemoved] = useState(false);
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: DEFAULT_QUESTION_FORM_VALUES,
  });
  const { handleSubmit, reset } = form;
  const scrollToNext = useScrollToNextField();

  const initialTitle = defaultValues?.title ?? '';
  const initialContent = defaultValues?.content ?? '';
  const initialCategory = defaultValues?.category;

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      title: initialTitle,
      content: initialContent,
      category: initialCategory,
    });

    setImageFile(undefined);
    setImagePreview((currentPreview) => {
      revokeObjectUrl(currentPreview);

      return initialImageUrl;
    });
    setIsImageRemoved(false);
  }, [
    initialCategory,
    initialContent,
    initialImageUrl,
    initialTitle,
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

  const resetImageState = () => {
    setImageFile(undefined);
    setIsImageRemoved(false);
    handlePreviewChange(undefined);
  };

  const handleChangeImage = (file: File | undefined) => {
    if (file) {
      setImageFile(file);
      setIsImageRemoved(false);
      handlePreviewChange(URL.createObjectURL(file));

      return;
    }

    setImageFile(undefined);
    setIsImageRemoved(Boolean(initialImageUrl));
    handlePreviewChange(undefined);
  };

  const handleDialogOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      reset(DEFAULT_QUESTION_FORM_VALUES);
      resetImageState();
    }

    onOpenChange(isOpen);
  };

  const handleFormSubmit = handleSubmit(async (values) => {
    const image: QuestionImageDraft = imageFile
      ? { type: 'replace', file: imageFile }
      : isImageRemoved
        ? { type: 'remove' }
        : { type: 'keep' };

    await onSubmit(values, image);
  });

  return (
    <Modal.Root open={open} onOpenChange={handleDialogOpenChange}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="medium" className="w-full sm:max-w-[500px]">
          <Modal.Header className="border-border-default flex items-center justify-between border-b">
            <Modal.Title className="font-designer-20b text-text-strong">
              {title}
            </Modal.Title>
            <Modal.Close>
              <XIcon />
            </Modal.Close>
          </Modal.Header>
          <FormProvider {...form}>
            <form
              onSubmit={handleFormSubmit}
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
                  onClick={() => handleDialogOpenChange(false)}
                >
                  취소
                </Button>
                <Button type="submit" color="primary" disabled={isSubmitting}>
                  {isSubmitting ? `${submitText} 중...` : submitText}
                </Button>
              </Modal.Footer>
            </form>
          </FormProvider>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
