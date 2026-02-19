'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { XIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import Button from '@/components/ui/button';
import { BaseInput, TextAreaInput } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import {
  QUESTION_CONTENT_MAX_LENGTH,
  questionSchema,
  QuestionCategory,
  QuestionFormValues,
  QUESTION_TITLE_MAX_LENGTH,
} from '@/features/study/group/model/question.schema';
import { useCreateQuestion } from '@/hooks/queries/question-api';
import { useScrollToNextField } from '@/hooks/use-scroll-to-next-field';
import { useToastStore } from '@/stores/use-toast-store';
import { SingleDropdown } from '../ui/dropdown';
import FormField from '../ui/form/form-field';

const QUESTION_CATEGORY_OPTIONS = [
  { value: QuestionCategory.PAYMENT, label: '결제' },
  { value: QuestionCategory.STUDY_COMMON, label: '스터디 공통' },
  { value: QuestionCategory.LEADER, label: '리더' },
  { value: QuestionCategory.BUG, label: '버그' },
  { value: QuestionCategory.CONCERN, label: '고민' },
] as const;

interface QuestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studyId: number;
  studyType?: 'group' | 'premium';
}

export default function QuestionModal({
  open,
  onOpenChange,
  studyId,
  studyType,
}: QuestionModalProps) {
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);
  const { mutate: createQuestion, isPending } = useCreateQuestion();

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      title: '',
      content: '',
      category: undefined,
    },
  });

  const { handleSubmit, reset } = form;
  const scrollToNext = useScrollToNextField();

  const onSubmit = (data: QuestionFormValues) => {
    createQuestion(
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
          router.push(
            `/inquiry?groupStudyId=${studyId}${studyType ? `&studyType=${studyType}` : ''}`,
          );
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
