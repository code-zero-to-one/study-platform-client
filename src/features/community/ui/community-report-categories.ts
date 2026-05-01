/** 커뮤니티 이용 규칙 기준 신고 유형 (드롭다운 옵션) */

export interface CommunityReportCategoryGroup {
  readonly label: string;
  readonly options: readonly {
    readonly value: string;
    readonly label: string;
  }[];
}

export const COMMUNITY_REPORT_CATEGORY_GROUPS: readonly CommunityReportCategoryGroup[] =
  [
    {
      label: '중대 위반 (영구 탈퇴 대상)',
      options: [
        { value: 'gambling', label: '사행성 콘텐츠 (도박·불법 복권 등)' },
        {
          value: 'unauthorized_ad',
          label: '타인 제품·서비스 무단 광고·제휴 링크',
        },
        { value: 'spam', label: '스팸·도배·동일·유사 내용 반복' },
        { value: 'phishing', label: '피싱·사기·허위 사실·사기성 링크' },
        { value: 'hate', label: '인신공격·혐오·차별 발언' },
        {
          value: 'adult_illegal',
          label: '성인·불법 콘텐츠 (음란·불법 촬영물·링크 등)',
        },
        { value: 'privacy', label: '개인정보 무단 수집·공유' },
      ],
    },
    {
      label: '운영 정책 위반',
      options: [
        { value: 'off_topic', label: '게시판 주제와 무관한 글' },
        {
          value: 'low_quality',
          label: '저품질 게시 (복붙·링크만·성의 없는 글 등)',
        },
        { value: 'faction', label: '파벌 형성·집단 동조·반박 유도' },
        { value: 'staff_attack', label: '운영진 결정에 대한 공개 비방' },
        {
          value: 'no_attribution',
          label: '출처 미표시·저작물 무단 게시 의심',
        },
      ],
    },
    {
      label: '게시판별 위반',
      options: [
        {
          value: 'feed_board',
          label: '빌더 피드 위반 (타인 홍보 대행·채용·팀원 모집 등)',
        },
        {
          value: 'qna_board',
          label:
            '질문답변 위반 (즉시 검색 가능 수준 질문·코드 대리 작성 요청 등)',
        },
        {
          value: 'tech_board',
          label:
            '테크 한입 위반 (IT 무관·미확인 루머·특정 기업·제품 비방 목적 등)',
        },
        {
          value: 'free_board',
          label: '자유게시판 위반 (정치·종교 분쟁·타인 비방·홍보 우회 이용 등)',
        },
        {
          value: 'comment_rules',
          label: '댓글 규칙 위반 (비난·조롱·광고·파벌 댓글 등)',
        },
      ],
    },
    {
      label: '기타',
      options: [
        { value: 'other', label: '기타 (상세 내용에 구체히 적어 주세요)' },
      ],
    },
  ] as const;
