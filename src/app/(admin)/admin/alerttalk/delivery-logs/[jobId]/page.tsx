import { AdminAlerttalkDeliveryLogDetailPageClient } from '@/features/admin/alerttalk/ui/admin-alerttalk-pages';

export default async function AdminAlerttalkDeliveryLogDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;

  return <AdminAlerttalkDeliveryLogDetailPageClient jobId={Number(jobId)} />;
}
