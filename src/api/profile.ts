import { Api } from '@/shared/api/apiInstance';

interface Profile {
  statusCode: number;
  content: {
    memberId: number;
    memberInfo: {
      selfIntroduction: string; // 자기소개
      studyPlan: string; // 공부 주제 및 계획
      preferredStudySubjectId: string; // 선호 하는 스터디 주제
      availableStudyTimes: {
        id: number;
        fromTime: string | null; // "09:00"
        toTime: string | null; // "12:00"
        label: string; // "오전"
        fullLabel: string; // "오전(09:00~12:00)"
      }[]; // 가능한 스터디 시간
      techStacks: {
        techStackId: number;
        code: string;
        techStackName: string;
        parentId: number | null;
        level: number;
      }[]; // 사용 가능한 기술 스택
    };
    memberProfile: {
      memberName: string;
      profileImage: {
        imageId: number;
        resizedImage: [
          {
            resizedImageId: number;
            resizedImageUrl: string;
            imageSizeType: {
              imageTypeName: string;
              width: number | null;
              height: number | null;
            };
          },
        ];
      };
      simpleIntroduction: string;
      mbti: string;
      interests: {
        id: number;
        name: string;
      }[];
      birthDate: string;
      hobbies: {
        id: number;
        name: string;
      }[];
      githubLink: {
        url: string;
        iconUrl: string;
        type: string;
      };
      blogOrSnsLink: {
        url: string;
        iconUrl: string;
        type: string;
      };
      tel: string;
    };
  };
}

// 프로필 조회
export const getProfile = async ({ memberId }: { memberId: string }) => {
  const response = await Api.get<Profile>(
    `/api/v1/members/${memberId}/profile`,
  );

  if (response.status === 200) {
    return response.data.content;
  }

  // // FIX: 추후 삭제 예정
  // const mockProfile: Profile = {
  //   statusCode: 200,
  //   content: {
  //     memberId: 10000,
  //     memberInfo: {
  //       selfIntroduction:
  //         '<p>안녕하세요, 저는 개발자를 꿈꾸고 있습니다.</p><p>잘하지는 않지만 열심히 합니다.</p>',
  //       studyPlan: '매일 세 시간씩 자면서 공부할 계획입니다.',
  //       preferredStudySubjectId: 'CS_DEEP',
  //       availableStudyTimes: [
  //         {
  //           id: 1,
  //           fromTime: '09:00',
  //           toTime: '12:00',
  //           label: '오전',
  //           fullLabel: '오전(09:00~12:00)',
  //         },
  //         {
  //           id: 2,
  //           fromTime: '12:00',
  //           toTime: '13:00',
  //           label: '점심',
  //           fullLabel: '점심(12:00~13:00)',
  //         },
  //       ],
  //       techStacks: [
  //         {
  //           techStackId: 1,
  //           code: 'BCD',
  //           techStackName: 'Back-end',
  //           parentId: null,
  //           level: 1,
  //         },
  //         {
  //           techStackId: 2,
  //           code: 'KFK',
  //           techStackName: 'Apache Kafka',
  //           parentId: 1,
  //           level: 2,
  //         },
  //       ],
  //     },
  //     memberProfile: {
  //       memberName: '제로원',
  //       profileImage: {
  //         imageId: 1,
  //         resizedImage: [
  //           {
  //             resizedImageId: 1,
  //             resizedImageUrl:
  //               'https://plus.unsplash.com/premium_photo-1719297388945-76b5b5a42d43?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  //             imageSizeType: {
  //               imageTypeName: 'ORIGINAL',
  //               width: 100,
  //               height: 100,
  //             },
  //           },
  //         ],
  //       },
  //       simpleIntroduction: '잘 부탁드립니다.',
  //       mbti: 'ENTP',
  //       birthDate: '1990-01-01',
  //       interests: [
  //         {
  //           id: 1,
  //           name: 'Self-teaching',
  //         },
  //         {
  //           id: 2,
  //           name: 'MIT OCW',
  //         },
  //         {
  //           id: 3,
  //           name: 'Google',
  //         },
  //       ],
  //       hobbies: [
  //         {
  //           id: 1,
  //           name: '축구',
  //         },
  //         {
  //           id: 2,
  //           name: '농구',
  //         },
  //       ],
  //       githubLink: {
  //         url: 'https://github.com/rudeh1253',
  //         iconUrl: 'https://s3.com/image/github.png',
  //         type: 'GITHUB',
  //       },
  //       blogOrSnsLink: {
  //         url: 'https://velog.io/@rudeh1253/posts',
  //         iconUrl: 'https://s3.com/image/blog.png',
  //         type: 'BLOG_OR_SNS',
  //       },
  //       tel: '010-1224-1234',
  //     },
  //   },
  // };

  // return mockProfile.content;
};

export interface UpdateProfileRequest {
  name?: string;
  tel?: string;
  githubLink?: string;
  blogOrSnsLink?: string;
  simpleIntroduction?: string;
  mbti?: string;
  interests?: {
    creations: string[];
    modifications: {
      id: number;
      to: string;
    }[];
    deletions: number[];
  };
  hobbies?: {
    creations: string[];
    modifications: {
      id: number;
      to: string;
    }[];
    deletions: number[];
  };
}

interface UpdateProfileResponse {
  statusCode: number;
  content: {
    memberId: number;
    name: string;
    profileImageUploadUrl: string;
    tel: string;
    githubLink: string;
    blogOrSnsLink: string;
    simpleIntroduction: string;
    mbti: string;
    interests: {
      id: number;
      name: string;
    }[];
    hobbies: {
      id: number;
      name: string;
    }[];
  };
}

// 프로필 수정
export const updateProfile = async ({
  memberId,
  data,
}: {
  memberId: string;
  data: UpdateProfileRequest;
}) => {
  const response = await Api.patch<UpdateProfileResponse>(
    `/api/v1/members/${memberId}/profile`,
    data,
  );

  return response.data.content;
};

export interface UpdateProfileInfoRequest {
  selfIntroduction?: string;
  studyPlan?: string;
  preferredStudySubjectId?: string;
  availableStudyTimeIds?: number[];
  techStackIds?: number[];
}

interface UpdateProfileInfoResponse {
  statusCode: number;
  content: {
    memberId: number;
    selfIntroduction: string;
    studyPlan: string;
    preferredStudySubjectId: string;
    techStackIds: number[];
  };
}

export const updateProfileInfo = async ({
  memberId,
  data,
}: {
  memberId: string;
  data: UpdateProfileInfoRequest;
}) => {
  const response = await Api.patch<UpdateProfileInfoResponse>(
    `/api/v1/members/${memberId}/profile/info`,
    data,
  );

  return response.data.content;
};

export interface AvailableStudyTime {
  availableTimeId: number;
  display: string;
}

export const getAvailableStudyTimes = async (): Promise<
  AvailableStudyTime[]
> => {
  const response = await Api.get<{
    statusCode: number;
    content: AvailableStudyTime[];
  }>('/api/v1/available-study-times');

  return response.data.content;

  // // FIX: 추후 삭제 예정
  // return [
  //   {
  //     availableTimeId: 1,
  //     display: '오전(09:00~12:00)',
  //   },
  //   {
  //     availableTimeId: 2,
  //     display: '점심(12:00~13:00)',
  //   },
  //   {
  //     availableTimeId: 3,
  //     display: '오후(13:00~18:00)',
  //   },
  //   {
  //     availableTimeId: 4,
  //     display: '저녁(18:00~21:00)',
  //   },
  //   {
  //     availableTimeId: 5,
  //     display: '심야(21:00~23:00)',
  //   },
  //   {
  //     availableTimeId: 6,
  //     display: '시간 협의 가능',
  //   },
  // ];
};

export interface StudySubject {
  studySubjectId: string;
  studySubjectName: string;
}

export const getStudySubjects = async (): Promise<StudySubject[]> => {
  const response = await Api.get<{
    statusCode: number;
    content: StudySubject[];
    message: string;
  }>('/api/v1/study-subjects');

  return response.data.content;

  // // FIX: 추후 삭제 예정
  // return [
  //   {
  //     studySubjectId: 'CS_DEEP',
  //     studySubjectName: 'CS Deep Dive',
  //   },
  //   {
  //     studySubjectId: 'BACKEND_DEEP',
  //     studySubjectName: 'Back-end Deep Dive',
  //   },
  //   {
  //     studySubjectId: 'FRONTEND_DEEP',
  //     studySubjectName: 'Front-end Deep Dive',
  //   },
  // ];
};
