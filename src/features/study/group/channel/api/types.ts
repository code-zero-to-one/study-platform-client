interface GroupStudyIdParam {
  groupStudyId: number;
}

export type GetPostRequest = GroupStudyIdParam;

export type GetThreadsRequest = GroupStudyIdParam;

export type PostThreadRequest = GroupStudyIdParam;

export interface GetCommentsRequest extends GroupStudyIdParam {
  threadId: number;
}

export interface GetThreadsResponse {
  threadId: number;
  groupStudyId: number;
  authorId: number;
  content: string;
  authorName: string;
  imageLocation: string | null;
  isLeader: boolean;
  likesCount: number;
  dislikesCount: number;
  myReaction: string | null;
  createdAt: string; // ISO 날짜 문자열
  updatedAt: string;
}

export type GetCommentsResponse = GetThreadsResponse;
