import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isMentoringNoteConsultationEnabled } from '@/features/mentoring/model/mentoring-feature-flag';
import NoteConsultationPageClient from '@/features/mentoring/ui/pages/note-consultation-page-client';

export const metadata: Metadata = {
  title: '노트 첨삭',
};

export default function NoteConsultationRoute() {
  if (!isMentoringNoteConsultationEnabled()) {
    // 쪽지상담함은 현재 제품 범위에 포함되지 않아 라우트 자체를 숨깁니다.
    notFound();
  }

  return <NoteConsultationPageClient />;
}
