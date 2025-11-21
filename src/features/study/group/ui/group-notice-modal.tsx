'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { XIcon } from 'lucide-react';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import Button from '@/components/ui/button';
import FormField from '@/components/ui/form/form-field';
import { BaseInput, TextAreaInput } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { GroupStudyNoticeRequest } from '../api/group-study-types';
import {
  buildGroupStudyNoticeDefaults,
  GroupStudyNoticeFormSchema,
  GroupStudyNoticeFormValues,
} from '../model/group-study-notice.schema';
import { useGroupStudyNoticeMutation } from '../model/use-group-study-notice-query';

interface GroupStudyNoticeModalProps {
  trigger: React.ReactNode;
  groupStudyId: number;
  defaultValues?: GroupStudyNoticeFormValues;
}

export default function GroupStudyNoticeModal({
  trigger,
  groupStudyId,
  defaultValues,
}: GroupStudyNoticeModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Modal.Root open={isOpen} onOpenChange={setIsOpen}>
      <Modal.Trigger asChild>{trigger}</Modal.Trigger>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header className="border-border-default flex items-center justify-between border-b">
            <Modal.Title>채널 공지사항</Modal.Title>
            <Modal.Close>
              <XIcon />
            </Modal.Close>
          </Modal.Header>

          <GroupStudyNoticeForm
            groupStudyId={groupStudyId}
            onClose={() => setIsOpen(false)}
            defaultValues={defaultValues}
          />
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

function GroupStudyNoticeForm({
  groupStudyId,
  onClose,
  defaultValues,
}: {
  groupStudyId: number;
  onClose: () => void;
  defaultValues?: GroupStudyNoticeFormValues;
}) {
  const qc = useQueryClient();
  const { mutate: groupStudyNotice, isPending } = useGroupStudyNoticeMutation();

  const methods = useForm<GroupStudyNoticeFormValues>({
    resolver: zodResolver(GroupStudyNoticeFormSchema),
    mode: 'onChange',
    defaultValues: defaultValues ?? buildGroupStudyNoticeDefaults(),
  });

  const type: 'add' | 'edit' = defaultValues ? 'edit' : 'add';

  const {
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = methods;

  const onSubmit = (values: GroupStudyNoticeFormValues) => {
    const form: GroupStudyNoticeRequest = {
      noticeTitle: values.noticeTitle,
      noticeContent: values.noticeContent,
    };

    groupStudyNotice(
      { groupStudyId, payload: form },
      {
        onSuccess: async () => {
          alert(`스터디 공지가 ${type === 'add' ? '등록' : '수정'}되었습니다!`);
          onClose();
          await qc.invalidateQueries({
            queryKey: ['post', groupStudyId],
          });
        },
        onError: () => {
          alert(
            `공지 ${type === 'add' ? '등록' : '수정'} 중 오류가 발생했습니다. 다시 시도해 주세요.`,
          );
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
            <FormField<GroupStudyNoticeFormValues, 'noticeTitle'>
              name="noticeTitle"
              label="공지 제목을 입력해 주세요."
              direction="vertical"
            >
              <BaseInput placeholder="제목을 입력하세요." />
            </FormField>

            <FormField<GroupStudyNoticeFormValues, 'noticeContent'>
              name="noticeContent"
              label="스터디 공지, 규칙 등을 안내해주세요."
              direction="vertical"
              showCounterRight
              counterMax={100}
            >
              <TextAreaInput
                placeholder="스터디 공지, 규칙 등을 안내해주세요."
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
            완료
          </Button>
        </div>
      </Modal.Footer>
    </>
  );
}
