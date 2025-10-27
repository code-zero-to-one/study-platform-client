'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { XIcon } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';
import Button from '@/shared/ui/button';
import FormField from '@/shared/ui/form/form-field';
import { TextAreaInput } from '@/shared/ui/input';
import { Modal } from '@/shared/ui/modal';
import {
  DeleteGroupStudyMemberFormSchema,
  DeleteGroupStudyMemberFormValues,
} from '../model/delete-group-study-member-form.schema';
import { useDeleteGroupStudyMemberMutation } from '../model/use-delete-group-study-member';

interface DeleteGroupStudyMemberModalProps {
  groupStudyId: number;
  targetMemberId: number;
  open: boolean;
  onChangeOpen: (open: boolean) => void;
}

export default function DeleteGroupStudyMemberModal({
  groupStudyId,
  targetMemberId,
  open,
  onChangeOpen,
}: DeleteGroupStudyMemberModalProps) {
  return (
    <Modal.Root open={open} onOpenChange={onChangeOpen}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content className="w-[840px]">
          <Modal.Header className="border-border-default flex justify-between border-b">
            <Modal.Title className="font-designer-20b text-text-strong">
              내보내기
            </Modal.Title>
            <Modal.Close onClick={() => onChangeOpen(false)}>
              <XIcon />
            </Modal.Close>
          </Modal.Header>

          <DeleteGroupStudyMemberForm
            groupStudyId={groupStudyId}
            targetMemberId={targetMemberId}
            onClose={() => onChangeOpen(false)}
          />
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

interface DeleteGroupStudyMemberFormProps {
  groupStudyId: number;
  targetMemberId: number;
  onClose: () => void;
}

function DeleteGroupStudyMemberForm({
  groupStudyId,
  targetMemberId,
  onClose,
}: DeleteGroupStudyMemberFormProps) {
  const methods = useForm<DeleteGroupStudyMemberFormValues>({
    resolver: zodResolver(DeleteGroupStudyMemberFormSchema),
    mode: 'onChange',
    defaultValues: { reason: '' },
  });

  const { handleSubmit, formState } = methods;

  const { mutate: deleteGroupStudyMember } =
    useDeleteGroupStudyMemberMutation(groupStudyId);

  const onValidSubmit = (values: DeleteGroupStudyMemberFormValues) => {
    deleteGroupStudyMember({
      reason: values.reason,
      targetMemberId: targetMemberId,
    });
    onClose();
  };

  return (
    <FormProvider {...methods}>
      <Modal.Body className="flex flex-col gap-400 px-400 py-300">
        <form
          id="delete-group-study-member"
          className="flex flex-col gap-150"
          onSubmit={handleSubmit(onValidSubmit)}
        >
          <FormField<DeleteGroupStudyMemberFormValues, 'reason'>
            name="reason"
            label="스터디원을 내보내는 사유를 작성해 주세요."
            direction="vertical"
            required
          >
            <TextAreaInput
              id="reason"
              placeholder="내보내는 이유나 상황을 간단히 작성해주세요."
              className="h-[216px]"
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
          form="delete-group-study-member"
          disabled={!formState.isValid || formState.isSubmitting}
        >
          강퇴
        </Button>
      </Modal.Footer>
    </FormProvider>
  );
}
