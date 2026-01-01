import { zodResolver } from '@hookform/resolvers/zod';
import { XIcon } from 'lucide-react';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import Button from '@/components/ui/button';
import FormField from '@/components/ui/form/form-field';
import { Modal } from '@/components/ui/modal';

import { useEditHomework } from '@/hooks/queries/group-study-homework-api';
import { BaseInput, TextAreaInput } from '../ui/input';

const EditHomeworkFormSchema = z.object({
  textContent: z.string().min(1, '과제 상세 내용을 입력해주세요.'),
  attachmentLink: z.string().optional(),
});

type EditHomeworkFormValues = z.infer<typeof EditHomeworkFormSchema>;

interface EditHomeworkModalProps {
  defaultValue: EditHomeworkFormValues;
  homeworkId: number; // todo api response 타입 적용
}

// 과제 수정 모달
export default function EditHomeworkModal({
  defaultValue,
  homeworkId,
}: EditHomeworkModalProps) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button
          size="medium"
          className="font-designer-14r w-fit"
          color="outlined"
        >
          수정하기
        </Button>
      </Modal.Trigger>

      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content className="w-[840px]">
          <Modal.Header className="border-border-default flex justify-between border-b">
            <Modal.Title className="font-designer-20b text-text-strong">
              과제 수정하기
            </Modal.Title>
            <Modal.Close onClick={() => setOpen(false)}>
              <XIcon />
            </Modal.Close>
          </Modal.Header>

          <EditHomeworkForm
            defaultValue={defaultValue}
            homeworkId={homeworkId}
            onClose={() => setOpen(false)}
          />
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

interface EditHomeworkFormProps {
  defaultValue: EditHomeworkFormValues;
  homeworkId: number;
  onClose: () => void;
}

function EditHomeworkForm({
  defaultValue,
  homeworkId,
  onClose,
}: EditHomeworkFormProps) {
  const methods = useForm<EditHomeworkFormValues>({
    resolver: zodResolver(EditHomeworkFormSchema),
    mode: 'onChange',
    defaultValues: {
      textContent: defaultValue.textContent,
      attachmentLink: defaultValue.attachmentLink,
    },
  });

  const { handleSubmit, formState } = methods;

  const { mutate: editHomework } = useEditHomework();

  const onValidSubmit = (values: EditHomeworkFormValues) => {
    editHomework(
      {
        homeworkId,
        request: {
          textContent: values.textContent,
          optionalSubmission: { link: values.attachmentLink },
        },
      },
      {
        onSuccess: async () => {
          alert('과제가 성공적으로 수정되었습니다!');
          onClose();
        },
        onError: () => {
          alert('과제 수정에 실패했습니다. 다시 시도해주세요.');
        },
      },
    );
  };

  return (
    <FormProvider {...methods}>
      <Modal.Body className="flex flex-col gap-300 px-400 py-300">
        <form
          id="submit-homework"
          className="flex flex-col gap-300"
          onSubmit={handleSubmit(onValidSubmit)}
        >
          <FormField<EditHomeworkFormValues, 'textContent'>
            name="textContent"
            label="과제 상세 내용"
            direction="vertical"
            required
            counterMax={5000}
            showCounterRight={false}
          >
            <TextAreaInput
              id="textContent"
              className="min-h-[230px]"
              placeholder="학습한 내용을 자세히 작성해 주세요."
              maxLength={5000}
            />
          </FormField>

          <FormField<EditHomeworkFormValues, 'attachmentLink'>
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

      <Modal.Footer className="flex justify-end gap-100">
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
          수정하기
        </Button>
      </Modal.Footer>
    </FormProvider>
  );
}
