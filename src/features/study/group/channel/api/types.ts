interface GroupStudyIdParam {
  groupStudyId: number;
}

export type GetPostRequest = GroupStudyIdParam;

export type GetThreadsRequest = GroupStudyIdParam;

export type PostThreadRequest = GroupStudyIdParam;

export interface GetCommentsRequest extends GroupStudyIdParam {
  threadId: number;
}
