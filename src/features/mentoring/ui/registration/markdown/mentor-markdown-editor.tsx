'use client';

import { memo, useCallback } from 'react';
import MarkdownEditor from '@/components/common/ui/editor/markdown-editor';
import {
  requestMentorMarkdownImageUploadTicket,
  uploadMentorMarkdownImageFile,
} from '@/features/mentoring/model/mentor-markdown-image-upload';
import {
  MENTOR_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS,
  MENTOR_MARKDOWN_MAX_IMAGE_COUNT,
  MENTOR_MARKDOWN_MAX_IMAGE_FILE_SIZE,
  normalizeMentorMarkdownContent,
} from '@/types/mentoring/markdown';

interface MentorMarkdownEditorProps {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}

function MentorMarkdownEditor({
  value,
  onChange,
  placeholder,
}: MentorMarkdownEditorProps) {
  const handleUploadImageFile = useCallback(async (file: File) => {
    const ticket = await requestMentorMarkdownImageUploadTicket({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });

    await uploadMentorMarkdownImageFile({
      uploadUrl: ticket.uploadUrl,
      file,
    });

    return ticket.publicUrl;
  }, []);

  return (
    <MarkdownEditor
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      normalizeContent={normalizeMentorMarkdownContent}
      imageConfig={{
        allowedImageExtensions: MENTOR_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS,
        maxImageCount: MENTOR_MARKDOWN_MAX_IMAGE_COUNT,
        maxImageFileSize: MENTOR_MARKDOWN_MAX_IMAGE_FILE_SIZE,
        uploadImageFile: handleUploadImageFile,
      }}
    />
  );
}

export default memo(MentorMarkdownEditor);
