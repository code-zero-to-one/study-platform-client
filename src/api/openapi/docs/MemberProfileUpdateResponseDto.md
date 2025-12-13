# MemberProfileUpdateResponseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**memberId** | **number** | 업데이트된 회원의 ID | [optional] [default to undefined]
**name** | **string** | 업데이트된 회원의 이름 | [optional] [default to undefined]
**profileImageUploadUrl** | **string** | 프로필 이미지 업로드 URL. 이 URL로 프로필 이미지를 업로드하면 완료된다. | [optional] [default to undefined]
**tel** | **string** | 연락처 | [optional] [default to undefined]
**githubLink** | **string** | 업데이트된 회원의 github 링크 | [optional] [default to undefined]
**blogOrSnsLink** | **string** | 업데이트된 회원의 블로그/SNS 링크 | [optional] [default to undefined]
**simpleIntroduction** | **string** | 업데이트된 한 마디 소개 | [optional] [default to undefined]
**mbti** | **string** | 업데이트된 MBTI | [optional] [default to undefined]
**birthDate** | **string** | 업데이트된 생년월일 | [optional] [default to undefined]
**interests** | [**Array&lt;IdNameDto&gt;**](IdNameDto.md) | 업데이트된 관심사 | [optional] [default to undefined]

## Example

```typescript
import { MemberProfileUpdateResponseDto } from './api';

const instance: MemberProfileUpdateResponseDto = {
    memberId,
    name,
    profileImageUploadUrl,
    tel,
    githubLink,
    blogOrSnsLink,
    simpleIntroduction,
    mbti,
    birthDate,
    interests,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
