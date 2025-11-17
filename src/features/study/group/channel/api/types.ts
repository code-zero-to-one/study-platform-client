import { ResizedImage } from '../../api/group-study-types';

interface GroupStudyIdParam {
  groupStudyId: number;
}

export type GetPostRequest = GroupStudyIdParam;

export interface GetCommentsRequest extends GroupStudyIdParam {
  threadId: number;
}

export interface PostCommentReactionRequest {
  threadId: number;
  commentId: number;
  type: string;
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

export type REACTION = 'LIKE' | 'DISLIKE' | 'NONE';

export interface PostThreadReactionRequest extends DeleteThreadReqeust {
  type: REACTION;
}

export interface GetThreadsResponse {
  threadId: number;
  groupStudyId: number;
  authorId: number;
  content: string;
  authorName: string;
  image: {
    imageId: number;
    resizedImages: ResizedImage;
  };
  isLeader: boolean;
  likesCount: number;
  dislikesCount: number;
  myReaction: REACTION;
  createdAt: string; // ISO 날짜 문자열
  updatedAt: string;
}

export interface GetPostResponse {
  groupStudyId: number;
  noticeTitle: string;
  noticeContent: string;
  isRegistered: boolean;
  updatedAt: string; // ISO 날짜 문자열
}
export interface GetCommentsResponse extends GetThreadsResponse {
  commentId: number;
}
