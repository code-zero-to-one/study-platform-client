'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import QuestionFormDialog from '@/components/common/modals/question-form-dialog';
import {
  finalizeQuestionSubmission,
  getRequestImageExtension,
  type QuestionImageDraft,
  type StudyType,
} from '@/components/common/modals/question-modal.shared';
import { useCreateQuestion } from '@/hooks/queries/group-study/question-api';
import { useToastStore } from '@/stores/use-toast-store';
import type { QuestionFormValues } from '@/types/schemas/question.schema';

interface CreateQuestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupStudyId: number;
  studyType?: StudyType;
  onSuccess?: () => void;
}

export default function CreateQuestionModal({
  open,
  onOpenChange,
  groupStudyId,
  studyType,
  onSuccess,
}: CreateQuestionModalProps) {
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);
  const createQuestionMutation = useCreateQuestion();
  const [isFinalizingSubmission, setIsFinalizingSubmission] = useState(false);
  const isSubmitting =
    createQuestionMutation.isPending || isFinalizingSubmission;

  const handleCreateQuestion = async (
    values: QuestionFormValues,
    image: QuestionImageDraft,
  ) => {
    try {
      const result = await createQuestionMutation.mutateAsync({
        groupStudyId,
        request: {
          title: values.title,
          content: values.content,
          category: values.category,
          imageExtension: getRequestImageExtension(image),
        },
      });

      await finalizeQuestionSubmission({
        image,
        imageUploadUrl: result.imageUploadUrl,
        setIsFinalizing: setIsFinalizingSubmission,
      });

      showToast('문의가 성공적으로 제출되었습니다.', 'success');
      onOpenChange(false);

      if (onSuccess) {
        onSuccess();

        return;
      }

      router.push(
        `/inquiry?groupStudyId=${groupStudyId}${studyType ? `&studyType=${studyType}` : ''}`,
      );
    } catch (error) {
      showToast('문의 제출에 실패했습니다. 다시 시도해주세요.', 'error');
      console.error('문의 제출 오류:', error);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setIsFinalizingSubmission(false);
    }

    onOpenChange(isOpen);
  };

  return (
    <QuestionFormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="스터디 문의하기"
      submitText="문의 제출"
      isSubmitting={isSubmitting}
      onSubmit={handleCreateQuestion}
    />
  );
}
