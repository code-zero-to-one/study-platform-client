# MemberProfileForStudyDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**memberId** | **number** | 회원 ID | [optional] [default to undefined]
**selfIntroduction** | **string** | 자기소개 | [optional] [default to undefined]
**studyPlan** | **string** | 공부 주제 및 계획 | [optional] [default to undefined]
**preferredStudySubjectId** | **string** | 선호하는 스터디 주제 ID | [optional] [default to undefined]
**availableStudyTimeIds** | **Array&lt;number&gt;** | 가능 시간대 ID 리스트 | [optional] [default to undefined]
**availableTechStackIds** | **Array&lt;number&gt;** | 사용 가능한 기술 스택 리스트 | [optional] [default to undefined]
**tel** | **string** | 연락처 | [optional] [default to undefined]
**gitHubLink** | [**SocialMediaResponseDto**](SocialMediaResponseDto.md) | GitHub 링크 | [optional] [default to undefined]
**blogOrSnsLink** | [**SocialMediaResponseDto**](SocialMediaResponseDto.md) | 블로그/SNS 등 링크 | [optional] [default to undefined]
**sincerityTemp** | [**SincerityTempResponse**](SincerityTempResponse.md) | 성실온도 | [optional] [default to undefined]

## Example

```typescript
import { MemberProfileForStudyDto } from './api';

const instance: MemberProfileForStudyDto = {
    memberId,
    selfIntroduction,
    studyPlan,
    preferredStudySubjectId,
    availableStudyTimeIds,
    availableTechStackIds,
    tel,
    gitHubLink,
    blogOrSnsLink,
    sincerityTemp,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
