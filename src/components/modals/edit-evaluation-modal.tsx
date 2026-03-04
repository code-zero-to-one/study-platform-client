import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { EvaluationResponse } from '@/api/openapi';
import Button from '@/components/common/ui/button';
import FormField from '@/components/common/ui/form/form-field';
import { Modal } from '@/components/common/ui/modal';
import { GroupItems } from '@/components/common/ui/toggle';
import {
  useGetMissionEvaluationGrades,
  useUpdateEvaluation,
} from '@/hooks/queries/evaluation-api';
import { useToastStore } from '@/stores/use-toast-store';
import { TextAreaInput } from '../common/ui/input';

const EditEvaluationFormSchema = z.object({
  gradeCode: z.enum([
    'A_PLUS',
    'A_MINUS',
    'B_PLUS',
    'B_MINUS',
    'C_PLUS',
    'C_MINUS',
    'F',
  ]),
  comment: z.string().min(1, '정성 코멘트를 입력해주세요.'),
});

type EditEvaluationFormValues = z.infer<typeof EditEvaluationFormSchema>;

interface EditEvaluationModalProps {
  evaluationId: EvaluationResponse['evaluationId'];
  defaultValues?: EditEvaluationFormValues;
}

export default function EditEvaluationModal({
  evaluationId,
  defaultValues,
}: EditEvaluationModalProps) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button
          color="outlined"
          size="small"
          className="font-designer-14r w-[96px]"
        >
          수정하기
        </Button>
      </Modal.Trigger>

      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content className="w-[840px]">
          <Modal.Header variant="form">
            <Modal.Title className="font-designer-20b text-text-strong">
              평가 수정
            </Modal.Title>
            <Modal.CloseButton onClick={() => setOpen(false)} />
          </Modal.Header>

          <EditEvaluationForm
            evaluationId={evaluationId}
            defaultValues={defaultValues}
            onClose={() => setOpen(false)}
          />
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

interface EditEvaluationFormProps {
  evaluationId: EvaluationResponse['evaluationId'];
  defaultValues?: Partial<EditEvaluationFormValues>;
  onClose: () => void;
}

function EditEvaluationForm({
  evaluationId,
  defaultValues,
  onClose,
}: EditEvaluationFormProps) {
  const methods = useForm<EditEvaluationFormValues>({
    resolver: zodResolver(EditEvaluationFormSchema),
    mode: 'onChange',
    defaultValues: {
      gradeCode: defaultValues?.gradeCode ?? undefined,
      comment: defaultValues?.comment ?? '',
    },
  });

  const { handleSubmit, formState } = methods;

  const { data: grades } = useGetMissionEvaluationGrades();
  const { mutate: updateEvaluation } = useUpdateEvaluation();
  const showToast = useToastStore((state) => state.showToast);

  const onValidSubmit = (values: EditEvaluationFormValues) => {
    updateEvaluation(
      {
        evaluationId,
        request: values,
      },
      {
        onSuccess: () => {
          showToast('평가가 성공적으로 수정되었습니다!');
          onClose();
        },
        onError: () => {
          showToast('평가 수정에 실패했습니다. 다시 시도해주세요.', 'error');
        },
      },
    );
  };

  const gradeOptions = grades
    ?.sort((a, b) => a.orderNum - b.orderNum)
    .map((grade) => ({
      value: grade.code,
      label: `${grade.label} (${grade.score === 0 ? '0' : grade.score.toFixed(1)})`,
    }));

  return (
    <FormProvider {...methods}>
      <Modal.Body variant="form">
        <form
          id="edit-evaluation"
          className="flex flex-col gap-300"
          onSubmit={handleSubmit(onValidSubmit)}
        >
          <FormField<EditEvaluationFormValues, 'gradeCode'>
            name="gradeCode"
            label="평가 점수 선택"
            direction="vertical"
            required
          >
            <GroupItems
              variant="square"
              options={gradeOptions}
              multiple={false}
              allowDeselect={false}
            />
          </FormField>

          <FormField<EditEvaluationFormValues, 'comment'>
            name="comment"
            label="정성 코멘트"
            direction="vertical"
            required
          >
            <TextAreaInput
              id="comment"
              placeholder="정성 코멘트를 입력해 주세요."
              className="min-h-[230px]"
              maxLength={1000}
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
          form="edit-evaluation"
          disabled={!formState.isValid || formState.isSubmitting}
        >
          평가 완료
        </Button>
      </Modal.Footer>
    </FormProvider>
  );
}
