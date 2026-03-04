export type MentoringRequestRichTextNode = Record<string, unknown>;

export interface MentoringRequestParagraphBlock {
  id: string;
  type: 'paragraph';
  text: string;
}

export interface MentoringRequestImageBlock {
  id: string;
  type: 'image';
  fileName: string;
  fileSize: number;
  mimeType?: string;
}

export interface MentoringRequestFileBlock {
  id: string;
  type: 'file';
  fileName: string;
  fileSize: number;
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
