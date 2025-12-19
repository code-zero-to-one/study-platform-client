# MemberProfileResponseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**memberName** | **string** | 회원 이름 | [optional] [default to undefined]
**profileImage** | [**ImageDto**](ImageDto.md) | 프로필 이미지 - 리사이징된 이미지를 포함하고 있음 - 지금은 ORIGINAL 하나밖에 없음 | [optional] [default to undefined]
**simpleIntroduction** | **string** | 한마디 소개 | [optional] [default to undefined]
**mbti** | **string** | MBTI | [optional] [default to undefined]
**interests** | [**Array&lt;IdNameDto&gt;**](IdNameDto.md) | 관심사 | [optional] [default to undefined]
**githubLink** | [**SocialMediaResponseDto**](SocialMediaResponseDto.md) | 깃헙 링크 | [optional] [default to undefined]
**birthDate** | **string** | 생일, yyyy-MM-dd 형식 | [optional] [default to undefined]
**blogOrSnsLink** | [**SocialMediaResponseDto**](SocialMediaResponseDto.md) | 블로그/SNS 링크 | [optional] [default to undefined]
**tel** | **string** | 연락처 - 국제번호는 포함하지 않음 | [optional] [default to undefined]

## Example

```typescript
import { MemberProfileResponseDto } from './api';

const instance: MemberProfileResponseDto = {
    memberName,
    profileImage,
    simpleIntroduction,
    mbti,
    interests,
    githubLink,
    birthDate,
    blogOrSnsLink,
    tel,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
