'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import QuestionFormDialog from '@/components/group-study/modals/question-form-dialog';
import {
  finalizeQuestionSubmission,
  getQuestionImageUrl,
  getRequestImageExtension,
  type EditableQuestion,
  type QuestionImageDraft,
} from '@/components/group-study/modals/question-modal.shared';
import { useModifyQuestion } from '@/hooks/queries/group-study/question-api';
import { useToastStore } from '@/stores/use-toast-store';
import type { QuestionFormValues } from '@/types/schemas/question.schema';

interface EditQuestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupStudyId: number;
  question: EditableQuestion;
  onSuccess?: () => void;
}

export default function EditQuestionModal({
  open,
  onOpenChange,
  groupStudyId,
  question,
  onSuccess,
}: EditQuestionModalProps) {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);
  const modifyQuestionMutation = useModifyQuestion();
  const [isFinalizingSubmission, setIsFinalizingSubmission] = useState(false);
  const isSubmitting =
    modifyQuestionMutation.isPending || isFinalizingSubmission;

  const handleEditQuestion = async (
    values: QuestionFormValues,
    image: QuestionImageDraft,
  ) => {
    try {
      const result = await modifyQuestionMutation.mutateAsync({
        groupStudyId,
        questionId: question.questionId,
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
        onAfterImageUpload: async () => {
          await queryClient.invalidateQueries({
            queryKey: ['question', groupStudyId, question.questionId],
          });
        },
        setIsFinalizing: setIsFinalizingSubmission,
      });

      showToast('문의가 성공적으로 수정되었습니다.', 'success');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      showToast('문의 수정에 실패했습니다. 다시 시도해주세요.', 'error');
      console.error('문의 수정 오류:', error);
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
      title="스터디 문의 수정하기"
      submitText="문의 수정"
      defaultValues={{
        title: question.title,
        content: question.content,
        category: question.category,
      }}
      initialImageUrl={getQuestionImageUrl(question)}
      isSubmitting={isSubmitting}
      onSubmit={handleEditQuestion}
    />
  );
}
