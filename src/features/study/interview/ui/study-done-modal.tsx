'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { XIcon } from 'lucide-react';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type {
  CompleteStudyRequest,
  DailyStudyDetail,
  StudyProgressStatus,
} from '@/features/study/interview/api/interview-types';
import { STUDY_PROGRESS_OPTIONS } from '@/features/study/interview/const/interview-const';
import { useUpdateDailyStudyMutation } from '@/features/study/interview/model/use-interview-query';
import Button from '@/shared/ui/button';
import { SingleDropdown } from '@/shared/ui/dropdown';
import FormField from '@/shared/ui/form/form-field';
import { TextAreaInput } from '@/shared/ui/input';
import { Modal } from '@/shared/ui/modal';
import {
  StudyDoneFormSchema,
  type StudyDoneFormValues,
  buildStudyDoneDefaults,
} from '@/features/study/interview/model/interview.schema';

interface StudyDoneModalProps {
  data: DailyStudyDetail;
  studyDate: string;
}

export default function StudyDoneModal({
  data,
  studyDate,
}: StudyDoneModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Modal.Root open={isOpen} onOpenChange={setIsOpen}>
      <Button
        disabled={data.progressStatus === 'PENDING'}
        size="medium"
        onClick={() => setIsOpen(true)}
      >
        완료하기
      </Button>

      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header className="border-border-default flex items-center justify-between border-b">
            <Modal.Title>면접 완료하기</Modal.Title>
            <Modal.Close>
              <XIcon />
            </Modal.Close>
          </Modal.Header>

          <StudyDoneForm
            data={data}
            studyDate={studyDate}
            onClose={() => setIsOpen(false)}
          />
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

function StudyDoneForm({
  data,
  studyDate,
  onClose,
}: {
  data: DailyStudyDetail;
  studyDate: string;
  onClose: () => void;
}) {
  const { mutate, isPending } = useUpdateDailyStudyMutation();

  const methods = useForm<StudyDoneFormValues>({
    resolver: zodResolver(StudyDoneFormSchema),
    mode: 'onChange',
    defaultValues: buildStudyDoneDefaults(data),
  });

  const {
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = methods;

  const onSubmit = (values: StudyDoneFormValues) => {
    const form: CompleteStudyRequest = {
      progressStatus: values.progressStatus as StudyProgressStatus,
      feedback: values.feedback,
    };

    mutate(
      {
        dailyStudyId: data.dailyStudyId,
        studyDate,
        form,
        requestType: 'complete',
      },
      {
        onSuccess: onClose,
        onError: (err) => {
          console.error(err);
          alert('요청 처리에 실패했습니다. 다시 시도해주세요.');
        },
      },
    );
  };

  return (
    <>
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
                options={STUDY_PROGRESS_OPTIONS}
                placeholder="선택해주세요"
              />
            </FormField>

            <FormField<StudyDoneFormValues, 'feedback'>
              name="feedback"
              label="피드백"
              helper="면접 결과에 대한 간단한 피드백을 입력해 주세요."
              required
              direction="vertical"
              showCounterRight
              counterMax={100}
            >
              <TextAreaInput
                placeholder="커뮤니케이션 능력은 우수하나, 자료구조 이해도가 부족해 추가 학습이 필요해 보입니다."
                maxLength={100}
                hideMeta
              />
            </FormField>
          </form>
        </FormProvider>
      </Modal.Body>

      <Modal.Footer>
        <div className="flex justify-end gap-100">
          <Button color="secondary" size="large" onClick={onClose}>
            취소
          </Button>
          <Button
            size="large"
            color="primary"
            type="submit"
            form="study-done-form"
            disabled={!isValid || isSubmitting || isPending}
          >
            작성 완료
          </Button>
        </div>
      </Modal.Footer>
    </>
  );
}
