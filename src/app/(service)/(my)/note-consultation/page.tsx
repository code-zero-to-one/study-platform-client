import NoteConsultationPageClient from '@/features/mentoring/ui/pages/note-consultation-page-client';
import type { NoteConsultationChannel } from '@/types/mentoring/note-consultation-view';

interface NoteConsultationRouteProps {
  searchParams?: Promise<{
    requestId?: string;
    channel?: string;
  }>;
}

const isNoteConsultationChannel = (
  value: string | undefined,
): value is NoteConsultationChannel => {
  return value === 'sent' || value === 'received';
};

export default async function NoteConsultationRoute({
  searchParams,
}: NoteConsultationRouteProps) {
  const resolvedSearchParams = await searchParams;
  const initialChannel = isNoteConsultationChannel(
    resolvedSearchParams?.channel,
  )
    ? resolvedSearchParams.channel
    : undefined;

  return (
    <NoteConsultationPageClient
      initialRequestId={resolvedSearchParams?.requestId}
      initialChannel={initialChannel}
    />
  );
}
