# GroupStudyApplicant

그룹스터디 신청 목록 응답 - 지원자 정보

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**memberId** | **number** | 신청자 ID | [optional] [default to undefined]
**memberNickname** | **string** | 신청자 닉네임 | [optional] [default to undefined]
**profileImage** | [**Image**](Image.md) | 신청자 프로필 이미지 | [optional] [default to undefined]
**simpleIntroduction** | **string** | 신청자 한줄 소개 | [optional] [default to undefined]
**sincerityTemp** | [**SincerityTempResponse**](SincerityTempResponse.md) | 성실온도 | [optional] [default to undefined]

## Example

```typescript
import { GroupStudyApplicant } from './api';

const instance: GroupStudyApplicant = {
    memberId,
    memberNickname,
    profileImage,
    simpleIntroduction,
    sincerityTemp,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
