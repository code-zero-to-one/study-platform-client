'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import { useQueryClient } from '@tanstack/react-query';
import { XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Modal } from '@/shared/ui/modal';

import GroupStudyForm from './group-study-form';

import { GroupStudyDetailResponse } from '../api/group-study-types';

import {
  useCreateGroupStudyMutation,
  useUpdateGroupStudyMutation,
} from '../const/use-group-study-mutation';
import {
  buildOpenGroupDefaultValues,
  GroupStudyFormValues,
  toOpenGroupRequest,
} from '../model/group-study-form.schema';
import { useGroupStudyDetailQuery } from '../model/use-study-query';

interface GroupStudyModalProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: () => void;
  mode: 'create' | 'edit';
  groupStudyId?: number;
}

export default function GroupStudyFormModal({
  trigger,
  mode,
  open: controlledOpen = false,
  groupStudyId,
  onOpenChange: onControlledOpen,
}: GroupStudyModalProps) {
  const qc = useQueryClient();
  const [open, setOpen] = useState<boolean>(false);
  const { mutateAsync: createGroupStudy } = useCreateGroupStudyMutation();
  const { mutateAsync: updateGroupStudy } = useUpdateGroupStudyMutation(
    groupStudyId!,
  );
  const { data: groupStudyInfo, isLoading } = useGroupStudyDetailQuery(
    groupStudyId!,
  );

  const refineStudyDetail = (value: GroupStudyDetailResponse) => {
    if (isLoading) return;

    return {
      type: value.basicInfo.type,
      targetRoles: value.basicInfo.targetRoles,
      maxMembersCount: value.basicInfo.maxMembersCount.toString(),
      experienceLevels: value.basicInfo.experienceLevels,
      method: value.basicInfo.method,
      location: value.basicInfo.location,
      regularMeeting: value.basicInfo.regularMeeting,
      startDate: value.basicInfo.startDate,
      endDate: value.basicInfo.endDate,
      price: value.basicInfo.price.toString(),
      title: value.detailInfo.title,
      description: value.detailInfo.description,
      summary: value.detailInfo.summary,
      interviewPost: value.interviewPost.interviewPost.map((q) => q.question),
      thumbnailExtension:
        value.detailInfo.image.resizedImages[0].resizedImageUrl
          ?.split('.')
          .pop()
          ?.toUpperCase() as GroupStudyFormValues['thumbnailExtension'],
      thumbnailUrl: value.detailInfo.image.resizedImages[0].resizedImageUrl,
    };
  };

  const uploadThumbnail = async (
    uploadUrl: string,
    file: File | null | undefined,
  ) => {
    if (!uploadUrl || !file) return;

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(uploadUrl, {
      method: 'PUT',
      body: formData,
    });

    console.log('res', res);

    if (!res.ok) {
      console.error('파일 업로드 실패:', res.status, res.statusText);
    } else {
      console.log('파일 업로드 성공!');
    }
  };

  const invalidateGroupStudyQueries = async () => {
    await qc.invalidateQueries({ queryKey: ['groupStudies'] });
    await qc.invalidateQueries({ queryKey: ['memberStudies'] });
  };

  const handleCreate = async (values: GroupStudyFormValues) => {
    try {
      const body = toOpenGroupRequest(values);
      const created = await createGroupStudy(body);

      await uploadThumbnail(
        created.content.thumbnailUploadUrl,
        values.thumbnailFile,
      );
      alert('그룹 스터디 개설이 완료되었습니다!');

      await invalidateGroupStudyQueries();
    } catch (err) {
      console.error(err);
      alert('그룹 스터디 개설 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  };

  const handleEdit = async (values: GroupStudyFormValues) => {
    try {
      const body = toOpenGroupRequest(values);
      const updated = await updateGroupStudy(body);

      await uploadThumbnail(
        updated.content.thumbnailUploadUrl,
        values.thumbnailFile,
      );

      console.log('edited values', values);

      alert('그룹 스터디 수정이 완료되었습니다!');

      await invalidateGroupStudyQueries();
    } catch (err) {
      alert('그룹 스터디 수정 중 오류가 발생했습니다. 다시 시도해 주세요.');
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
    if (open) {
      sendGTMEvent({
        event: 'group_study_create_modal_open',
      });
    }
  }, [open]);

  return (
    <Modal.Root
      open={mode === 'create' ? open : controlledOpen}
      onOpenChange={mode === 'create' ? () => setOpen(!open) : onControlledOpen}
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
                ? buildOpenGroupDefaultValues()
                : refineStudyDetail(groupStudyInfo!)
            }
            onSubmit={handleSubmitForm}
          />
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
