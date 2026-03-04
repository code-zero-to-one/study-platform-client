import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import Button from '@/components/common/ui/button';
import FormField from '@/components/common/ui/form/form-field';
import { TextAreaInput } from '@/components/common/ui/input';
import { Modal } from '@/components/common/ui/modal';
import { GroupItems } from '@/components/common/ui/toggle';
import {
  useCreateEvaluation,
  useGetMissionEvaluationGrades,
} from '@/hooks/queries/evaluation-api';
import { useScrollToNextField } from '@/hooks/use-scroll-to-next-field';
import { useToastStore } from '@/stores/use-toast-store';

const CreateEvaluationFormSchema = z.object({
  gradeCode: z.enum([
    'A_PLUS',
    'A_MINUS',
    'B_PLUS',
    'B_MINUS',
    'C_PLUS',
    'C_MINUS',
    'F',
  ]),
  comment: z.string().min(1, '정성 코멘트를 입력해주세요.').max(1000),
});

type CreateEvaluationFormValues = z.infer<typeof CreateEvaluationFormSchema>;

interface CreateEvaluationModalProps {
  homeworkId: number; // todo api response 타입 적용
}

export default function CreateEvaluationModal({
  homeworkId,
}: CreateEvaluationModalProps) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button size="medium" className="font-designer-16r w-fit">
          과제 평가하기
        </Button>
      </Modal.Trigger>

      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content className="w-[840px]">
          <Modal.Header variant="form">
            <Modal.Title className="font-designer-20b text-text-strong">
              평가하기
            </Modal.Title>
            <Modal.CloseButton onClick={() => setOpen(false)} />
          </Modal.Header>

          <CreateEvaluationForm
            homeworkId={homeworkId}
            onClose={() => setOpen(false)}
          />
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

interface CreateEvaluationFormProps {
  homeworkId: number; // todo api response 타입 적용
  onClose: () => void;
}

function CreateEvaluationForm({
  homeworkId,
  onClose,
}: CreateEvaluationFormProps) {
  const methods = useForm<CreateEvaluationFormValues>({
    resolver: zodResolver(CreateEvaluationFormSchema),
    mode: 'onChange',
    defaultValues: {
      gradeCode: undefined,
      comment: '',
    },
  });

  const { handleSubmit, formState } = methods;

  const scrollToNext = useScrollToNextField();
  const { data: grades } = useGetMissionEvaluationGrades();
  const { mutate: createEvaluation } = useCreateEvaluation();
  const showToast = useToastStore((state) => state.showToast);

  const onValidSubmit = (values: CreateEvaluationFormValues) => {
    createEvaluation(
      {
        homeworkId,
        request: values,
      },
      {
        onSuccess: () => {
          showToast('평가가 성공적으로 제출되었습니다!');
          onClose();
        },
        onError: () => {
          showToast('평가 제출에 실패했습니다. 다시 시도해주세요.', 'error');
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
          id="create-evaluation"
          className="flex flex-col gap-300"
          onSubmit={handleSubmit(onValidSubmit)}
        >
          <FormField<CreateEvaluationFormValues, 'gradeCode'>
            name="gradeCode"
            label="평가 점수 선택"
            direction="vertical"
            required
            scrollable
            onAfterChange={() => scrollToNext('gradeCode')}
          >
            <GroupItems
              variant="square"
              options={gradeOptions}
              multiple={false}
              allowDeselect={false}
            />
          </FormField>

          <FormField<CreateEvaluationFormValues, 'comment'>
            name="comment"
            label="정성 코멘트"
            direction="vertical"
            required
            scrollable
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
          form="create-evaluation"
          disabled={!formState.isValid || formState.isSubmitting}
        >
          평가 완료
        </Button>
      </Modal.Footer>
    </FormProvider>
  );
}
