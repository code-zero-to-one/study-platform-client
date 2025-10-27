interface GroupStudyIdParam {
  groupStudyId: number;
}

export type GetPostRequest = GroupStudyIdParam;

export interface GetCommentsRequest extends GroupStudyIdParam {
  threadId: number;
}

export interface PostCommentRequest extends GetCommentsRequest {
  content: string;
}

export interface PutCommentRequest extends PostCommentRequest {
  commentId: number;
}

export interface DeleteCommentRequest extends GetCommentsRequest {
  commentId: number;
}

export type GetThreadsRequest = GroupStudyIdParam;

export interface PostThreadRequest extends GroupStudyIdParam {
  content: string;
}

export interface PutThreadRequest extends PostThreadRequest {
  threadId: number;
}

export interface DeleteThreadReqeust extends GroupStudyIdParam {
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
