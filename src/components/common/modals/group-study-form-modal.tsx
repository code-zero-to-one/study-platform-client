'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { sendGTMEvent } from '@next/third-parties/google';
import { useQueryClient } from '@tanstack/react-query';
import { XIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import type { GroupStudyFullResponseDto } from '@/api/openapi';
import { Modal } from '@/components/common/ui/modal';
import GroupStudyForm from '@/components/forms/group-study-form';
import { THUMBNAIL_EXTENSION } from '@/config/group-study-const';
import { useAuthReady } from '@/features/auth/model/use-auth';
import {
  hasPendingBlobImagesInGroupStudyDescription,
  serializeGroupStudyDescriptionForRequest,
} from '@/features/group-study/model/group-study-markdown';
import {
  useCreateGroupStudyMutation,
  useUpdateGroupStudyMutation,
} from '@/hooks/queries/use-group-study-mutation';
import { usePhoneVerificationStatus } from '@/hooks/queries/use-phone-verification-status';
import { useGroupStudyDetailQuery } from '@/hooks/queries/use-study-query';
import { useToastStore } from '@/stores/use-toast-store';
import {
  buildGroupStudyEditFormSchema,
  buildOpenGroupDefaultValues,
  GroupStudyFormSchema,
  type GroupStudyFormValues,
  type StudyClassification,
  toCreateRequest,
  toUpdateRequest,
} from '@/types/schemas/group-study-form.schema';

const PhoneVerificationModal = dynamic(
  () => import('@/components/common/modals/phone-verification-modal'),
  { ssr: false },
);

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
  } = useGroupStudyDetailQuery(
    mode === 'edit' && controlledOpen ? (groupStudyId ?? 0) : 0,
  );

  const {
    isVerified,
    isLoading: isVerificationLoading,
    isError: isVerificationError,
    setVerified,
  } = usePhoneVerificationStatus(memberId ?? undefined);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  const originalStartDateRef = useRef<string | undefined>(undefined);

  const createMethods = useForm<GroupStudyFormValues>({
    resolver: zodResolver(GroupStudyFormSchema),
    mode: 'onChange',
    defaultValues: buildOpenGroupDefaultValues(classification),
  });

  const editMethods = useForm<GroupStudyFormValues>({
    resolver: (values, context, options) => {
      const schema = buildGroupStudyEditFormSchema(
        originalStartDateRef.current,
      );

      return zodResolver(schema)(values, context, options);
    },
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
    const isCreateOpening = mode === 'create' && isOpen;

    if (isCreateOpening && isVerificationLoading) {
      return;
    }
    if (isCreateOpening && isVerificationError) {
      showToast(
        '인증 상태를 확인할 수 없습니다. 잠시 후 다시 시도해주세요.',
        'error',
      );

      return;
    }
    if (isCreateOpening && !isVerified) {
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

  const refineStudyDetail = useCallback(
    (value: GroupStudyFullResponseDto): GroupStudyFormValues => {
      const rawClassification = value.basicInfo?.classification;
      const refinedClassification: StudyClassification =
        rawClassification === 'GROUP_STUDY'
          ? 'GROUP_STUDY'
          : rawClassification === 'MENTOR_STUDY'
            ? 'PREMIUM_STUDY'
            : classification;
      const originalType = value.basicInfo?.type;

      let refinedType = originalType;
      if (
        refinedClassification === 'GROUP_STUDY' &&
        originalType === 'MENTORING'
      ) {
        refinedType = 'PROJECT';
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
        descriptionPendingImages: [],
        interviewPost: value.interviewPost?.interviewPost?.map(
          (q: { question?: string }) => q.question,
        ),
        thumbnailExtension: (() => {
          const ext =
            value.detailInfo?.image?.resizedImages?.[0]?.resizedImageUrl
              ?.split('.')
              .pop()
              ?.toUpperCase();

          return (THUMBNAIL_EXTENSION as readonly string[]).includes(ext ?? '')
            ? (ext as GroupStudyFormValues['thumbnailExtension'])
            : 'DEFAULT';
        })(),
        thumbnailUrl:
          value.detailInfo?.image?.resizedImages?.[0]?.resizedImageUrl,
      };
    },
    [classification],
  );

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

  const uploadDescriptionImages = async ({
    uploadUrls,
    pendingUploads,
  }: {
    uploadUrls: string[] | undefined;
    pendingUploads: GroupStudyFormValues['descriptionPendingImages'];
  }) => {
    if (!pendingUploads || pendingUploads.length === 0) {
      return {
        failedCount: 0,
      };
    }

    const uploadPairs = pendingUploads.map((pendingUpload, index) => ({
      pendingUpload,
      uploadUrl: uploadUrls?.[index],
    }));
    const missingUploadUrlCount = uploadPairs.filter(
      ({ uploadUrl }) => !uploadUrl,
    ).length;

    const settledResults = await Promise.allSettled(
      uploadPairs
        .filter(
          (pair): pair is typeof pair & { uploadUrl: string } =>
            typeof pair.uploadUrl === 'string' && pair.uploadUrl.length > 0,
        )
        .map(({ uploadUrl, pendingUpload }) =>
          uploadThumbnail(uploadUrl, pendingUpload.file),
        ),
    );

    return {
      failedCount:
        missingUploadUrlCount +
        settledResults.filter((result) => result.status === 'rejected').length,
    };
  };

  const assertResolvedDescriptionImages = (description: string) => {
    if (!hasPendingBlobImagesInGroupStudyDescription(description)) {
      return;
    }

    throw new Error(
      '스터디 소개 이미지 업로드 준비에 실패했습니다. 이미지를 다시 추가해주세요.',
    );
  };

  const handleCreate = async (values: GroupStudyFormValues) => {
    try {
      const serializedDescription = serializeGroupStudyDescriptionForRequest({
        content: values.description,
        pendingImages: createMethods.getValues('descriptionPendingImages'),
      });
      assertResolvedDescriptionImages(serializedDescription.description);
      const body = toCreateRequest({
        ...values,
        description: serializedDescription.description,
      });
      const createdResponse = await createGroupStudy(body);

      if (values.thumbnailFile) {
        if (!createdResponse.content.thumbnailUploadUrl) {
          throw new Error('썸네일 업로드 URL이 없습니다.');
        }

        await uploadThumbnail(
          createdResponse.content.thumbnailUploadUrl,
          values.thumbnailFile,
        );
      }

      const descriptionUploadResult = await uploadDescriptionImages({
        uploadUrls: createdResponse.content?.descriptionImageUploadUrls,
        pendingUploads: serializedDescription.pendingUploads,
      });

      await invalidateGroupStudyQueries();
      showToast(
        descriptionUploadResult.failedCount > 0
          ? '그룹 스터디는 개설되었지만 일부 소개 이미지 업로드에 실패했습니다.'
          : '그룹 스터디 개설이 완료되었습니다.',
        descriptionUploadResult.failedCount > 0 ? 'info' : 'success',
      );
    } catch {
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
      const serializedDescription = serializeGroupStudyDescriptionForRequest({
        content: values.description,
        pendingImages: editMethods.getValues('descriptionPendingImages'),
      });
      assertResolvedDescriptionImages(serializedDescription.description);
      const body = toUpdateRequest({
        ...values,
        description: serializedDescription.description,
      });
      const updatedResponse = await updateGroupStudy(body);

      if (values.thumbnailFile) {
        if (!updatedResponse.content.thumbnailUploadUrl) {
          throw new Error('썸네일 업로드 URL이 없습니다.');
        }

        await uploadThumbnail(
          updatedResponse.content.thumbnailUploadUrl,
          values.thumbnailFile,
        );
      }

      const descriptionUploadResult = await uploadDescriptionImages({
        uploadUrls: updatedResponse.content?.descriptionImageUploadUrls,
        pendingUploads: serializedDescription.pendingUploads,
      });

      await refetchGroupStudyInfo();
      showToast(
        descriptionUploadResult.failedCount > 0
          ? '그룹 스터디는 수정되었지만 일부 소개 이미지 업로드에 실패했습니다.'
          : '그룹 스터디 수정이 완료되었습니다.',
        descriptionUploadResult.failedCount > 0 ? 'info' : 'success',
      );
    } catch {
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

  useEffect(() => {
    if (mode === 'edit' && controlledOpen && groupStudyInfo) {
      originalStartDateRef.current = groupStudyInfo.basicInfo?.startDate;
      editMethods.reset(refineStudyDetail(groupStudyInfo));
    }
  }, [controlledOpen, groupStudyInfo, editMethods, mode, refineStudyDetail]);

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
                mode="create"
              />
            )}
            {mode === 'edit' && isGroupStudyLoading && (
              <Modal.Body className="font-designer-16m text-text-subtle py-700 text-center">
                스터디 정보를 불러오는 중입니다...
              </Modal.Body>
            )}
            {mode === 'edit' && !isGroupStudyLoading && groupStudyInfo && (
              <GroupStudyForm
                methods={editMethods}
                onSubmit={handleSubmitForm}
                mode="edit"
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
