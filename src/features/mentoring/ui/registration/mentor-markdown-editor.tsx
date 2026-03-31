'use client';

import { memo } from 'react';
import MarkdownEditorCore, {
  type MarkdownEditorCoreProps,
} from '@/components/common/ui/rich-text/markdown-editor-core';
import {
  requestMentorMarkdownImageUploadTicket,
  uploadMentorMarkdownImageFile,
} from '@/features/mentoring/model/mentor-markdown-image-upload';
import {
  MENTOR_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS,
  MENTOR_MARKDOWN_MAX_IMAGE_COUNT,
  MENTOR_MARKDOWN_MAX_IMAGE_FILE_SIZE,
} from '@/types/mentoring/markdown';

interface MentorMarkdownEditorProps {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  requestImageUploadTicket?: MarkdownEditorCoreProps['requestImageUploadTicket'];
  uploadImageFile?: MarkdownEditorCoreProps['uploadImageFile'];
}

function MentorMarkdownEditor({
  value,
  onChange,
  placeholder,
  requestImageUploadTicket = requestMentorMarkdownImageUploadTicket,
  uploadImageFile = uploadMentorMarkdownImageFile,
}: MentorMarkdownEditorProps) {
  return (
    <MarkdownEditorCore
      value={value}
      onChange={onChange}
      placeholder={placeholder ?? '멘토 소개를 자유롭게 작성해주세요.'}
      allowedImageExtensions={MENTOR_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS}
      maxImageCount={MENTOR_MARKDOWN_MAX_IMAGE_COUNT}
      maxImageFileSize={MENTOR_MARKDOWN_MAX_IMAGE_FILE_SIZE}
      requestImageUploadTicket={requestImageUploadTicket}
      uploadImageFile={uploadImageFile}
    />
  );
}

export default memo(MentorMarkdownEditor);
