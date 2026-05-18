import { redirect } from 'next/navigation';

export default async function FeedIndexPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/class/${slug}/home?tab=feed`);
}
