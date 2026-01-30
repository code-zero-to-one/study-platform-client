export const ARCHIVE_SORT_OPTIONS = [
  { value: 'LATEST', label: '최신순' },
  { value: 'VIEWS', label: '조회순' },
  { value: 'LIKES', label: '좋아요순' },
] as const;

export const ARCHIVE_VIEW_MODES = {
  GRID: 'GRID',
  LIST: 'LIST',
} as const;

export const ARCHIVE_PAGE_SIZE = {
  GRID: 10,
  LIST: 15,
} as const;
