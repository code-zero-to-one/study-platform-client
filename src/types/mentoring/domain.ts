import type { MentorSettings } from '@/types/mentoring/settings';

export type MentoringMethodType = 'note' | 'simple' | 'deep' | 'offline';

export interface MentoringMethodOption {
  type: MentoringMethodType;
  label: string;
  durationLabel: string;
  price: number;
  description: string;
  enabled?: boolean;
  requiresSchedule: boolean;
  timeSlots: string[];
}

export interface MentorReview {
  id: number | string;
  authorName: string;
  rating: number;
  createdAt: string;
  content: string;
  method: MentoringMethodType;
}

export interface MentorProfile {
  id: number;
  memberId?: number;
  nickname: string;
  role: string;
  career: string;
  company: string;
  publicReadinessStage?: 'DETAIL_PREPARING' | 'APPLY_PREPARING' | 'APPLY_READY';
  applicationReady?: boolean;
  rating: number;
  reviewCount: number;
  mentoringCount: number;
  menteeCount?: number;
  tags: string[];
  summary?: string;
  bio?: string;
  careerHistory: string[];
  strengths?: string[];
  avatarEmoji?: string;
  imageUrl?: string;
  methods: Record<MentoringMethodType, MentoringMethodOption>;
  reviews: MentorReview[];
  mentorSettings?: MentorSettings;
}

export interface MentorDirectoryPage {
  mentors: MentorProfile[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export type MentorSortType = 'default' | 'rating' | 'review' | 'low-price';

export interface MentorSortOption {
  value: MentorSortType;
  label: string;
}
