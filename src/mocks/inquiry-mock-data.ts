import { InquiryStatus } from '@/components/ui/badge/inquiry-status-badge';

/**
 * 문의 타입
 */
export type InquiryType =
  | 'PAYMENT'
  | 'STUDY'
  | 'LEADER'
  | 'MENTOR'
  | 'BUG'
  | 'GENERAL';

/**
 * 문의 데이터 인터페이스
 */
export interface Inquiry {
  id: number;
  type: InquiryType;
  title: string;
  content: string;
  authorId: number;
  authorName: string;
  mentorId?: number;
  status: InquiryStatus;
  viewCount: number;
  images?: string[];
  answer?: {
    content: string;
    authorId: number;
    authorName: string;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * 프로토타입용 하드코딩 문의 목 데이터
 */

const now = new Date();
const oneDayAgo = new Date(now);
oneDayAgo.setDate(oneDayAgo.getDate() - 1);
const twoDaysAgo = new Date(now);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const threeDaysAgo = new Date(now);
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
const oneWeekAgo = new Date(now);
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

export const MOCK_INQUIRIES: Inquiry[] = [
  // 케이스 1: 결제 문의 (접수 상태)
  {
    id: 1,
    type: 'PAYMENT',
    title: '스터디 참가비 결제가 제대로 안 됐어요',
    content:
      '결제를 완료했는데 참가 승인이 안 되고 있습니다. 결제 내역은 확인되는데 어떻게 해야 하나요?',
    authorId: 101,
    authorName: '김철수',
    status: 'PENDING',
    viewCount: 1,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  // 케이스 2: 스터디 일반 문의 (답변 대기)
  {
    id: 2,
    type: 'STUDY',
    title: '스터디 진행 방식에 대해 궁금합니다',
    content:
      '안녕하세요. 스터디 진행 방식이 온라인인지 오프라인인지 궁금합니다. 또한 주차별 과제 제출 기한은 어떻게 되나요?',
    authorId: 102,
    authorName: '이영희',
    status: 'IN_REVIEW',
    viewCount: 5,
    createdAt: oneDayAgo.toISOString(),
    updatedAt: oneDayAgo.toISOString(),
  },
  // 케이스 3: 리더 문의 (그룹스터디) - 답변 완료
  {
    id: 3,
    type: 'LEADER',
    title: '리더님의 개발 경험이 궁금해요',
    content:
      '리더님께서 어떤 프로젝트를 진행하셨는지, 어떤 기술 스택을 주로 사용하시는지 알고 싶습니다.',
    authorId: 103,
    authorName: '박민수',
    status: 'ANSWERED',
    viewCount: 12,
    answer: {
      content:
        '안녕하세요! 저는 현재 스타트업에서 프론트엔드 개발자로 근무하고 있으며, React와 TypeScript를 주로 사용합니다. 이번 스터디에서는 제가 실무에서 겪은 경험들을 공유하면서 함께 성장하고자 합니다.',
      authorId: 1,
      authorName: 'djyun',
      createdAt: twoDaysAgo.toISOString(),
    },
    createdAt: threeDaysAgo.toISOString(),
    updatedAt: twoDaysAgo.toISOString(),
  },
  // 케이스 4: 멘토 문의 (멘토스터디) - 답변 대기
  {
    id: 4,
    type: 'MENTOR',
    title: '멘토님의 이력과 경험이 궁금해요',
    content:
      '멘토님께서 어떤 회사에서 근무하셨는지, 어떤 프로젝트를 진행하셨는지 더 자세히 알고 싶습니다.',
    authorId: 104,
    authorName: '정수진',
    mentorId: 1,
    status: 'IN_REVIEW',
    viewCount: 8,
    createdAt: twoDaysAgo.toISOString(),
    updatedAt: twoDaysAgo.toISOString(),
  },
  // 케이스 5: 버그 제보 (답변 완료)
  {
    id: 5,
    type: 'BUG',
    title: '과제 제출 버튼이 작동하지 않습니다',
    content:
      '과제 제출 페이지에서 파일을 업로드하고 제출 버튼을 눌렀는데 아무 반응이 없습니다. 크롬 브라우저를 사용 중입니다.',
    authorId: 105,
    authorName: '최지훈',
    status: 'ANSWERED',
    viewCount: 15,
    answer: {
      content:
        '제보 감사합니다. 해당 버그를 확인하여 수정 완료했습니다. 페이지를 새로고침하시면 정상 작동할 것입니다.',
      authorId: 999,
      authorName: '관리자',
      createdAt: threeDaysAgo.toISOString(),
    },
    createdAt: threeDaysAgo.toISOString(),
    updatedAt: threeDaysAgo.toISOString(),
  },
  // 케이스 6: 고민 상담 (접수 상태 - 비공개)
  {
    id: 6,
    type: 'GENERAL',
    title: '개발자로의 커리어 전환에 대해 고민이 있어요',
    content:
      '현재 비전공자인데 개발자로 전향을 고민하고 있습니다. 어떤 것부터 시작하면 좋을까요?',
    authorId: 106,
    authorName: '강민지',
    status: 'PENDING',
    viewCount: 2,
    createdAt: oneDayAgo.toISOString(),
    updatedAt: oneDayAgo.toISOString(),
  },
  // 케이스 7: 결제 환불 문의 (답변 완료)
  {
    id: 7,
    type: 'PAYMENT',
    title: '스터디 참가비 환불 정책이 궁금합니다',
    content:
      '부득이한 사정으로 중도 하차할 경우 환불이 가능한가요? 환불 정책에 대해 자세히 알려주세요.',
    authorId: 107,
    authorName: '윤서연',
    status: 'ANSWERED',
    viewCount: 20,
    answer: {
      content:
        '안녕하세요. 환불 정책은 다음과 같습니다.\n\n스터디 시작 전: 100% 환불\n스터디 진행 중 (1주차): 80% 환불\n스터디 진행 중 (2주차 이후): 환불 불가\n\n자세한 내용은 스터디 규정을 참고해주세요.',
      authorId: 1,
      authorName: 'djyun',
      createdAt: oneWeekAgo.toISOString(),
    },
    createdAt: oneWeekAgo.toISOString(),
    updatedAt: oneWeekAgo.toISOString(),
  },
  // 케이스 8: 스터디 일정 변경 (현재 사용자)
  {
    id: 8,
    type: 'STUDY',
    title: '스터디 일정 변경 요청',
    content:
      '개인 사정으로 인해 정기 모임 시간 변경이 가능한지 여쭙고 싶습니다.',
    authorId: 1,
    authorName: '나',
    status: 'PENDING',
    viewCount: 1,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  // 케이스 9: 리더 문의 (이미지 첨부)
  {
    id: 9,
    type: 'LEADER',
    title: '리더님께 프로젝트 아이디어를 공유하고 싶어요',
    content:
      '스터디에서 진행할 프로젝트에 대한 아이디어가 있는데 리더님께 피드백을 받고 싶습니다. 간단한 기획안을 첨부했습니다.',
    authorId: 108,
    authorName: '한지민',
    status: 'IN_REVIEW',
    viewCount: 4,
    images: ['/mock-idea-1.png', '/mock-idea-2.png'],
    createdAt: oneDayAgo.toISOString(),
    updatedAt: oneDayAgo.toISOString(),
  },
  // 케이스 10: 멘토 문의 (1:1 코드리뷰)
  {
    id: 10,
    type: 'MENTOR',
    title: '1:1 코드리뷰 신청 방법이 궁금합니다',
    content: '멘토님께 개별적으로 코드리뷰를 받고 싶은데 어떻게 신청하나요?',
    authorId: 109,
    authorName: '송민호',
    mentorId: 1,
    status: 'ANSWERED',
    viewCount: 18,
    answer: {
      content:
        '1:1 코드리뷰는 스터디 라운지 탭에서 "코드리뷰 요청" 버튼을 통해 신청하실 수 있습니다. 주 1회 신청 가능합니다.',
      authorId: 1,
      authorName: 'djyun',
      createdAt: threeDaysAgo.toISOString(),
    },
    createdAt: threeDaysAgo.toISOString(),
    updatedAt: threeDaysAgo.toISOString(),
  },
];

/**
 * 문의 권한 체크 헬퍼 함수
 */
export function canViewInquiry(
  inquiry: Inquiry,
  currentUserId?: number,
  isMentor?: boolean,
  isAdmin?: boolean,
): boolean {
  // 관리자는 모든 문의 열람 가능
  if (isAdmin) return true;

  // 작성자는 본인 문의 열람 가능
  if (currentUserId === inquiry.authorId) return true;

  // 멘토는 자신에게 할당된 문의 열람 가능
  if (isMentor && inquiry.mentorId === currentUserId) return true;

  // 권한 없음
  return false;
}
