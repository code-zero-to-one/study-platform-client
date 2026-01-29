'use client';

import { useMemo } from 'react';
import MentorCard from '@/components/card/mentor-card';

// TODO: 추후 API로 대체
const MOCK_MENTORS = [
  {
    id: 1,
    name: '김개발',
    nickname: '개발자킴',
    imageUrl: '',
    field: '프론트엔드 개발',
    keywords: ['React', 'TypeScript', 'Next.js'],
    description: '5년차 프론트엔드 개발자로, React와 Next.js 전문가입니다.',
    notionUrl: 'https://notion.so/mentor1',
    googleFormUrl: 'https://forms.gle/mentor1',
    availableMethods: {
      chat: true, // 채팅상담
      call: true, // 전화/온라인 상담
      offline: false, // 대면 컨설팅
    },
  },
  {
    id: 2,
    name: '이백엔드',
    nickname: '백엔드리',
    imageUrl: '',
    field: '백엔드 개발',
    keywords: ['Spring', 'Java', 'AWS'],
    description: '7년차 백엔드 개발자로, 마이크로서비스 아키텍처 전문가입니다.',
    notionUrl: 'https://notion.so/mentor2',
    googleFormUrl: 'https://forms.gle/mentor2',
    availableMethods: {
      chat: true,
      call: false,
      offline: true,
    },
  },
  {
    id: 3,
    name: '박데이터',
    nickname: '데이터박',
    imageUrl: '',
    field: '데이터 분석',
    keywords: ['Python', 'SQL', 'Machine Learning'],
    description: '데이터 분석 및 머신러닝 전문가로, 비즈니스 인사이트 도출에 강합니다.',
    notionUrl: 'https://notion.so/mentor3',
    googleFormUrl: 'https://forms.gle/mentor3',
    availableMethods: {
      chat: true,
      call: true,
      offline: true,
    },
  },
];

export default function MentorProfileList() {
  const mentors = useMemo(() => MOCK_MENTORS, []);

  if (mentors.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <p className="font-designer-16r text-text-subtle">
          등록된 멘토가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-300">
      {mentors.map((mentor) => (
        <MentorCard key={mentor.id} mentor={mentor} />
      ))}
    </div>
  );
}

