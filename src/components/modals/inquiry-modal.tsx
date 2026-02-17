'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { XIcon } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';
import Button from '@/components/ui/button';
import { BaseInput, TextAreaInput } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import {
  INQUIRY_CONTENT_MAX_LENGTH,
  inquirySchema,
  InquiryCategory,
  InquiryFormValues,
  INQUIRY_TITLE_MAX_LENGTH,
} from '@/features/study/group/model/inquiry.schema';
import { useCreateInquiry } from '@/hooks/queries/inquiry-api';
import { useScrollToNextField } from '@/hooks/use-scroll-to-next-field';
import { useToastStore } from '@/stores/use-toast-store';
import { SingleDropdown } from '../ui/dropdown';
import FormField from '../ui/form/form-field';

const INQUIRY_CATEGORY_OPTIONS = [
  { value: InquiryCategory.CURRICULUM, label: '커리큘럼' },
  { value: InquiryCategory.DIFFICULTY, label: '난이도' },
  { value: InquiryCategory.HW_AMOUNT, label: '과제량' },
  { value: InquiryCategory.ETC, label: '기타' },
] as const;

interface InquiryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studyId: number;
}

export default function InquiryModal({
  open,
  onOpenChange,
  studyId,
}: InquiryModalProps) {
  const showToast = useToastStore((state) => state.showToast);
  const { mutate: createInquiry, isPending } = useCreateInquiry();

  const form = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      title: '',
      content: '',
      category: undefined,
    },
  });

  const { handleSubmit, reset } = form;
  const scrollToNext = useScrollToNextField();

  const onSubmit = (data: InquiryFormValues) => {
    createInquiry(
      {
        groupStudyId: studyId,
        request: {
          title: data.title,
          content: data.content,
          category: data.category,
        },
      },
      {
        onSuccess: () => {
          showToast('문의가 성공적으로 제출되었습니다.', 'success');
          reset();
          onOpenChange(false);
        },
        onError: (error) => {
          showToast('문의 제출에 실패했습니다. 다시 시도해주세요.', 'error');
          console.error('문의 제출 오류:', error);
        },
      },
    );
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
    }
    onOpenChange(isOpen);
  };

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="medium" className="w-[500px]">
          <Modal.Header className="border-border-default flex items-center justify-between border-b">
            <Modal.Title className="font-designer-20b text-text-strong">
              스터디 문의하기
            </Modal.Title>
            <Modal.Close>
              <XIcon />
            </Modal.Close>
          </Modal.Header>
          <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Modal.Body className="flex flex-col gap-300">
                <FormField<InquiryFormValues, 'category'>
                  name="category"
                  label="문의 종류"
                  direction="vertical"
                  required
                  scrollable
                  onAfterChange={() => scrollToNext('category')}
                >
                  <SingleDropdown
                    options={INQUIRY_CATEGORY_OPTIONS}
                    placeholder="선택해주세요"
                  />
                </FormField>
                <FormField<InquiryFormValues, 'title'>
                  name="title"
                  label="제목"
                  direction="vertical"
                  required
                  scrollable
                  onAfterBlurFilled={() => scrollToNext('title')}
                >
                  <BaseInput
                    maxLength={INQUIRY_TITLE_MAX_LENGTH}
                    placeholder="제목을 입력하세요"
                    hideMeta={false}
                  />
                </FormField>
                <FormField<InquiryFormValues, 'content'>
                  name="content"
                  label="내용"
                  direction="vertical"
                  required
                  scrollable
                >
                  <TextAreaInput
                    placeholder="내용을 입력하세요"
                    maxLength={INQUIRY_CONTENT_MAX_LENGTH}
                    className="font-designer-16m text-text-default h-auto min-h-[150px]"
                  />
                </FormField>
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
                  {isPending ? '제출 중...' : '문의 제출'}
                </Button>
              </Modal.Footer>
            </form>
          </FormProvider>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
