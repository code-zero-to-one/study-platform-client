import { zodResolver } from '@hookform/resolvers/zod';
import { XIcon } from 'lucide-react';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import Button from '@/components/ui/button';
import FormField from '@/components/ui/form/form-field';
import { Modal } from '@/components/ui/modal';
import { GroupItems } from '@/components/ui/toggle';
import { useUpdateEvaluation } from '@/hooks/queries/evaluation-api';
import { TextAreaInput } from '../ui/input';

// 평가 등급 옵션
const GRADE_OPTIONS = [
  { value: 'A_PLUS', label: 'A+ (4.5)' },
  { value: 'A', label: 'A (4.0)' },
  { value: 'B_PLUS', label: 'B+ (3.5)' },
  { value: 'B', label: 'B (3.0)' },
  { value: 'C_PLUS', label: 'C+ (2.5)' },
  { value: 'C', label: 'C (2.0)' },
  { value: 'D_PLUS', label: 'D+ (1.5)' },
  { value: 'D', label: 'D (1.0)' },
  { value: 'F', label: 'F (0)' },
];

const EditEvaluationFormSchema = z.object({
  grade: z.enum([
    'A_PLUS',
    'A',
    'B_PLUS',
    'B',
    'C_PLUS',
    'C',
    'D_PLUS',
    'D',
    'F',
  ]),
  comment: z.string().min(1, '정성 코멘트를 입력해주세요.'),
});

type EditEvaluationFormValues = z.infer<typeof EditEvaluationFormSchema>;

interface EditEvaluationModalProps {
  evaluationId: number; // todo api response 타입 적용
}

export default function EditEvaluationModal({
  evaluationId,
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
          <Modal.Header className="border-border-default flex justify-between border-b">
            <Modal.Title className="font-designer-20b text-text-strong">
              평가 수정
            </Modal.Title>
            <Modal.Close onClick={() => setOpen(false)}>
              <XIcon />
            </Modal.Close>
          </Modal.Header>

          <EditEvaluationForm
            evaluationId={evaluationId}
            onClose={() => setOpen(false)}
          />
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

interface EditEvaluationFormProps {
  evaluationId: number;
  onClose: () => void;
}

function EditEvaluationForm({
  evaluationId,
  onClose,
}: EditEvaluationFormProps) {
  const methods = useForm<EditEvaluationFormValues>({
    resolver: zodResolver(EditEvaluationFormSchema),
    mode: 'onChange',
    defaultValues: {
      grade: undefined,
      comment: '',
    },
  });

  const { handleSubmit, formState } = methods;

  const { mutate: updateEvaluation } = useUpdateEvaluation();

  const onValidSubmit = (values: EditEvaluationFormValues) => {
    updateEvaluation(
      {
        evaluationId,
        request: values,
      },
      {
        onSuccess: () => {
          alert('평가가 성공적으로 수정되었습니다!');
          onClose();
        },
        onError: () => {
          alert('평가 수정에 실패했습니다. 다시 시도해주세요.');
        },
      },
    );
  };

  return (
    <FormProvider {...methods}>
      <Modal.Body className="flex flex-col gap-400 px-400 py-300">
        <form
          id="edit-evaluation"
          className="flex flex-col gap-300"
          onSubmit={handleSubmit(onValidSubmit)}
        >
          <FormField<EditEvaluationFormValues, 'grade'>
            name="grade"
            label="평가 점수 선택"
            direction="vertical"
            required
          >
            <GroupItems
              variant="square"
              options={GRADE_OPTIONS}
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
              maxLength={5000}
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
          form="edit-evaluation"
          disabled={!formState.isValid || formState.isSubmitting}
        >
          평가 완료
        </Button>
      </Modal.Footer>
    </FormProvider>
  );
}
