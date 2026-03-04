import { zodResolver } from '@hookform/resolvers/zod';
import { XIcon } from 'lucide-react';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import Button from '@/components/common/ui/button';
import FormField from '@/components/common/ui/form/form-field';
import { TextAreaInput } from '@/components/common/ui/input';
import { Modal } from '@/components/common/ui/modal';
import { useUpdateGreeting } from '@/hooks/queries/group-study-member-api';
import {
  WriteGreetingFormSchema,
  WriteGreetingFormValues,
} from '@/types/schemas/write-greeting-form.schema';

interface WriteGreetingModalProps {
  groupStudyId: number;
}

export default function WriteGreetingModal({
  groupStudyId,
}: WriteGreetingModalProps) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button>작성하기</Button>
      </Modal.Trigger>

      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content className="w-[840px]">
          <Modal.Header className="border-border-default flex justify-between border-b">
            <Modal.Title className="font-designer-20b text-text-strong">
              가입인사
            </Modal.Title>
            <Modal.Close onClick={() => setOpen(false)}>
              <XIcon />
            </Modal.Close>
          </Modal.Header>

          <WriteGreetingForm
            groupStudyId={groupStudyId}
            onClose={() => setOpen(false)}
          />
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

interface WriteGreetingFormProps {
  groupStudyId: number;
  onClose: () => void;
}

function WriteGreetingForm({ onClose, groupStudyId }: WriteGreetingFormProps) {
  const methods = useForm<WriteGreetingFormValues>({
    resolver: zodResolver(WriteGreetingFormSchema),
    mode: 'onChange',
    defaultValues: { greeting: '' },
  });

  const { handleSubmit, formState } = methods;

  const { mutate: updateGreeting } = useUpdateGreeting();

  const onValidSubmit = (values: WriteGreetingFormValues) => {
    updateGreeting(
      {
        id: groupStudyId,
        request: { content: values.greeting },
      },
      {
        onSuccess: () => {
          alert('가입인사를 작성하였습니다!');
          onClose();
        },
      },
    );
  };

  return (
    <FormProvider {...methods}>
      <Modal.Body className="flex flex-col gap-400 px-400 py-300">
        <form
          id="write-greeting"
          className="flex flex-col gap-150"
          onSubmit={handleSubmit(onValidSubmit)}
        >
          <FormField<WriteGreetingFormValues, 'greeting'>
            name="greeting"
            label="나에 대한 소개 혹은 지원동기를 작성해주세요."
            direction="vertical"
            required
          >
            <TextAreaInput
              id="greeting"
              placeholder="안녕하세요. 함께 성장하고 싶은 마음으로 스터디에 참여하게 되었습니다.&#13;&#10;혼자 공부할 때보다 서로의 경험과 피드백을 나누며 더 깊이 배우고 싶어요. 잘 부탁드립니다 :)"
              minLength={20}
              maxLength={100}
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
          form="write-greeting"
          disabled={!formState.isValid || formState.isSubmitting}
        >
          완료
        </Button>
      </Modal.Footer>
    </FormProvider>
  );
}
