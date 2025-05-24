import { Api } from '@/shared/api/apiInstance';

interface Profile {
  statusCode: number;
  content: {
    memberId: number;
    memberInfo: {
      selfIntroduction: string; // 자기소개
      studyPlan: string; // 공부 주제 및 계획
      preferredStudySubjectId: string; // 선호 하는 스터디 주제
      availableStudyTimes: string[]; // 가능한 스터디 시간
      techStacks: number[]; // 사용 가능한 기술 스택
    };
    memberProfile: {
      name: string;
      simpleIntroduction: string;
      mbti: string;
      interests: string[];
      hobbies: string[];
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

  // FIX: 추후 삭제 예정
  // const mockProfile: Profile = {
  //   statusCode: 200,
  //   content: {
  //     memberId: 10000,
  //     memberInfo: {
  //       selfIntroduction:
  //         '<p>안녕하세요, 저는 개발자를 꿈꾸고 있습니다.</p><p>잘하지는 않지만 열심히 합니다.</p>',
  //       studyPlan: '매일 세 시간씩 자면서 공부할 계획입니다.',
  //       preferredStudySubjectId: 'CS_DEEP',
  //       availableStudyTimes: ['오전(09:00~12:00)', '저녁(18:00~21:00)'],
  //       techStacks: [1, 2, 3, 4, 5],
  //     },
  //     memberProfile: {
  //       name: '제로원',
  //       simpleIntroduction: '잘 부탁드립니다.',
  //       mbti: 'ENTP',
  //       interests: ['Self-teaching', 'MIT OCW', 'Google'],
  //       hobbies: ['축구', '농구'],
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
  name: string;
  tel: string;
  githubLink: string;
  blogOrSnsLink: string;
  simpleIntroduction: string;
  mbti: string;
  interests: {
    creations: string[];
    modifications: {
      id: number;
      to: string;
    }[];
    deletions: number[];
  };
  hobbies: {
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
  const response = await Api.put<UpdateProfileResponse>(
    `/api/v1/members/${memberId}/profile`,
    data,
  );

  return response.data.content;
};

export interface UpdateProfileInfoRequest {
  selfIntroduction: string;
  studyPlan: string;
  preferredStudySubjectId: string;
  availableStudyTimeIds: number[];
  techStackIds: number[];
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
  const response = await Api.put<UpdateProfileInfoResponse>(
    `/api/v1/members/${memberId}/profile/info`,
    data,
  );

  return response.data.content;
};
