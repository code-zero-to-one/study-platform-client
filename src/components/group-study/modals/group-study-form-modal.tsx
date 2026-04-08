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
import GroupStudyForm from '@/components/group-study/forms/group-study-form';
import { STUDY_TYPES, THUMBNAIL_EXTENSION } from '@/config/group-study-const';
import { useAuthReady } from '@/features/auth/model/use-auth';
import {
  hasPendingBlobImagesInGroupStudyDescription,
  serializeGroupStudyDescriptionForRequest,
} from '@/features/group-study/model/group-study-markdown';
import {
  useCreateGroupStudyMutation,
  useUpdateGroupStudyMutation,
} from '@/hooks/queries/group-study/use-group-study-mutation';
import { usePhoneVerificationStatus } from '@/hooks/queries/use-phone-verification-status';
import { useGroupStudyDetailQuery } from '@/hooks/queries/one-to-one/use-study-query';
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

function resolveClassification(
  raw: string | undefined,
  fallback: StudyClassification,
): StudyClassification {
  if (raw === 'GROUP_STUDY') return 'GROUP_STUDY';
  if (raw === 'MENTOR_STUDY' || raw === 'PREMIUM_STUDY') return 'PREMIUM_STUDY';

  return fallback;
}

/**
 * 1. const T extends readonly string[]
     T는 제네릭 타입 파라미터입니다.
     readonly string[]를 상속한다는 뜻이라서, "문자열 배열 또는 문자열 튜플"만 받을 수 있습니다.
     앞의 const는 const generic이라서, ['PROJECT', 'MENTORING'] 같은 튜플 리터럴 정보를 최대한 보존합니다.
     그래서 STUDY_TYPES를 넣으면 T가 그냥 string[]가 아니라 readonly ['PROJECT', 'MENTORING', ...]처럼 추론됩니다.
  2. values: T
     첫 번째 인자로 받은 배열의 실제 타입을 T로 잡습니다.
     예를 들어 isOneOf(STUDY_TYPES, normalized)를 호출하면 T는 typeof STUDY_TYPES가 됩니다.
  3. : candidate is T[number]
     이게 타입 가드입니다.
     "함수가 true를 반환하면, 그 시점부터 candidate는 T[number] 타입이다"라는 뜻입니다.
     T[number]는 배열/튜플의 원소 타입입니다.
     예를 들면:
     typeof STUDY_TYPES[number]
     는
     'PROJECT' | 'MENTORING' | 'SEMINAR' | ... 가 됩니다.
 * @param values
 * @param candidate
 * @returns
 */
function isOneOf<const T extends readonly string[]>(
  values: T,
  candidate: string,
): candidate is T[number] {
  return values.some((value) => value === candidate);
}

function resolveStudyType(
  raw: string | undefined,
  resolvedClassification: StudyClassification,
): GroupStudyFormValues['type'] | undefined {
  const normalized =
    resolvedClassification === 'GROUP_STUDY' && raw === 'MENTORING'
      ? 'PROJECT'
      : raw;

  return normalized && isOneOf(STUDY_TYPES, normalized)
    ? normalized
    : undefined;
}

function resolveThumbnailExtension(
  imageUrl: string | undefined,
): GroupStudyFormValues['thumbnailExtension'] {
  const ext = imageUrl?.split('.').pop()?.toUpperCase();

  return ext && isOneOf(THUMBNAIL_EXTENSION, ext) ? ext : 'DEFAULT';
}

function prepareDescription(
  content: GroupStudyFormValues['description'],
  pendingImages: GroupStudyFormValues['descriptionPendingImages'],
) {
  const result = serializeGroupStudyDescriptionForRequest({
    content,
    pendingImages,
  });
  if (hasPendingBlobImagesInGroupStudyDescription(result.description)) {
    throw new Error(
      '스터디 소개 이미지 업로드 준비에 실패했습니다. 이미지를 다시 추가해주세요.',
    );
  }

  return result;
}

interface GroupStudyModalProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  mode: 'create' | 'edit';
  groupStudyId?: number;
  classification?: StudyClassification;
}

export default function GroupStudyFormModal({
  trigger,
  mode,
  open: controlledOpen = false,
  groupStudyId,
  onOpenChange: onClose,
  classification = 'GROUP_STUDY',
}: GroupStudyModalProps) {
  const showToast = useToastStore((state) => state.showToast);
  const router = useRouter();
  const qc = useQueryClient();
  const [open, setOpen] = useState<boolean>(false);
  const { memberId } = useAuthReady();
  const { mutateAsync: createGroupStudy } = useCreateGroupStudyMutation();
  const { mutateAsync: updateGroupStudy } =
    useUpdateGroupStudyMutation(groupStudyId);
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
      if (onClose) onClose(isOpen);
    }
  };

  const refineStudyDetail = useCallback(
    (value: GroupStudyFullResponseDto): GroupStudyFormValues => {
      const resolvedClassification = resolveClassification(
        value.basicInfo?.classification,
        classification,
      );
      const thumbnailUrl =
        value.detailInfo?.image?.resizedImages?.[0]?.resizedImageUrl;

      return {
        classification: resolvedClassification,
        type: resolveStudyType(value.basicInfo?.type, resolvedClassification),
        thumbnailExtension: resolveThumbnailExtension(thumbnailUrl),
        thumbnailUrl,
        studyLeaderParticipation:
          value.basicInfo?.studyLeaderParticipation ?? false,
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
        interviewPost: value.interviewPost?.interviewPost
          ?.map((q) => q.question)
          .filter((q): q is string => Boolean(q)),
      } satisfies GroupStudyFormValues;
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
      return { failedCount: 0 };
    }

    const results = await Promise.allSettled(
      pendingUploads.map((item, i) => {
        const url = uploadUrls?.[i];
        if (!url) return Promise.reject(new Error('업로드 URL 없음'));
        return uploadThumbnail(url, item.file);
      }),
    );
    const failedCount = results.filter((r) => r.status === 'rejected').length;

    return { failedCount };
  };

  const executeStudySubmit = async ({
    values,
    getPendingImages,
    submitFn,
    postSubmitAction,
    messages,
    onFinally,
  }: {
    values: GroupStudyFormValues;
    getPendingImages: () => GroupStudyFormValues['descriptionPendingImages'];
    submitFn: (description: string) => Promise<{
      content?: {
        thumbnailUploadUrl?: string;
        descriptionImageUploadUrls?: string[];
      };
    }>;
    postSubmitAction: () => Promise<unknown>;
    messages: { success: string; partialSuccess: string; error: string };
    onFinally: () => void;
  }) => {
    let succeed = false;
    try {
      const { description, pendingUploads } = prepareDescription(
        values.description,
        getPendingImages(),
      );

      const response = await submitFn(description);

      if (values.thumbnailFile) {
        const thumbnailUploadUrl = response.content?.thumbnailUploadUrl;
        if (!thumbnailUploadUrl)
          throw new Error('썸네일 업로드 URL이 없습니다.');
        await uploadThumbnail(thumbnailUploadUrl, values.thumbnailFile);
      }

      const { failedCount } = await uploadDescriptionImages({
        uploadUrls: response.content?.descriptionImageUploadUrls,
        pendingUploads,
      });

      await postSubmitAction();
      showToast(
        failedCount > 0 ? messages.partialSuccess : messages.success,
        failedCount > 0 ? 'info' : 'success',
      );
      succeed = true;
    } catch {
      showToast(messages.error, 'error');
    } finally {
      if (succeed) onFinally();
    }
  };

  const handleCreate = async (values: GroupStudyFormValues) => {
    await executeStudySubmit({
      values,
      getPendingImages: () =>
        createMethods.getValues('descriptionPendingImages'),
      submitFn: (description) =>
        createGroupStudy(toCreateRequest({ ...values, description })),
      postSubmitAction: invalidateGroupStudyQueries,
      messages: {
        success: '그룹 스터디 개설이 완료되었습니다.',
        partialSuccess:
          '그룹 스터디는 개설되었지만 일부 소개 이미지 업로드에 실패했습니다.',
        error: '그룹 스터디 개설 중 오류가 발생했습니다. 다시 시도해 주세요.',
      },
      onFinally: () => {
        createMethods.reset(buildOpenGroupDefaultValues(classification));
        setOpen(false);
      },
    });
  };

  const handleEdit = async (values: GroupStudyFormValues) => {
    if (!groupStudyId) {
      showToast(
        '스터디 정보를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.',
        'error',
      );
      return;
    }
    await executeStudySubmit({
      values,
      getPendingImages: () => editMethods.getValues('descriptionPendingImages'),
      submitFn: (description) =>
        updateGroupStudy(toUpdateRequest({ ...values, description })),
      postSubmitAction: refetchGroupStudyInfo,
      messages: {
        success: '그룹 스터디 수정이 완료되었습니다.',
        partialSuccess:
          '그룹 스터디는 수정되었지만 일부 소개 이미지 업로드에 실패했습니다.',
        error: '그룹 스터디 수정 중 오류가 발생했습니다. 다시 시도해 주세요.',
      },
      onFinally: () => {
        if (onClose) onClose(false);
      },
    });
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
            {mode === 'edit' && !isGroupStudyLoading && !groupStudyInfo && (
              <Modal.Body className="font-designer-16m text-text-subtle py-700 text-center">
                <p>스터디 정보를 불러올 수 없습니다.</p>
                <button
                  type="button"
                  className="mt-400 underline"
                  onClick={() => refetchGroupStudyInfo()}
                >
                  다시 시도
                </button>
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
