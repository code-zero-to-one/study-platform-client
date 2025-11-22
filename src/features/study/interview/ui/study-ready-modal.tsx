'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { sendGTMEvent } from '@next/third-parties/google';
import { XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import Button from '@/components/ui/button';
import FormField from '@/components/ui/form/form-field';
import { BaseInput } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import type {
  DailyStudyDetail,
  PrepareStudyRequest,
} from '@/features/study/interview/api/interview-types';
import {
  StudyReadyFormSchema,
  type StudyReadyFormValues,
  buildStudyReadyDefaults,
} from '@/features/study/interview/model/interview.schema';
import { useUpdateDailyStudyMutation } from '@/features/study/interview/model/use-interview-query';

interface StudyReadyModalProps {
  data: DailyStudyDetail;
  studyDate: string;
}

export default function StudyReadyModal({
  data,
  studyDate,
}: StudyReadyModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      sendGTMEvent({
        event: 'study_ready_modal_open',
        study_date: studyDate,
      });
    }
  }, [isOpen, studyDate]);

  return (
    <Modal.Root open={isOpen} onOpenChange={setIsOpen}>
      <Modal.Trigger asChild>
        <Button size="medium">준비하기</Button>
      </Modal.Trigger>

      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header className="border-border-default flex items-center justify-between border-b">
            <Modal.Title>면접 준비하기</Modal.Title>
            <Modal.Close>
              <XIcon />
            </Modal.Close>
          </Modal.Header>

          <StudyReadyForm
            data={data}
            studyDate={studyDate}
            onClose={() => setIsOpen(false)}
          />
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

function StudyReadyForm({
  data,
  studyDate,
  onClose,
}: {
  data: DailyStudyDetail;
  studyDate: string;
  onClose: () => void;
}) {
  const { mutate, isPending } = useUpdateDailyStudyMutation();

  const methods = useForm<StudyReadyFormValues>({
    resolver: zodResolver(StudyReadyFormSchema),
    mode: 'onChange',
    defaultValues: buildStudyReadyDefaults(data),
  });

  const {
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = methods;

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
            id="study-ready-form"
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-300"
          >
            <FormField<StudyReadyFormValues, 'subject'>
              name="subject"
              label="면접 주제"
              helper="이번 스터디에서 다룰 면접 주제 또는 질문 유형을 간단히 작성해 주세요."
              required
              direction="vertical"
            >
              <BaseInput placeholder="네트워크 기초, 운영체제 프로세스 관리, 자료구조 시간복잡도 비교" />
            </FormField>

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

      <Modal.Footer>
        <div className="flex justify-end gap-100">
          <Button color="secondary" size="large" onClick={onClose}>
            취소
          </Button>
          <Button
            size="large"
            color="primary"
            type="submit"
            form="study-ready-form"
            disabled={!isValid || isSubmitting || isPending}
          >
            작성 완료
          </Button>
        </div>
      </Modal.Footer>
    </>
  );
}
