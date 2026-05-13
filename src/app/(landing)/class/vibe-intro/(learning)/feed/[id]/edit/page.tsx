'use client';

import { useRouter } from 'next/navigation';
import { use, useEffect } from 'react';

export default function FeedEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): null {
  const { id } = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/class/vibe-intro/feed/${id}`);
  }, [id, router]);

  return null;
}
