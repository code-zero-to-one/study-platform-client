'use client';

import { PostBoardPage } from '@/components/pages/community/_components/post-board-page';
import {
  type CommunityPost,
  FREE_POSTS,
  POST_CURRENT_USER,
} from '@/components/pages/community/_data/post-data';

export default function Page() {
  return (
    <PostBoardPage
      board="free"
      title="자유게시판"
      description="IT 이슈, 직장인 수다, 스터디 그룹 모집 — 빌더들과 일상에서 자유롭게 교류해요."
      iconName="forum"
      iconColor="#054F31"
      iconBg="#D1FADF"
      posts={FREE_POSTS}
      myFilterLabel="내 글"
      onCreate={(payload) => {
        const next: CommunityPost = {
          id: String(Date.now()),
          board: 'free',
          author: POST_CURRENT_USER,
          grade: '빌더',
          title: payload.title,
          body: payload.body,
          views: 0,
          likes: 0,
          when: '방금',
          comments: [],
          images: payload.images,
        };
        return next;
      }}
    />
  );
}
