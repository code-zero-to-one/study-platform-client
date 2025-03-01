'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPosts } from '@/entities/post/fetchPosts';

export function Posts() {
  // This useQuery could just as well happen in some deeper child to
  // the <PostsRoute>, data will be available immediately either way
  const { data } = useQuery({ queryKey: ['posts'], queryFn: fetchPosts });

  return (
    <div>
      {data.map((post) => {
        return (
          <div key={post.id}>
            <p className="heading4 text-green-500">title: {post.title}</p>
            <p>content: {post.body}</p>
          </div>
        );
      })}
    </div>
  );
}
