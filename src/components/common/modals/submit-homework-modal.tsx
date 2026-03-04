import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import Button from '@/components/common/ui/button';
import FormField from '@/components/common/ui/form/form-field';
import { BaseInput, TextAreaInput } from '@/components/common/ui/input';
import { Modal } from '@/components/common/ui/modal';

import { useSubmitHomework } from '@/hooks/queries/group-study-homework-api';
import { useToastStore } from '@/stores/use-toast-store';

const SubmitHomeworkFormSchema = z.object({
  textContent: z.string().min(1, '과제 상세 내용을 입력해주세요.').max(1000),
  attachmentLink: z.string().optional(),
});

type SubmitHomeworkFormValues = z.infer<typeof SubmitHomeworkFormSchema>;

interface SubmitHomeworkModalProps {
  missionId: number; // todo api response 타입 적용
  onSuccess?: () => void;
}

// 과제 제출 모달
export default function SubmitHomeworkModal({
  missionId,
  onSuccess,
}: SubmitHomeworkModalProps) {
  const [open, setOpen] = useState<boolean>(false);
  const methods = useForm<SubmitHomeworkFormValues>({
    resolver: zodResolver(SubmitHomeworkFormSchema),
    mode: 'onChange',
    defaultValues: {
      textContent: '',
      attachmentLink: '',
    },
  });

  return (
    <FormProvider {...methods}>
      <Modal.Root open={open} onOpenChange={setOpen}>
        <Modal.Trigger asChild>
          <Button
            size="medium"
            className="font-designer-16m w-fit"
            color="primary"
          >
            과제 제출하기
          </Button>
        </Modal.Trigger>

        <Modal.Portal>
          <Modal.Overlay />
          <Modal.Content className="w-[840px]">
            <Modal.Header variant="form">
              <Modal.Title className="font-designer-20b text-text-strong">
                과제 제출하기
              </Modal.Title>
              <Modal.CloseButton onClick={() => setOpen(false)} />
            </Modal.Header>

            <SubmitHomeworkForm
              missionId={missionId}
              onClose={() => setOpen(false)}
              onSuccess={() => {
                methods.reset();
                onSuccess?.();
              }}
            />
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>
    </FormProvider>
  );
}

interface SubmitHomeworkFormProps {
  missionId: number;
  onClose: () => void;
  onSuccess?: () => void;
}

function SubmitHomeworkForm({
  missionId,
  onClose,
  onSuccess,
}: SubmitHomeworkFormProps) {
  const methods = useFormContext<SubmitHomeworkFormValues>();
  const { handleSubmit, formState } = methods;

  const { mutate: submitHomework } = useSubmitHomework();
  const showToast = useToastStore((state) => state.showToast);

  const onValidSubmit = (values: SubmitHomeworkFormValues) => {
    submitHomework(
      {
        missionId,
        request: {
          textContent: values.textContent,
          optionalSubmission: { link: values.attachmentLink },
        },
      },
      {
        onSuccess: async () => {
          showToast('과제가 성공적으로 제출되었습니다!');
          onClose();
          onSuccess?.();
        },
        onError: () => {
          showToast('과제 제출에 실패했습니다. 다시 시도해주세요.', 'error');
        },
      },
    );
  };

  return (
    <>
      <Modal.Body variant="form">
        <form
          id="submit-homework"
          className="flex flex-col gap-300"
          onSubmit={handleSubmit(onValidSubmit)}
        >
          <FormField<SubmitHomeworkFormValues, 'textContent'>
            name="textContent"
            label="과제 상세 내용"
            direction="vertical"
            required
            maxCharCount={1000}
            showCounterRight={false}
          >
            <TextAreaInput
              id="textContent"
              className="min-h-[230px]"
              placeholder="학습한 내용을 자세히 작성해 주세요."
              maxLength={1000}
            />
          </FormField>

          <FormField<SubmitHomeworkFormValues, 'attachmentLink'>
            name="attachmentLink"
            label="첨부 링크"
            direction="vertical"
          >
            <BaseInput
              id="attachmentLink"
              placeholder="https://notion.so/... 또는 블로그 링크"
              maxLength={500}
            />
          </FormField>
        </form>
      </Modal.Body>

      <Modal.Footer variant="form">
        <Modal.Close asChild>
          <Button color="secondary" size="large" onClick={onClose}>
            취소
          </Button>
        </Modal.Close>
        <Button
          color="primary"
          size="large"
          type="submit"
          form="submit-homework"
          disabled={!formState.isValid || formState.isSubmitting}
        >
          제출하기
        </Button>
      </Modal.Footer>
    </>
  );
}
