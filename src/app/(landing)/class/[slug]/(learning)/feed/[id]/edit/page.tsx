'use client';

import { useRouter } from 'next/navigation';
import { use, useEffect } from 'react';

export default function FeedEditPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}): null {
  const { id, slug } = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/class/${slug}/feed/${id}`);
  }, [id, slug, router]);

  return null;
}
