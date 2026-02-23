export type MentoringRequestContentBlock =
  | MentoringRequestParagraphBlock
  | MentoringRequestImageBlock
  | MentoringRequestFileBlock
  | MentoringRequestLinkBlock;

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

const createBlockId = () => {
  return `request-block-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
};

export const createMentoringRequestParagraphBlock = (
  text = '',
): MentoringRequestParagraphBlock => {
  return {
    id: createBlockId(),
    type: 'paragraph',
    text,
  };
};

export const createMentoringRequestImageBlock = ({
  fileName,
  fileSize,
  mimeType,
}: {
  fileName: string;
  fileSize: number;
  mimeType?: string;
}): MentoringRequestImageBlock => {
  return {
    id: createBlockId(),
    type: 'image',
    fileName,
    fileSize,
    mimeType,
  };
};

export const createMentoringRequestFileBlock = ({
  fileName,
  fileSize,
}: {
  fileName: string;
  fileSize: number;
}): MentoringRequestFileBlock => {
  return {
    id: createBlockId(),
    type: 'file',
    fileName,
    fileSize,
  };
};

export const createMentoringRequestLinkBlock = (
  url: string,
): MentoringRequestLinkBlock => {
  return {
    id: createBlockId(),
    type: 'link',
    url,
  };
};

export const getMentoringRequestTextLength = (
  contents: MentoringRequestContentBlock[],
) => {
  return contents.reduce((length, block) => {
    if (block.type !== 'paragraph') {
      return length;
    }

    return length + block.text.trim().length;
  }, 0);
};

export const hasMentoringRequestAttachment = (
  contents: MentoringRequestContentBlock[],
) => {
  return contents.some((block) => {
    return (
      block.type === 'image' || block.type === 'file' || block.type === 'link'
    );
  });
};

export const buildMentoringRequestMessage = (
  contents: MentoringRequestContentBlock[],
) => {
  const lines = contents
    .map((block) => {
      if (block.type === 'paragraph') {
        return block.text.trim();
      }
      if (block.type === 'image') {
        return `[이미지] ${block.fileName}`;
      }
      if (block.type === 'file') {
        return `[첨부파일] ${block.fileName}`;
      }

      return `[링크] ${block.url}`;
    })
    .filter((line) => line.length > 0);

  return lines.join('\n\n').trim();
};

export const getMentoringRequestAttachedFileNames = (
  contents: MentoringRequestContentBlock[],
) => {
  return contents
    .filter((block) => block.type === 'image' || block.type === 'file')
    .map((block) => block.fileName);
};

export const getMentoringRequestReferenceLinks = (
  contents: MentoringRequestContentBlock[],
) => {
  return contents
    .filter((block) => block.type === 'link')
    .map((block) => block.url);
};

export const sanitizeMentoringRequestContents = (
  contents: MentoringRequestContentBlock[],
): MentoringRequestContentBlock[] => {
  const sanitized = contents.filter((block) => {
    if (block.type === 'paragraph') {
      return block.text.trim().length > 0;
    }

    if (block.type === 'link') {
      return block.url.trim().length > 0;
    }

    return block.fileName.trim().length > 0;
  });

  return sanitized;
};
