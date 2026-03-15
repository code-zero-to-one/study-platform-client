'use client';

import NoteConsultationContainer from '@/features/mentoring/ui/note-consultation/note-consultation-container';
import type { NoteConsultationChannel } from '@/types/mentoring/note-consultation-view';

interface NoteConsultationPageClientProps {
  initialRequestId?: string;
  initialChannel?: NoteConsultationChannel;
}

export default function NoteConsultationPageClient({
  initialRequestId,
  initialChannel,
}: NoteConsultationPageClientProps) {
  return (
    <NoteConsultationContainer
      initialRequestId={initialRequestId}
      initialChannel={initialChannel}
    />
  );
}
