import { HydrationBoundary } from '@tanstack/react-query';

import { fetchPosts } from '@/entities/post/fetchPosts';

import { Posts } from '@/pages/post/post.ui';
import { getDehydratedState } from '@/shared/lib/query';

// eslint-disable-next-line @next/next/no-async-client-component
export default async function Home() {
  const { dehydratedState } = await getDehydratedState({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  });

  return (
    <>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <HydrationBoundary state={dehydratedState}>
        <Posts />
      </HydrationBoundary>
    </>
  );
}
