export interface ArchiveItem {
  id: number;
  title: string;
  description: string;
  author: string;
  date: string;
  views: number;
  likes: number;
  link: string;
  isLiked: boolean;
  isBookmarked: boolean;
  tags: string[];
}

export interface GetArchiveParams {
  page: number;
  size: number;
  sort?: 'LATEST' | 'VIEWS' | 'LIKES';
  search?: string;
  bookmarkedOnly?: boolean;
}

export interface ArchiveResponse {
  content: ArchiveItem[];
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
}
