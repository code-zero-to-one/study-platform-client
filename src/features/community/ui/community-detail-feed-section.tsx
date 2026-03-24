'use client';

import { useEffect, useState } from 'react';
import { getCommunityFeedPosts } from '@/features/community/model/community-post-storage';
import type { CommunityPost } from '@/types/community/domain';
import CommunityPostListItem from './community-post-list-item';
import CommunitySectionShell from './community-section-shell';

interface CommunityDetailFeedSectionProps {
  currentPostId: number;
  isVisible: boolean;
}

export default function CommunityDetailFeedSection({
  currentPostId,
  isVisible,
}: CommunityDetailFeedSectionProps) {
  const [posts, setPosts] = useState<readonly CommunityPost[]>([]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    setPosts(
      getCommunityFeedPosts().filter((post) => post.id !== currentPostId),
    );
  }, [currentPostId, isVisible]);

  if (!isVisible || posts.length === 0) {
    return null;
  }

  return (
    <CommunitySectionShell className="gap-250 border-t border-border-subtle pt-300">
      <div className="flex flex-col gap-75">
        <h2 className="font-designer-24b text-text-strong">다른 글</h2>
        <p className="font-designer-14r text-text-subtle">
          커뮤니티 글 목록을 이어서 확인해보세요.
        </p>
      </div>

      <div className="flex flex-col">
        {posts.map((post) => (
          <CommunityPostListItem key={post.id} post={post} />
        ))}
      </div>
    </CommunitySectionShell>
  );
}
