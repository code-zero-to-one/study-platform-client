export interface ArchiveItem {
  id: number;
  title: string;
  description: string | null;
  author: string;
  authorId: number;
  profileImage?: {
    imageId: number;
    resizedImages: Array<{
      resizedImageId: number;
      resizedImageUrl: string;
      imageSizeType: {
        imageTypeName: string;
        width: number;
        height: number;
      };
    }>;
  };
  date: string;
  views: number;
  likes: number;
  bookmarks: number;
  link: string;
  isLiked: boolean;
  isBookmarked: boolean;
  isPrivate?: boolean;
  tags: string[];
}

export interface GetArchiveParams {
  page: number;
  size: number;
  sort?: 'LATEST' | 'VIEWS' | 'LIKES';
  search?: string;
  bookmarkedOnly?: boolean;
  authorOnly?: boolean;
  authorId?: number;
}

export interface ArchiveResponse {
  content: ArchiveItem[];
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
}

export interface ArchiveSearchSuggestionResponse {
  titles: string[];
  authors: string[];
}

export interface GetArchiveSearchSuggestionsParams {
  q?: string;
  minLength?: number;
  size?: number;
}
