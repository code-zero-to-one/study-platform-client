import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import Button from '@/components/common/ui/button';
import FormField from '@/components/common/ui/form/form-field';
import { TextAreaInput } from '@/components/common/ui/input';
import { Modal } from '@/components/common/ui/modal';
import { useUpdateMemberDiscretion } from '@/hooks/queries/group-study-member-api';
import { useToastStore } from '@/stores/use-toast-store';

export const EVALUATION_COUNT = 3;
const EVALUATION_CONTENT_MAX_LENGTH = 5000;

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

const DISCRETION_EVALUATION_SCORE = 5;

export default function DiscretionaryEvaluationModal({
  groupStudyId,
  memberId,
}: DiscretionaryEvaluationModalProps) {
  const [open, setOpen] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const { mutate, isPending } = useUpdateMemberDiscretion();

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button
          size="small"
          color="outlined"
          className="font-designer-14r w-fit"
          disabled={isPending || hasSubmitted}
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
                재량 평가는 최대 {EVALUATION_COUNT}회까지 가능하며, 각 평가별
                {DISCRETION_EVALUATION_SCORE}점씩 부여됩니다.
              </p>
            </div>
            <Modal.CloseButton onClick={() => setOpen(false)} />
          </Modal.Header>

          <DiscretionaryEvaluationForm
            groupStudyId={groupStudyId}
            memberId={memberId}
            onClose={() => setOpen(false)}
            onSubmitSuccess={() => setHasSubmitted(true)}
            mutate={mutate}
            isPending={isPending}
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
  onSubmitSuccess: () => void;
  mutate: ReturnType<typeof useUpdateMemberDiscretion>['mutate'];
  isPending: boolean;
}

function DiscretionaryEvaluationForm({
  groupStudyId,
  memberId,
  onClose,
  onSubmitSuccess,
  mutate,
  isPending,
}: DiscretionaryEvaluationFormProps) {
  const methods = useForm<DiscretionaryEvaluationFormValues>({
    resolver: zodResolver(DiscretionaryEvaluationFormSchema),
    mode: 'onChange',
    defaultValues: {
      content: '',
    },
  });

  const { handleSubmit, formState } = methods;

  const showToast = useToastStore((state) => state.showToast);

  const onValidSubmit = (values: DiscretionaryEvaluationFormValues) => {
    mutate(
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
          onSubmitSuccess();
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
            maxCharCount={EVALUATION_CONTENT_MAX_LENGTH}
            showCounterRight={false}
            required
          >
            <TextAreaInput
              id="content"
              placeholder="평가 내역을 입력해 주세요."
              className="min-h-[300px]"
              maxLength={EVALUATION_CONTENT_MAX_LENGTH}
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
          disabled={!formState.isValid || isPending}
        >
          평가완료
        </Button>
      </Modal.Footer>
    </FormProvider>
  );
}
