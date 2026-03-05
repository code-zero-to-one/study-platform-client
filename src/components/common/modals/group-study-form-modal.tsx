'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { sendGTMEvent } from '@next/third-parties/google';
import { useQueryClient } from '@tanstack/react-query';
import { XIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { GroupStudyFullResponseDto } from '@/api/openapi';
import PhoneVerificationModal from '@/components/common/modals/phone-verification-modal';
import { Modal } from '@/components/common/ui/modal';
import GroupStudyForm from '@/components/forms/group-study-form';
import { useAuthReady } from '@/hooks/common/use-auth';
import {
  useCreateGroupStudyMutation,
  useUpdateGroupStudyMutation,
} from '@/hooks/queries/use-group-study-mutation';
import { usePhoneVerificationStatus } from '@/hooks/queries/use-phone-verification-status';
import { useGroupStudyDetailQuery } from '@/hooks/queries/use-study-query';
import { useToastStore } from '@/stores/use-toast-store';

import {
  buildOpenGroupDefaultValues,
  GroupStudyFormSchema,
  GroupStudyFormValues,
  StudyClassification,
  toCreateRequest,
  toUpdateRequest,
} from '@/types/schemas/group-study-form.schema';

export type { StudyClassification };

interface GroupStudyModalProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: () => void;
  mode: 'create' | 'edit';
  groupStudyId?: number;
  classification?: StudyClassification;
}

export default function GroupStudyFormModal({
  trigger,
  mode,
  open: controlledOpen = false,
  groupStudyId,
  onOpenChange: onControlledOpen,
  classification = 'GROUP_STUDY',
}: GroupStudyModalProps) {
  const showToast = useToastStore((state) => state.showToast);
  const router = useRouter();
  const qc = useQueryClient();
  const [open, setOpen] = useState<boolean>(false);
  const { memberId } = useAuthReady();
  const { mutateAsync: createGroupStudy } = useCreateGroupStudyMutation();
  const { mutateAsync: updateGroupStudy } = useUpdateGroupStudyMutation(
    groupStudyId!,
  );
  const {
    data: groupStudyInfo,
    isLoading: isGroupStudyLoading,
    refetch: refetchGroupStudyInfo,
  } = useGroupStudyDetailQuery(groupStudyId!);

  const {
    isVerified,
    isLoading: isVerificationLoading,
    isError: isVerificationError,
    setVerified,
  } = usePhoneVerificationStatus(memberId ?? undefined);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  const createMethods = useForm<GroupStudyFormValues>({
    resolver: zodResolver(GroupStudyFormSchema),
    mode: 'onChange',
    defaultValues: buildOpenGroupDefaultValues(classification),
  });

  const editMethods = useForm<GroupStudyFormValues>({
    resolver: zodResolver(GroupStudyFormSchema),
    mode: 'onChange',
  });

  const handleVerificationComplete = (phoneNumber: string) => {
    setVerified(phoneNumber);
    setIsVerificationModalOpen(false);
    if (mode === 'create') {
      setOpen(true);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (mode === 'create' && isOpen && isVerificationLoading) {
      return;
    }
    if (mode === 'create' && isOpen && isVerificationError) {
      showToast(
        '인증 상태를 확인할 수 없습니다. 잠시 후 다시 시도해주세요.',
        'error',
      );

      return;
    }
    if (isOpen && mode === 'create' && !isVerified) {
      setIsVerificationModalOpen(true);
      setOpen(false); // 스터디 모달은 닫힘 유지

      return;
    }

    if (mode === 'create') {
      setOpen(isOpen);
    } else {
      if (onControlledOpen) onControlledOpen();
    }
  };

  const refineStudyDetail = (value: GroupStudyFullResponseDto) => {
    const refinedClassification =
      value.basicInfo?.classification ?? classification;
    const originalType = value.basicInfo?.type;

    let refinedType = originalType;
    if (
      refinedClassification === 'GROUP_STUDY' &&
      originalType === 'MENTORING'
    ) {
      refinedType = undefined;
    }

    return {
      classification: refinedClassification,
      studyLeaderParticipation:
        value.basicInfo?.studyLeaderParticipation ?? false,
      type: refinedType,
      targetRoles: value.basicInfo?.targetRoles,
      maxMembersCount: value.basicInfo?.maxMembersCount?.toString() ?? '',
      experienceLevels: value.basicInfo?.experienceLevels,
      method: value.basicInfo?.method,
      location: value.basicInfo?.location,
      regularMeeting: value.basicInfo?.regularMeeting,
      startDate: value.basicInfo?.startDate,
      endDate: value.basicInfo?.endDate,
      price: value.basicInfo?.price?.toString() ?? '',
      title: value.detailInfo?.title,
      description: value.detailInfo?.description,
      summary: value.detailInfo?.summary,
      interviewPost: value.interviewPost?.interviewPost?.map(
        (q: { question?: string }) => q.question,
      ),
      thumbnailExtension:
        value.detailInfo?.image?.resizedImages?.[0]?.resizedImageUrl
          ?.split('.')
          .pop()
          ?.toUpperCase() as GroupStudyFormValues['thumbnailExtension'],
      thumbnailUrl:
        value.detailInfo?.image?.resizedImages?.[0]?.resizedImageUrl,
    };
  };

  const invalidateGroupStudyQueries = async () => {
    await qc.invalidateQueries({ queryKey: ['studies'] });
    await qc.invalidateQueries({ queryKey: ['memberStudies'] });
    router.refresh();
  };

  const uploadThumbnail = async (uploadUrl: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(uploadUrl, {
      method: 'PUT',
      body: formData,
    });

    if (!res.ok) {
      throw new Error(
        `파일 업로드 실패 (status: ${res.status}, message: ${res.statusText})`,
      );
    }
  };

  const handleCreate = async (values: GroupStudyFormValues) => {
    try {
      const body = toCreateRequest(values);
      const created = await createGroupStudy(body);

      if (values.thumbnailFile) {
        if (!created.content.thumbnailUploadUrl) {
          throw new Error('썸네일 업로드 URL이 없습니다.');
        }

        await uploadThumbnail(
          created.content.thumbnailUploadUrl,
          values.thumbnailFile,
        );
      }

      await invalidateGroupStudyQueries();
      showToast('그룹 스터디 개설이 완료되었습니다.', 'success');
    } catch (err) {
      console.error('[handleCreate] 그룹 스터디 개설 실패:', err);
      showToast(
        '그룹 스터디 개설 중 오류가 발생했습니다. 다시 시도해 주세요.',
        'error',
      );
    } finally {
      createMethods.reset(buildOpenGroupDefaultValues(classification));
      setOpen(false);
    }
  };

  const handleEdit = async (values: GroupStudyFormValues) => {
    try {
      const body = toUpdateRequest(values);
      const updated = await updateGroupStudy(body);

      if (values.thumbnailFile) {
        if (!updated.content.thumbnailUploadUrl) {
          throw new Error('썸네일 업로드 URL이 없습니다.');
        }

        await uploadThumbnail(
          updated.content.thumbnailUploadUrl,
          values.thumbnailFile,
        );
      }

      await refetchGroupStudyInfo();
      showToast('그룹 스터디 수정이 완료되었습니다.', 'success');
    } catch (err) {
      showToast(
        '그룹 스터디 수정 중 오류가 발생했습니다. 다시 시도해 주세요.',
        'error',
      );
    } finally {
      if (onControlledOpen) onControlledOpen();
    }
  };

  const handleSubmitForm = async (values: GroupStudyFormValues) => {
    if (mode === 'create') {
      await handleCreate(values);
    } else {
      await handleEdit(values);
    }
  };

  useEffect(() => {
    if (open && mode === 'create') {
      sendGTMEvent({
        event: 'group_study_create_modal_open',
      });
    }
  }, [open, mode]);

  const editDefaultValues =
    mode === 'edit' && groupStudyInfo
      ? refineStudyDetail(groupStudyInfo)
      : null;

  useEffect(() => {
    if (mode === 'edit' && controlledOpen && groupStudyInfo) {
      editMethods.reset(refineStudyDetail(groupStudyInfo));
    }
  }, [controlledOpen, groupStudyInfo]);

  return (
    <>
      <Modal.Root
        open={mode === 'create' ? open : controlledOpen}
        onOpenChange={handleOpenChange}
      >
        {trigger && <Modal.Trigger asChild>{trigger}</Modal.Trigger>}
        <Modal.Portal>
          <Modal.Overlay />
          <Modal.Content size="large">
            <Modal.Header className="border-border-default flex items-center justify-between border-b">
              <Modal.Title className="font-designer-20b">
                {mode === 'create' ? '스터디 개설하기' : '스터디 수정하기'}
              </Modal.Title>
              <Modal.Close>
                <XIcon />
              </Modal.Close>
            </Modal.Header>
            {mode === 'create' && (
              <GroupStudyForm
                methods={createMethods}
                onSubmit={handleSubmitForm}
              />
            )}
            {mode === 'edit' && isGroupStudyLoading && (
              <Modal.Body className="font-designer-16m text-text-subtle py-800 text-center">
                스터디 정보를 불러오는 중입니다...
              </Modal.Body>
            )}
            {mode === 'edit' && !isGroupStudyLoading && editDefaultValues && (
              <GroupStudyForm
                methods={editMethods}
                onSubmit={handleSubmitForm}
              />
            )}
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>

      <PhoneVerificationModal
        open={isVerificationModalOpen}
        onOpenChange={setIsVerificationModalOpen}
        onVerificationComplete={handleVerificationComplete}
        memberId={memberId ?? undefined}
      />
    </>
  );
}
