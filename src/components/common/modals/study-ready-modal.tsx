'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { sendGTMEvent } from '@next/third-parties/google';
import { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import Button from '@/components/common/ui/button';
import FormField from '@/components/common/ui/form/form-field';
import { BaseInput } from '@/components/common/ui/input';
import { Modal } from '@/components/common/ui/modal';
import ModalShell from '@/components/common/ui/modal-shell';
import { useUpdateDailyStudyMutation } from '@/hooks/queries/use-interview-query';
import { useToastStore } from '@/stores/use-toast-store';
import type {
  DailyStudyDetail,
  PrepareStudyRequest,
} from '@/types/api/interview.types';
import {
  StudyReadyFormSchema,
  type StudyReadyFormValues,
  buildStudyReadyDefaults,
} from '@/types/schemas/interview.schema';

interface StudyReadyModalProps {
  data: DailyStudyDetail;
  studyDate: string;
  forceOpen?: boolean;
}

export default function StudyReadyModal({
  data,
  studyDate,
  forceOpen,
}: StudyReadyModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formState, setFormState] = useState({
    isValid: false,
    isSubmitting: false,
    isPending: false,
  });
  const subjectInputRef = useRef<HTMLInputElement | null>(null);
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
        event: 'study_ready_modal_open',
        study_date: studyDate,
      });
    }
  }, [resolvedOpen, studyDate]);

  useEffect(() => {
    if (!resolvedOpen || !forceOpen) return;
    const id = window.requestAnimationFrame(() => {
      subjectInputRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(id);
  }, [resolvedOpen, forceOpen]);

  return (
    <ModalShell
      open={resolvedOpen}
      onOpenChange={(nextOpen) => {
        setIsOpen(nextOpen);
      }}
      title="면접 준비하기"
      trigger={<Button size="medium">준비하기</Button>}
      footer={
        <div className="flex justify-end gap-100">
          <Button color="secondary" size="large" onClick={onClose}>
            취소
          </Button>
          <Button
            size="large"
            color="primary"
            type="submit"
            form="study-ready-form"
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
      <StudyReadyForm
        data={data}
        studyDate={studyDate}
        onClose={onClose}
        subjectInputRef={subjectInputRef}
        onFormStateChange={setFormState}
      />
    </ModalShell>
  );
}

function StudyReadyForm({
  data,
  studyDate,
  onClose,
  subjectInputRef,
  onFormStateChange,
}: {
  data: DailyStudyDetail;
  studyDate: string;
  onClose: () => void;
  subjectInputRef: React.RefObject<HTMLInputElement | null>;
  onFormStateChange: (state: {
    isValid: boolean;
    isSubmitting: boolean;
    isPending: boolean;
  }) => void;
}) {
  const { mutate, isPending } = useUpdateDailyStudyMutation();
  const showToast = useToastStore((state) => state.showToast);

  const methods = useForm<StudyReadyFormValues>({
    resolver: zodResolver(StudyReadyFormSchema),
    mode: 'onChange',
    defaultValues: buildStudyReadyDefaults(data),
  });

  const {
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = methods;

  useEffect(() => {
    onFormStateChange({ isValid, isSubmitting, isPending });
  }, [isPending, isSubmitting, isValid, onFormStateChange]);

  const onSubmit = (values: StudyReadyFormValues) => {
    const form: PrepareStudyRequest = {
      subject: values.subject,
      link: values.link ?? undefined,
    };

    mutate(
      {
        dailyStudyId: data.dailyStudyId,
        studyDate,
        form,
        requestType: 'prepare',
      },
      {
        onSuccess: () => {
          sendGTMEvent({
            event: 'study_ready_success',
            study_date: studyDate,
          });
          onClose();
        },
        onError: (err) => {
          console.error(err);
          sendGTMEvent({
            event: 'study_ready_error',
            study_date: studyDate,
          });
          showToast('요청 처리에 실패했습니다. 다시 시도해주세요.', 'error');
        },
      },
    );
  };

  return (
    <Modal.Body className="flex flex-col gap-400">
      <FormProvider {...methods}>
        <form
          id="study-ready-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-300"
        >
          <div data-tutorial="study-ready-input">
            <FormField<StudyReadyFormValues, 'subject'>
              name="subject"
              label="면접 주제"
              helper="이번 스터디에서 다룰 면접 주제 또는 질문 유형을 간단히 작성해 주세요."
              required
              direction="vertical"
            >
              <BaseInput
                ref={subjectInputRef}
                placeholder="네트워크 기초, 운영체제 프로세스 관리, 자료구조 시간복잡도 비교"
              />
            </FormField>
          </div>

          <FormField<StudyReadyFormValues, 'link'>
            name="link"
            label="참고 자료"
            helper="함께 참고할 문서나 링크가 있다면 입력해 주세요"
            required
            direction="vertical"
          >
            <BaseInput placeholder="https://github.com/InterviewReady/network-basic" />
          </FormField>
        </form>
      </FormProvider>
    </Modal.Body>
  );
}
