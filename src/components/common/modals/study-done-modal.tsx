'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { sendGTMEvent } from '@next/third-parties/google';
import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import Button from '@/components/common/ui/button';
import { SingleDropdown } from '@/components/common/ui/dropdown';
import FormField from '@/components/common/ui/form/form-field';
import { TextAreaInput } from '@/components/common/ui/input';
import { Modal } from '@/components/common/ui/modal';
import ModalShell from '@/components/common/ui/modal-shell';
import { getStudyDoneProgressOptions } from '@/config/interview-const';
import { useUpdateDailyStudyMutation } from '@/hooks/queries/use-interview-query';
import type {
  CompleteStudyRequest,
  DailyStudyDetail,
} from '@/types/api/interview.types';
import {
  STUDY_DONE_FEEDBACK_MAX_LENGTH,
  StudyDoneFormSchema,
  type StudyDoneFormValues,
} from '@/types/schemas/interview.schema';

interface StudyDoneModalProps {
  data: DailyStudyDetail;
  studyDate: string;
  forceOpen?: boolean;
}

export default function StudyDoneModal({
  data,
  studyDate,
  forceOpen,
}: StudyDoneModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formState, setFormState] = useState({
    isValid: false,
    isSubmitting: false,
    isPending: false,
  });
  const resolvedOpen = forceOpen ?? isOpen;
  const onClose = () => setIsOpen(false);

  useEffect(() => {
    if (forceOpen !== undefined) {
      setIsOpen(forceOpen);
    }
  }, [forceOpen]);

  useEffect(() => {
    if (resolvedOpen) {
      sendGTMEvent({
        event: 'study_done_modal_open',
        study_date: studyDate,
      });
    }
  }, [resolvedOpen, studyDate]);

  useEffect(() => {
    if (!resolvedOpen || !forceOpen) return;
    const id = window.requestAnimationFrame(() => {
      const input = document.getElementById(
        'study-done-feedback',
      ) as HTMLTextAreaElement | null;
      input?.focus();
    });

    return () => window.cancelAnimationFrame(id);
  }, [resolvedOpen, forceOpen]);

  return (
    <ModalShell
      open={resolvedOpen}
      onOpenChange={(nextOpen) => {
        setIsOpen(nextOpen);
      }}
      title="면접 완료하기"
      trigger={
        <Button
          disabled={data.progressStatus === 'PENDING'}
          size="medium"
          onClick={() => setIsOpen(true)}
        >
          완료하기
        </Button>
      }
      footer={
        <div className="flex justify-end gap-100">
          <Button color="secondary" size="large" onClick={onClose}>
            취소
          </Button>
          <Button
            size="large"
            color="primary"
            type="submit"
            form="study-done-form"
            disabled={
              !formState.isValid ||
              formState.isSubmitting ||
              formState.isPending
            }
          >
            작성 완료
          </Button>
        </div>
      }
    >
      <StudyDoneForm
        data={data}
        studyDate={studyDate}
        onClose={onClose}
        onFormStateChange={setFormState}
      />
    </ModalShell>
  );
}

function StudyDoneForm({
  data,
  studyDate,
  onClose,
  onFormStateChange,
}: {
  data: DailyStudyDetail;
  studyDate: string;
  onClose: () => void;
  onFormStateChange: (state: {
    isValid: boolean;
    isSubmitting: boolean;
    isPending: boolean;
  }) => void;
}) {
  const { mutate, isPending } = useUpdateDailyStudyMutation();
  const { dailyStudyId, feedback, progressStatus } = data;
  const progressOptions = getStudyDoneProgressOptions(progressStatus);
  const isProgressStatusLocked = progressOptions.length === 1;
  const studyDoneDefaults = useMemo<StudyDoneFormValues>(
    () => ({
      progressStatus: progressStatus === 'ABSENT' ? 'ABSENT' : 'COMPLETE',
      feedback: feedback ?? '',
    }),
    [feedback, progressStatus],
  );

  const methods = useForm<StudyDoneFormValues>({
    resolver: zodResolver(StudyDoneFormSchema),
    mode: 'onChange',
    defaultValues: studyDoneDefaults,
  });

  const {
    handleSubmit,
    reset,
    watch,
    formState: { isValid, isSubmitting },
  } = methods;
  const selectedProgressStatus = watch('progressStatus');
  const isFeedbackRequired = selectedProgressStatus === 'COMPLETE';

  useEffect(() => {
    onFormStateChange({ isValid, isSubmitting, isPending });
  }, [isPending, isSubmitting, isValid, onFormStateChange]);

  useEffect(() => {
    reset(studyDoneDefaults);
  }, [reset, studyDoneDefaults]);

  const onSubmit = (values: StudyDoneFormValues) => {
    const trimmedFeedback = values.feedback.trim();
    const form: CompleteStudyRequest = {
      progressStatus: values.progressStatus,
      ...(values.progressStatus === 'COMPLETE' && trimmedFeedback
        ? { feedback: trimmedFeedback }
        : {}),
    };

    mutate(
      {
        dailyStudyId,
        studyDate,
        form,
        requestType: 'complete',
      },
      {
        onSuccess: () => {
          sendGTMEvent({
            event: 'study_done_success',
            study_date: studyDate,
            progress_status: values.progressStatus,
          });
          onClose();
        },
        onError: (err) => {
          console.error(err);
          sendGTMEvent({
            event: 'study_done_error',
            study_date: studyDate,
          });
          alert('요청 처리에 실패했습니다. 다시 시도해주세요.');
        },
      },
    );
  };

  return (
    <Modal.Body className="flex flex-col gap-400">
      <FormProvider {...methods}>
        <form
          id="study-done-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-300"
        >
          <FormField<StudyDoneFormValues, 'progressStatus'>
            name="progressStatus"
            label="진행 현황"
            helper="면접 완료 후 해당 지원자의 상태를 업데이트해 주세요."
            required
            direction="vertical"
          >
            <SingleDropdown
              options={progressOptions}
              placeholder="선택해주세요"
              disabled={isProgressStatusLocked}
            />
          </FormField>

          {isFeedbackRequired ? (
            <div data-tutorial="study-done-input">
              <FormField<StudyDoneFormValues, 'feedback'>
                name="feedback"
                label="피드백"
                helper="면접 결과에 대한 간단한 피드백을 입력해 주세요."
                required
                direction="vertical"
                showCounterRight
                maxCharCount={STUDY_DONE_FEEDBACK_MAX_LENGTH}
              >
                <TextAreaInput
                  id="study-done-feedback"
                  placeholder="커뮤니케이션 능력은 우수하나, 자료구조 이해도가 부족해 추가 학습이 필요해 보입니다."
                  maxLength={STUDY_DONE_FEEDBACK_MAX_LENGTH}
                  hideMeta
                />
              </FormField>
            </div>
          ) : (
            <div className="bg-background-alternative font-designer-14r text-text-subtle rounded-150 px-200 py-150">
              불참 처리 시 피드백은 저장되지 않습니다.
            </div>
          )}
        </form>
      </FormProvider>
    </Modal.Body>
  );
}
