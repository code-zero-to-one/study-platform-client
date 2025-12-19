# RequestAutoStudyMatchingDto

자동 매칭 신규 요청 DTO

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**memberId** | **number** |  | [optional] [default to undefined]
**selfIntroduction** | **string** | 자기소개 | [default to undefined]
**studyPlan** | **string** | 스터디 주제 및 계획 | [default to undefined]
**preferredStudySubjectId** | **string** | 선호하는 스터디 주제 ID | [default to undefined]
**availableStudyTimeIds** | **Array&lt;number&gt;** | 스터디 참여 가능 시간대 목록 | [default to undefined]
**techStackIds** | **Array&lt;number&gt;** | 사용 가능한 기술 스택 목록 | [default to undefined]
**tel** | **string** | 연락처 (휴대폰 번호). &#x60;010-1234-5678&#x60; 또는 &#x60;01012345678&#x60; 형식만 가능합니다. | [default to undefined]
**githubLink** | **string** | GitHub 프로필 URL (선택). 유효한 URL 형식이어야 합니다. (예: https://github.com, www.github.com, github.com) | [optional] [default to undefined]
**blogOrSnsLink** | **string** | 블로그/SNS URL (선택). 유효한 URL 형식이어야 합니다. (예: https://velog.io, www.velog.io, velog.io) | [optional] [default to undefined]

## Example

```typescript
import { RequestAutoStudyMatchingDto } from './api';

const instance: RequestAutoStudyMatchingDto = {
    memberId,
    selfIntroduction,
    studyPlan,
    preferredStudySubjectId,
    availableStudyTimeIds,
    techStackIds,
    tel,
    githubLink,
    blogOrSnsLink,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
