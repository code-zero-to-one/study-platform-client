import { Api } from '@/shared/api/apiInstance';

export interface TechStack {
  teckStackId: number;
  code: string;
  techStackName: string;
  parentId: number | null;
  level: number;
}

// 기술 스택 조회
export const getTechStacks = async () => {
  const response = await Api.get<{
    statusCode: number;
    timestamp: string;
    content: TechStack[];
  }>('/api/v1/tech-stacks');

  return response.data.content;

  // // FIX: 추후 삭제 예정
  // const mockTechStacks: {
  //   statusCode: number;
  //   timestamp: string;
  //   content: TechStack[];
  // } = {
  //   statusCode: 200,
  //   timestamp: '2025-03-30T12:12:30.013',
  //   content: [
  //     {
  //       teckStackId: 1,
  //       code: 'BCD',
  //       techStackName: 'Back-end',
  //       parentId: null,
  //       level: 1,
  //     },
  //     {
  //       teckStackId: 2,
  //       code: 'KFK',
  //       techStackName: 'Apache Kafka',
  //       parentId: 1,
  //       level: 2,
  //     },
  //     {
  //       teckStackId: 3,
  //       code: 'JV',
  //       techStackName: 'Java',
  //       parentId: 1,
  //       level: 2,
  //     },
  //     {
  //       teckStackId: 4,
  //       code: 'SPR',
  //       techStackName: 'Spring Framework',
  //       parentId: 1,
  //       level: 2,
  //     },
  //     {
  //       teckStackId: 5,
  //       code: 'SPJ',
  //       techStackName: 'Spring Data JPA',
  //       parentId: 4,
  //       level: 3,
  //     },
  //   ],
  // };

  // return mockTechStacks.content;
};
