import { redirect } from 'next/navigation';
import { use } from 'react';

export default function FeedEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  redirect(`/class/vibe-intro/feed/write?feedId=${id}`);
}
