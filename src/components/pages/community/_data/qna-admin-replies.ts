import { type Grade } from '@/components/pages/class/_data/feed-data';

export interface AdminReply {
  id: number;
  name: string;
  grade: Grade;
  text: string;
  when: string;
  likes: number;
  dislikes: number;
}

// 질문 ID → 운영진 답변에 대한 대댓글 더미 데이터
export const ADMIN_ANSWER_REPLIES: Record<string, AdminReply[]> = {
  '1': [
    {
      id: 1001,
      name: '지윤메이커',
      grade: '빌더',
      text: '아 이렇게 하면 되는군요! 바로 풀렸어요. 감사합니다 :)',
      when: '20분 전',
      likes: 3,
      dislikes: 0,
    },
    {
      id: 1002,
      name: '제로지수',
      grade: '운영자',
      text: '잘 해결되어서 다행이에요! 다음 레슨도 화이팅입니다.',
      when: '15분 전',
      likes: 2,
      dislikes: 0,
    },
  ],
  '2': [
    {
      id: 2001,
      name: '도현모닝',
      grade: '3학년',
      text: '저도 같은 이슈였는데 도움 많이 받았습니다!',
      when: '1시간 전',
      likes: 5,
      dislikes: 0,
    },
  ],
  '3': [
    {
      id: 3001,
      name: '서연코덕',
      grade: '빌더',
      text: '추가로 궁금한 점이 있는데, 환경 변수는 어디에 적어야 하나요?',
      when: '30분 전',
      likes: 1,
      dislikes: 0,
    },
    {
      id: 3002,
      name: '제로호준',
      grade: '운영자',
      text: '.env.local 파일에 적어주시면 돼요. 자세한 건 README 참고해주세요!',
      when: '25분 전',
      likes: 4,
      dislikes: 0,
    },
  ],
};
