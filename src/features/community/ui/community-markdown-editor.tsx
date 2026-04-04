'use client';

import MarkdownEditorCore, {
  type MarkdownEditorCoreProps,
} from '@/components/common/ui/rich-text/markdown-editor-core';
import {
  requestCommunityMarkdownImageUploadTicket,
  uploadCommunityMarkdownImageFile,
} from '@/features/community/model/community-markdown-image-upload';
import {
  COMMUNITY_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS,
  COMMUNITY_MARKDOWN_MAX_IMAGE_COUNT,
  COMMUNITY_MARKDOWN_MAX_IMAGE_FILE_SIZE,
} from '@/types/community/markdown';

interface CommunityMarkdownEditorProps {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  requestImageUploadTicket?: MarkdownEditorCoreProps['requestImageUploadTicket'];
  uploadImageFile?: MarkdownEditorCoreProps['uploadImageFile'];
}

export default function CommunityMarkdownEditor({
  value,
  onChange,
  placeholder,
  requestImageUploadTicket = requestCommunityMarkdownImageUploadTicket,
  uploadImageFile = uploadCommunityMarkdownImageFile,
}: CommunityMarkdownEditorProps) {
  return (
    <MarkdownEditorCore
      value={value}
      onChange={onChange}
      placeholder={placeholder ?? '글 내용을 작성해 주세요.'}
      allowedImageExtensions={COMMUNITY_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS}
      maxImageCount={COMMUNITY_MARKDOWN_MAX_IMAGE_COUNT}
      maxImageFileSize={COMMUNITY_MARKDOWN_MAX_IMAGE_FILE_SIZE}
      requestImageUploadTicket={requestImageUploadTicket}
      uploadImageFile={uploadImageFile}
    />
  );
}
