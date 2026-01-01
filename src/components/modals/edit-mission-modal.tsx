import { zodResolver } from '@hookform/resolvers/zod';
import { XIcon } from 'lucide-react';
import { useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import Button from '@/components/ui/button';
import DatePicker from '@/components/ui/date-picker';
import FormField from '@/components/ui/form/form-field';
import { BaseInput, TextAreaInput } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { useUpdateMission } from '@/hooks/queries/mission-api';

// Form Schema
const EditMissionFormSchema = z.object({
  title: z.string().min(1, '미션 제목을 입력해주세요.'),
  description: z.string().optional(),
  guide: z.string().min(1, '수행 가이드를 입력해주세요.'),
  dateRange: z
    .object({
      from: z.date({ error: '시작일을 선택해주세요.' }),
      to: z.date({ error: '종료일을 선택해주세요.' }),
    })
    .refine((data) => data.from && data.to && data.from <= data.to, {
      message: '미션이 시작되면 수정 및 삭제가 불가합니다.',
    }),
});

type EditMissionFormValues = z.infer<typeof EditMissionFormSchema>;

interface EditMissionModalProps {
  defaultValue: EditMissionFormValues;
  missionId: number;
}

export default function EditMissionModal({
  defaultValue,
  missionId,
}: EditMissionModalProps) {
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
              미션 수정
            </Modal.Title>
            <Modal.Close onClick={() => setOpen(false)}>
              <XIcon />
            </Modal.Close>
          </Modal.Header>

          <EditMissionForm
            defaultValue={defaultValue}
            missionId={missionId}
            onClose={() => setOpen(false)}
          />
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

interface EditMissionFormProps {
  defaultValue: EditMissionFormValues;
  missionId: number;
  onClose: () => void;
}

function EditMissionForm({
  defaultValue,
  missionId,
  onClose,
}: EditMissionFormProps) {
  const methods = useForm<EditMissionFormValues>({
    resolver: zodResolver(EditMissionFormSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      guide: '',
      dateRange: undefined,
    },
  });

  const { handleSubmit, formState, control } = methods;

  const { mutate: updateMission } = useUpdateMission();

  const onValidSubmit = (values: EditMissionFormValues) => {
    // todo api guide가 반영 안됨 - 임시로 description과 guide 합침

    const content = values.description
      ? `${values.description}\n\n${values.guide}`
      : values.guide;

    const startTime = values.dateRange.from.toISOString();
    const endTime = values.dateRange.to.toISOString();

    // todo guide 반영
    // updateMission(
    //   {
    //     missionId,
    //     request: {
    //       title: values.title,
    //       content,
    //       startTime,
    //       endTime,
    //     },
    //   },
    //   {
    //     onSuccess: () => {
    //       alert('미션이 성공적으로 생성되었습니다!');
    //       onClose();
    //     },
    //     onError: () => {
    //       alert('미션 생성에 실패했습니다. 다시 시도해주세요.');
    //     },
    //   },
    // );
  };

  return (
    <FormProvider {...methods}>
      <Modal.Body className="flex flex-col gap-400 px-400 py-300">
        <form
          id="edit-mission"
          className="flex flex-col gap-300"
          onSubmit={handleSubmit(onValidSubmit)}
        >
          <FormField<EditMissionFormValues, 'title'>
            name="title"
            label="미션 제목"
            direction="vertical"
            required
          >
            <BaseInput
              id="title"
              placeholder="미션 제목을 입력해 주세요."
              maxLength={50}
            />
          </FormField>

          <FormField<EditMissionFormValues, 'description'>
            name="description"
            label="미션 설명"
            direction="vertical"
          >
            <BaseInput
              id="description"
              placeholder="미션 설명을 입력해 주세요."
              maxLength={100}
            />
          </FormField>

          <FormField<EditMissionFormValues, 'guide'>
            name="guide"
            label="수행 가이드"
            direction="vertical"
            required
            counterMax={5000}
            showCounterRight={false}
          >
            <TextAreaInput
              id="guide"
              placeholder="미션 수행 가이드를 상세히 작성해 주세요."
              maxLength={5000}
              className="min-h-[230px]"
              hideMeta
            />
          </FormField>

          <FormField<EditMissionFormValues, 'dateRange'>
            name="dateRange"
            label="시작일 / 종료일"
            direction="vertical"
            required
          >
            <Controller
              name="dateRange"
              control={control}
              render={({ field }) => (
                <DatePicker
                  mode="range"
                  selected={field.value}
                  onSelect={(date) => field.onChange(date)}
                />
              )}
            />
          </FormField>
        </form>
      </Modal.Body>

      <Modal.Footer className="flex items-center justify-between">
        <span className="font-designer-13r text-text-error">
          미션이 시작되기 전까지 수정이 가능합니다.
        </span>

        <div className="flex justify-end gap-100">
          <Modal.Close asChild>
            <Button color="secondary" size="large" onClick={onClose}>
              취소
            </Button>
          </Modal.Close>
          <Button
            color="primary"
            size="large"
            type="submit"
            form="edit-mission"
            disabled={!formState.isValid || formState.isSubmitting}
          >
            미션 수정
          </Button>
        </div>
      </Modal.Footer>
    </FormProvider>
  );
}
