export type MentoringRequestRichTextNode = Record<string, unknown>;

interface MentoringRequestAttachmentBlockBase {
  fileKey?: string;
  fileSize: number;
  mimeType?: string;
  publicUrl?: string;
  downloadUrl?: string;
  file?: File;
}

export interface MentoringRequestParagraphBlock {
  id: string;
  type: 'paragraph';
  text: string;
}

export interface MentoringRequestImageBlock
  extends MentoringRequestAttachmentBlockBase {
  id: string;
  type: 'image';
  fileName: string;
}

export interface MentoringRequestFileBlock
  extends MentoringRequestAttachmentBlockBase {
  id: string;
  type: 'file';
  fileName: string;
}

export interface MentoringRequestLinkBlock {
  id: string;
  type: 'link';
  url: string;
}

export interface MentoringRequestRichTextBlock {
  id: string;
  type: 'richText';
  document: string;
}

export type MentoringRequestContentBlock =
  | MentoringRequestParagraphBlock
  | MentoringRequestImageBlock
  | MentoringRequestFileBlock
  | MentoringRequestLinkBlock
  | MentoringRequestRichTextBlock;
