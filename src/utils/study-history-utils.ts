'use client';

import type {
  StudyHistoryContent,
  StudyHistoryItem,
} from '@/types/one-to-one-study/study-history';

export const mapHistoryItem = (data: StudyHistoryContent): StudyHistoryItem => {
  const dateObj = new Date(data.scheduledAt);
  const dateStr = `${dateObj.getFullYear()}.${String(dateObj.getMonth() + 1).padStart(2, '0')}.${String(dateObj.getDate()).padStart(2, '0')}`;
  const dayName = ['일', '월', '화', '수', '목', '금', '토'][dateObj.getDay()];
  const partner = data.partner
    ? {
        id: data.partner.memberId,
        name: data.partner.nickname,
        profileImage: data.partner.profileImageUrl,
      }
    : null;

  return {
    id: data.studyId,
    date: `${dateStr} (${dayName})`,
    subject: data.title,
    role: data.participation.role,
    attendance:
      data.participation.attendance === 'PRESENT' ? 'ATTENDED' : 'NOT_STARTED',
    link: data.studyLink,
    status: data.status === 'COMPLETE' ? 'COMPLETED' : 'IN_PROGRESS',
    partner,
  };
};
