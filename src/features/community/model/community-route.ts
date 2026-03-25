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

export const buildCommunityPostHref = (postId: number, page?: number) => {
  const normalizedPage =
    typeof page === 'number' ? normalizeCommunityPageNumber(page) : undefined;
  const detailPath = `/community/${postId}`;

  return normalizedPage ? `${detailPath}?page=${normalizedPage}` : detailPath;
};
