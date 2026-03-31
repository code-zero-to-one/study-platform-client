import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import Button from '@/components/common/ui/button';
import MarkdownEditor from '@/components/common/ui/editor/markdown-editor';
import FormField from '@/components/common/ui/form/form-field';
import { BaseInput } from '@/components/common/ui/input';
import { Modal } from '@/components/common/ui/modal';
import {
  requestMentorMarkdownImageUploadTicket,
  uploadMarkdownImageFile,
} from '@/features/mentoring/model/mentor-markdown-image-upload';
import { useEditHomework } from '@/hooks/queries/group-study-homework-api';
import { useToastStore } from '@/stores/use-toast-store';
import { formatExternalLink } from '@/utils/format';
import { isValidUrl } from '@/utils/validation';

const uploadHomeworkMarkdownImage = async (file: File) => {
  const ticket = await requestMentorMarkdownImageUploadTicket({
    fileName: file.name,
  });
  await uploadMarkdownImageFile({ uploadUrl: ticket.uploadUrl, file });

  return ticket.publicUrl;
};

const EditHomeworkFormSchema = z.object({
  textContent: z.string().min(1, '과제 상세 내용을 입력해주세요.'),
  attachmentLink: z
    .string()
    .optional()
    .refine((val) => !val || isValidUrl(val), {
      message: '올바른 URL 형식을 입력해주세요. (예: https://example.com)',
    }),
});

type EditHomeworkFormValues = z.infer<typeof EditHomeworkFormSchema>;

interface EditHomeworkModalProps {
  defaultValue: EditHomeworkFormValues;
  homeworkId: number;
  onSuccess?: () => void;
}

// 과제 수정 모달
export default function EditHomeworkModal({
  defaultValue,
  homeworkId,
  onSuccess,
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
          <Modal.Header variant="form">
            <Modal.Title className="font-designer-20b text-text-strong">
              과제 수정하기
            </Modal.Title>
            <Modal.CloseButton onClick={() => setOpen(false)} />
          </Modal.Header>

          <EditHomeworkForm
            defaultValue={defaultValue}
            homeworkId={homeworkId}
            onClose={() => setOpen(false)}
            onSuccess={onSuccess}
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
  onSuccess?: () => void;
}

function EditHomeworkForm({
  defaultValue,
  homeworkId,
  onClose,
  onSuccess,
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
  const showToast = useToastStore((state) => state.showToast);

  const onValidSubmit = (values: EditHomeworkFormValues) => {
    editHomework(
      {
        homeworkId,
        request: {
          textContent: values.textContent,
          optionalSubmission: {
            link: values.attachmentLink
              ? formatExternalLink(values.attachmentLink)
              : values.attachmentLink,
          },
        },
      },
      {
        onSuccess: async () => {
          showToast('과제가 성공적으로 수정되었습니다!');
          onClose();
          onSuccess?.();
        },
        onError: () => {
          showToast('과제 수정에 실패했습니다. 다시 시도해주세요.', 'error');
        },
      },
    );
  };

  return (
    <FormProvider {...methods}>
      <Modal.Body variant="form">
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
          >
            <MarkdownEditor
              placeholder="학습한 내용을 자세히 작성해 주세요."
              uploadImage={uploadHomeworkMarkdownImage}
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
          수정하기
        </Button>
      </Modal.Footer>
    </FormProvider>
  );
}
