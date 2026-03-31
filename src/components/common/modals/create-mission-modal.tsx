import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import { Plus } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import Button from '@/components/common/ui/button';
import DatePicker from '@/components/common/ui/date-picker';
import MarkdownEditor from '@/components/common/ui/editor/markdown-editor';
import FormField from '@/components/common/ui/form/form-field';
import { BaseInput } from '@/components/common/ui/input';
import { Modal } from '@/components/common/ui/modal';
import {
  requestMentorMarkdownImageUploadTicket,
  uploadMarkdownImageFile,
} from '@/features/mentoring/model/mentor-markdown-image-upload';
import { useCreateMission, useGetMissions } from '@/hooks/queries/mission-api';
import { useGroupStudyDetailQuery } from '@/hooks/queries/use-study-query';
import { useToastStore } from '@/stores/use-toast-store';
import {
  createDisabledDateMatcherForMission,
  type MissionPeriod,
} from '@/utils/time';

const uploadMissionMarkdownImage = async (file: File) => {
  const ticket = await requestMentorMarkdownImageUploadTicket({
    fileName: file.name,
  });
  await uploadMarkdownImageFile({ uploadUrl: ticket.uploadUrl, file });

  return ticket.publicUrl;
};

// Form Schema
const CreateMissionFormSchema = z.object({
  title: z
    .string()
    .min(1, '미션 제목을 입력해주세요.')
    .max(80, '80자 이하로 작성 가능합니다.'),
  description: z.string().optional(),
  weekNum: z.string().max(100, '100자 이하로 작성 가능합니다.').optional(),
  guide: z.string().min(1, '수행 가이드를 입력해주세요.'),
  dateRange: z
    .object(
      {
        from: z.date({ message: '시작일을 선택해주세요.' }),
        to: z.date({ message: '종료일을 선택해주세요.' }),
      },
      { message: '시작일과 종료일을 선택해주세요.' },
    )
    .refine((data) => data.from && data.to && data.from <= data.to, {
      message: '종료일은 시작일 이후여야 합니다.',
    }),
});

type CreateMissionFormValues = z.infer<typeof CreateMissionFormSchema>;

interface CreateMissionModalProps {
  groupStudyId: number;
}

export default function CreateMissionModal({
  groupStudyId,
}: CreateMissionModalProps) {
  const [open, setOpen] = useState<boolean>(false);
  const { data: studyData } = useGroupStudyDetailQuery(groupStudyId);
  const { data: existingMissions } = useGetMissions({
    groupStudyId,
    pageSize: 100,
  });

  const studyStartDate = studyData?.basicInfo?.startDate;
  const studyEndDate = studyData?.basicInfo?.endDate;

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button
          color="primary"
          size="medium"
          icon={<Plus className="text-text-inverse" />}
          iconPosition="left"
          className="w-fit"
        >
          새 미션 만들기
        </Button>
      </Modal.Trigger>

      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content className="w-[840px]">
          <Modal.Header variant="form">
            <Modal.Title className="font-designer-20b text-text-strong">
              새 미션 만들기
            </Modal.Title>
            <Modal.CloseButton onClick={() => setOpen(false)} />
          </Modal.Header>

          <CreateMissionForm
            groupStudyId={groupStudyId}
            studyStartDate={studyStartDate}
            studyEndDate={studyEndDate}
            existingMissions={existingMissions?.content}
            onClose={() => setOpen(false)}
          />
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

interface CreateMissionFormProps {
  groupStudyId: number;
  studyStartDate?: string;
  studyEndDate?: string;
  existingMissions?: MissionPeriod[];
  onClose: () => void;
}

function CreateMissionForm({
  groupStudyId,
  studyStartDate,
  studyEndDate,
  existingMissions,
  onClose,
}: CreateMissionFormProps) {
  const methods = useForm<CreateMissionFormValues>({
    resolver: zodResolver(CreateMissionFormSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      weekNum: '',
      guide: '',
      dateRange: undefined,
    },
  });

  const { handleSubmit, formState, control } = methods;

  const { mutate: createMission } = useCreateMission();
  const showToast = useToastStore((state) => state.showToast);

  const onValidSubmit = (values: CreateMissionFormValues) => {
    const startDate = dayjs(values.dateRange.from).format('YYYY-MM-DD');
    const endDate = dayjs(values.dateRange.to).format('YYYY-MM-DD');

    createMission(
      {
        groupStudyId,
        request: {
          title: values.title,
          guide: values.guide,
          description: values.description,
          weekNum: values.weekNum ? Number(values.weekNum) : undefined,
          startDate,
          endDate,
        },
      },
      {
        onSuccess: () => {
          showToast('미션이 성공적으로 생성되었습니다!');
          onClose();
        },
        onError: () => {
          showToast('미션 생성에 실패했습니다. 다시 시도해주세요.', 'error');
        },
      },
    );
  };

  const handlePreventInvalidValue = (event: FormEvent<HTMLInputElement>) => {
    event.currentTarget.value = event.currentTarget.value.replace(
      /[^0-9]/g,
      '',
    );
  };

  return (
    <FormProvider {...methods}>
      <Modal.Body variant="form">
        <form
          id="create-mission"
          className="flex flex-col gap-300"
          onSubmit={handleSubmit(onValidSubmit)}
        >
          <FormField<CreateMissionFormValues, 'title'>
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

          <FormField<CreateMissionFormValues, 'description'>
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

          <FormField<CreateMissionFormValues, 'weekNum'>
            name="weekNum"
            label="미션 주차"
            direction="vertical"
          >
            <BaseInput
              type="number"
              min={0}
              onInput={handlePreventInvalidValue}
              id="weekNum"
              placeholder="커리큘럼 미션인 경우 주차를 입력해 주세요. (예: 1)"
            />
          </FormField>

          <FormField<CreateMissionFormValues, 'guide'>
            name="guide"
            label="수행 가이드"
            direction="vertical"
            required
          >
            <MarkdownEditor
              placeholder="미션 수행 가이드를 상세히 작성해 주세요."
              uploadImage={uploadMissionMarkdownImage}
            />
          </FormField>

          <FormField<CreateMissionFormValues, 'dateRange'>
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
                  disabled={createDisabledDateMatcherForMission({
                    studyStartDate,
                    studyEndDate,
                    existingMissions,
                  })}
                />
              )}
            />
          </FormField>
        </form>
      </Modal.Body>

      <Modal.Footer
        variant="form"
        className="flex items-center justify-between"
      >
        <span className="font-designer-13r text-text-error">
          미션이 시작되면 수정 및 삭제가 불가합니다.
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
            form="create-mission"
            disabled={!formState.isValid || formState.isSubmitting}
          >
            미션 생성
          </Button>
        </div>
      </Modal.Footer>
    </FormProvider>
  );
}
