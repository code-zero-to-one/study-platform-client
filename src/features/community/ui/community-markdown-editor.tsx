'use client';

import MarkdownEditor from '@/components/common/ui/editor/markdown-editor';
import { uploadCommunityMarkdownImage } from '@/features/community/model/community-markdown-image-upload';
import {
  COMMUNITY_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS,
  COMMUNITY_MARKDOWN_MAX_IMAGE_COUNT,
  COMMUNITY_MARKDOWN_MAX_IMAGE_FILE_SIZE,
} from '@/types/community/markdown';

interface CommunityMarkdownEditorProps {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  visibleTextCounter?: {
    helperText?: string;
    maxLength: number;
  };
}

export default function CommunityMarkdownEditor({
  value,
  onChange,
  placeholder,
  visibleTextCounter,
}: CommunityMarkdownEditorProps) {
  return (
    <MarkdownEditor
      value={value}
      onChange={onChange}
      placeholder={placeholder ?? '글 내용을 작성해 주세요.'}
      visibleTextCounter={visibleTextCounter}
      imageConfig={{
        allowedImageExtensions: COMMUNITY_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS,
        maxImageCount: COMMUNITY_MARKDOWN_MAX_IMAGE_COUNT,
        maxImageFileSize: COMMUNITY_MARKDOWN_MAX_IMAGE_FILE_SIZE,
        uploadImageFile: uploadCommunityMarkdownImage,
      }}
    />
  );
}
