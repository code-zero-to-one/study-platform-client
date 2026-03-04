import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import Button from '@/components/common/ui/button';
import FormField from '@/components/common/ui/form/form-field';
import { Modal } from '@/components/common/ui/modal';
import { useUpdateMemberDiscretion } from '@/hooks/queries/group-study-member-api';
import { useToastStore } from '@/stores/use-toast-store';
import { TextAreaInput } from '../common/ui/input';

const DiscretionaryEvaluationFormSchema = z.object({
  content: z.string().min(1, '평가 내역을 입력해주세요.'),
});

type DiscretionaryEvaluationFormValues = z.infer<
  typeof DiscretionaryEvaluationFormSchema
>;

interface DiscretionaryEvaluationModalProps {
  groupStudyId: number;
  memberId: number;
}

export default function DiscretionaryEvaluationModal({
  groupStudyId,
  memberId,
}: DiscretionaryEvaluationModalProps) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button
          size="small"
          color="outlined"
          className="font-designer-14r w-fit"
        >
          재량평가 추가
        </Button>
      </Modal.Trigger>

      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content className="w-[840px]">
          <Modal.Header variant="form">
            <div className="flex flex-col gap-50">
              <Modal.Title className="font-designer-20b text-text-strong">
                재량 평가
              </Modal.Title>
              <p className="font-designer-14r text-text-subtle">
                재량 평가는 최대 3회까지 가능하며, 각 평가별 5점씩 부여됩니다.
              </p>
            </div>
            <Modal.CloseButton onClick={() => setOpen(false)} />
          </Modal.Header>

          <DiscretionaryEvaluationForm
            groupStudyId={groupStudyId}
            memberId={memberId}
            onClose={() => setOpen(false)}
          />
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

interface DiscretionaryEvaluationFormProps {
  groupStudyId: number;
  memberId: number;
  onClose: () => void;
}

function DiscretionaryEvaluationForm({
  groupStudyId,
  memberId,
  onClose,
}: DiscretionaryEvaluationFormProps) {
  const methods = useForm<DiscretionaryEvaluationFormValues>({
    resolver: zodResolver(DiscretionaryEvaluationFormSchema),
    mode: 'onChange',
    defaultValues: {
      content: '',
    },
  });

  const { handleSubmit, formState } = methods;

  const { mutate: updateMemberDiscretion } = useUpdateMemberDiscretion();
  const showToast = useToastStore((state) => state.showToast);

  const onValidSubmit = (values: DiscretionaryEvaluationFormValues) => {
    updateMemberDiscretion(
      {
        id: groupStudyId,
        request: {
          targetMemberId: memberId,
          reason: values.content,
        },
      },
      {
        onSuccess: () => {
          showToast('재량 평가가 성공적으로 제출되었습니다!');
          onClose();
        },
        onError: () => {
          showToast(
            '재량 평가 제출에 실패했습니다. 다시 시도해주세요.',
            'error',
          );
        },
      },
    );
  };

  return (
    <FormProvider {...methods}>
      <Modal.Body variant="form">
        <form
          id="discretionary-evaluation"
          className="flex flex-col gap-300"
          onSubmit={handleSubmit(onValidSubmit)}
        >
          <FormField<DiscretionaryEvaluationFormValues, 'content'>
            name="content"
            label="평가 내역"
            direction="vertical"
            counterMax={500}
            showCounterRight={false}
            required
          >
            <TextAreaInput
              id="content"
              placeholder="평가 내역을 입력해 주세요."
              className="min-h-[300px]"
              maxLength={5000}
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
          form="discretionary-evaluation"
          disabled={!formState.isValid || formState.isSubmitting}
        >
          평가완료
        </Button>
      </Modal.Footer>
    </FormProvider>
  );
}
