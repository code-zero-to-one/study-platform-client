'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import { useQueryClient } from '@tanstack/react-query';
import { XIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { GroupStudyFullResponseDto } from '@/api/openapi';
import { Modal } from '@/components/ui/modal';
import { usePhoneVerificationStatus } from '@/features/phone-verification/model/use-phone-verification-status';
import PhoneVerificationModal from '@/features/phone-verification/ui/phone-verification-modal';
import { useAuthReady } from '@/hooks/common/use-auth';
import GroupStudyForm from './group-study-form';

import {
  useCreateGroupStudyMutation,
  useUpdateGroupStudyMutation,
} from '../const/use-group-study-mutation';
import {
  buildOpenGroupDefaultValues,
  GroupStudyFormValues,
  StudyClassification,
  toCreateRequest,
  toUpdateRequest,
} from '../model/group-study-form.schema';
import { useGroupStudyDetailQuery } from '../model/use-study-query';

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
      alert('인증 상태를 확인할 수 없습니다. 잠시 후 다시 시도해주세요.');

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
    if (isGroupStudyLoading) return;

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
        value.basicInfo.studyLeaderParticipation ?? false,
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
      alert('그룹 스터디 개설이 완료되었습니다!');
    } catch (err) {
      console.error('[handleCreate] 그룹 스터디 개설 실패:', err);
      alert('그룹 스터디 개설 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
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
      alert('그룹 스터디 수정이 완료되었습니다!');
    } catch (err) {
      alert('그룹 스터디 수정 중 오류가 발생했습니다. 다시 시도해 주세요.');
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
            <GroupStudyForm
              defaultValues={
                mode === 'create'
                  ? buildOpenGroupDefaultValues(classification)
                  : refineStudyDetail(groupStudyInfo!)
              }
              onSubmit={handleSubmitForm}
            />
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
