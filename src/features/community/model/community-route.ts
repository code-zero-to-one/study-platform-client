import {
  type CommunityBoard,
  isCommunityBoard,
} from '@/types/community/domain';

export const COMMUNITY_DEFAULT_PAGE = 1;
export const COMMUNITY_PAGE_SIZE = 10;

const normalizeCommunityPageNumber = (value: number) =>
  Number.isInteger(value) && value > 0 ? value : undefined;

export const normalizeCommunityPageParam = (
  value: string | readonly string[] | undefined,
) => {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (!rawValue) {
    return undefined;
  }

  return normalizeCommunityPageNumber(Number(rawValue));
};

export const resolveCommunityPage = (
  value: string | readonly string[] | undefined,
  fallback = COMMUNITY_DEFAULT_PAGE,
) => normalizeCommunityPageParam(value) ?? fallback;

export const buildCommunityListHref = (page?: number) => {
  const normalizedPage =
    typeof page === 'number' ? normalizeCommunityPageNumber(page) : undefined;

  return normalizedPage ? `/community?page=${normalizedPage}` : '/community';
};

export const normalizeCommunityBoardParam = (
  value: string | readonly string[] | undefined,
): CommunityBoard | undefined => {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (!rawValue || !isCommunityBoard(rawValue)) {
    return undefined;
  }

  return rawValue;
};

export const buildCommunityWriteHref = (
  page?: number,
  board?: CommunityBoard,
) => {
  const normalizedPage =
    typeof page === 'number' ? normalizeCommunityPageNumber(page) : undefined;
  const searchParams = new URLSearchParams();

  if (normalizedPage) {
    searchParams.set('page', String(normalizedPage));
  }

  if (board) {
    searchParams.set('board', board);
  }

  const query = searchParams.toString();

  return query ? `/community/write?${query}` : '/community/write';
};

export const buildCommunityPostHref = (postId: number, page?: number) => {
  const normalizedPage =
    typeof page === 'number' ? normalizeCommunityPageNumber(page) : undefined;
  const detailPath = `/community/${postId}`;

  return normalizedPage ? `${detailPath}?page=${normalizedPage}` : detailPath;
};

export const buildCommunityQuestionHref = (
  questionId: number,
  page?: number,
) => {
  const normalizedPage =
    typeof page === 'number' ? normalizeCommunityPageNumber(page) : undefined;
  const detailPath = `/community/questions/${questionId}`;

  return normalizedPage ? `${detailPath}?page=${normalizedPage}` : detailPath;
};

export const buildCommunityQuestionWriteHref = (page?: number) => {
  const normalizedPage =
    typeof page === 'number' ? normalizeCommunityPageNumber(page) : undefined;
  const writePath = '/community/questions/write';

  return normalizedPage ? `${writePath}?page=${normalizedPage}` : writePath;
};

export const buildCommunityQuestionEditHref = (
  questionId: number,
  page?: number,
) => {
  const normalizedPage =
    typeof page === 'number' ? normalizeCommunityPageNumber(page) : undefined;
  const editPath = `/community/questions/${questionId}/edit`;

  return normalizedPage ? `${editPath}?page=${normalizedPage}` : editPath;
};

export const buildCommunityEditHref = (postId: number, page?: number) => {
  const normalizedPage =
    typeof page === 'number' ? normalizeCommunityPageNumber(page) : undefined;
  const editPath = `/community/${postId}/edit`;

  return normalizedPage ? `${editPath}?page=${normalizedPage}` : editPath;
};
