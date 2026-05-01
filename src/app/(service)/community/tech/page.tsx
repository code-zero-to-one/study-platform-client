'use client';

import { PostBoardPage } from '@/components/pages/community/_components/post-board-page';
import {
  type CommunityPost,
  POST_CURRENT_USER,
  TECH_POSTS,
} from '@/components/pages/community/_data/post-data';

export default function Page() {
  return (
    <PostBoardPage
      board="tech"
      title="테크 한입"
      description="개발 지식·테크 트렌드·도구 활용 팁·오늘 배운 것들을 가볍게 한 입씩 나눠보세요."
      iconName="lightbulb"
      iconColor="#7A2E0E"
      iconBg="#FEF0C7"
      posts={TECH_POSTS}
      myFilterLabel="내 지식"
      onCreate={(payload) => {
        const next: CommunityPost = {
          id: String(Date.now()),
          board: 'tech',
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
