'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPosts } from '@/entities/post/fetchPosts';

export function Posts() {
  // This useQuery could just as well happen in some deeper child to
  // the <PostsRoute>, data will be available immediately either way
  const { data } = useQuery({ queryKey: ['posts'], queryFn: fetchPosts });

  return (
    <div className="shadow-1 rounded-500 flex flex-col gap-300 border-1 border-indigo-500 px-200 py-600">
      {data.map((post) => {
        return (
          <div key={post.id}>
            <p className="headings1 text-text-brand">title: {post.title}</p>
            <p className="d24m">content: {post.body}</p>
          </div>
        );
      })}
    </div>
  );
}
