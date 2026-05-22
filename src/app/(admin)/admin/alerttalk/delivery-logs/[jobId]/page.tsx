import { notFound } from 'next/navigation';
import { AdminAlerttalkDeliveryLogDetailPageClient } from '@/features/admin/alerttalk/ui/admin-alerttalk-pages';

export default async function AdminAlerttalkDeliveryLogDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const parsedJobId = Number(jobId);

  if (!Number.isInteger(parsedJobId) || parsedJobId <= 0) {
    notFound();
  }

  return <AdminAlerttalkDeliveryLogDetailPageClient jobId={parsedJobId} />;
}
