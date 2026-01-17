import { zodResolver } from '@hookform/resolvers/zod';
import { XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import Button from '@/components/ui/button';
import DatePicker from '@/components/ui/date-picker';
import FormField from '@/components/ui/form/form-field';
import { BaseInput, TextAreaInput } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { useGroupStudyDetailQuery } from '@/features/study/group/model/use-study-query';
import { useGetMission, useUpdateMission } from '@/hooks/queries/mission-api';

// Form Schema
const EditMissionFormSchema = z.object({
  title: z.string().min(1, '미션 제목을 입력해주세요.'),
  description: z.string().optional(),
  weekNum: z.string().optional(),
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
  missionId: number;
  groupStudyId: number;
}

export default function EditMissionModal({
  missionId,
  groupStudyId,
}: EditMissionModalProps) {
  const [open, setOpen] = useState<boolean>(false);
  const { data: missionData, isLoading } = useGetMission(missionId);
  const { data: studyData } = useGroupStudyDetailQuery(groupStudyId);

  const studyEndDate = studyData?.basicInfo?.endDate;

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

          {isLoading ? (
            <Modal.Body className="flex items-center justify-center py-500">
              <span className="text-text-subtle">로딩 중...</span>
            </Modal.Body>
          ) : missionData ? (
            <EditMissionForm
              missionData={missionData}
              missionId={missionId}
              studyEndDate={studyEndDate}
              onClose={() => setOpen(false)}
            />
          ) : null}
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

interface EditMissionFormProps {
  missionData: {
    missionTitle?: string;
    missionDescription?: string;
    weekNum?: number;
    missionGuide?: string;
    missionStartDate?: string;
    missionEndDate?: string;
  };
  missionId: number;
  studyEndDate?: string;
  onClose: () => void;
}

function EditMissionForm({
  missionData,
  missionId,
  studyEndDate,
  onClose,
}: EditMissionFormProps) {
  const methods = useForm<EditMissionFormValues>({
    resolver: zodResolver(EditMissionFormSchema),
    mode: 'onChange',
    defaultValues: {
      title: missionData.missionTitle || '',
      description: missionData.missionDescription || '',
      weekNum: missionData.weekNum?.toString() || '',
      guide: missionData.missionGuide || '',
      dateRange: {
        from: missionData.missionStartDate
          ? new Date(missionData.missionStartDate)
          : new Date(),
        to: missionData.missionEndDate
          ? new Date(missionData.missionEndDate)
          : new Date(),
      },
    },
  });

  useEffect(() => {
    methods.reset({
      title: missionData.missionTitle || '',
      description: missionData.missionDescription || '',
      weekNum: missionData.weekNum?.toString() || '',
      guide: missionData.missionGuide || '',
      dateRange: {
        from: missionData.missionStartDate
          ? new Date(missionData.missionStartDate)
          : new Date(),
        to: missionData.missionEndDate
          ? new Date(missionData.missionEndDate)
          : new Date(),
      },
    });
  }, [missionData, methods]);

  const { handleSubmit, formState, control } = methods;

  const { mutate: updateMission } = useUpdateMission();

  const onValidSubmit = (values: EditMissionFormValues) => {
    const startDate = values.dateRange.from.toISOString();
    const endDate = values.dateRange.to.toISOString();

    updateMission(
      {
        missionId,
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
          alert('미션이 성공적으로 수정되었습니다!');
          onClose();
        },
        onError: () => {
          alert('미션 수정에 실패했습니다. 다시 시도해주세요.');
        },
      },
    );
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

          <FormField<EditMissionFormValues, 'weekNum'>
            name="weekNum"
            label="미션 주차"
            direction="vertical"
          >
            <BaseInput
              type="number"
              min={0}
              id="weekNum"
              placeholder="커리큘럼 미션인 경우 주차를 입력해 주세요. (예: 1)"
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
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    // 미션 시작일: 오늘 이전 날짜 비활성화
                    if (date < today) {
                      return true;
                    }

                    // 미션 마감일: 스터디 종료일 이후 날짜 비활성화
                    if (studyEndDate) {
                      const endDate = new Date(studyEndDate);
                      endDate.setHours(23, 59, 59, 999);
                      if (date > endDate) {
                        return true;
                      }
                    }

                    return false;
                  }}
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
