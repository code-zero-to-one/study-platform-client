# MemberProfileUpdateRequestDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**nickname** | **string** | 닉네임 | [optional] [default to undefined]
**birthDate** | **string** | 생년월일. yyyy-MM-dd 형식 | [optional] [default to undefined]
**githubLink** | **string** | GitHub 링크 | [optional] [default to undefined]
**blogOrSnsLink** | **string** | 블로그/SNS 등 링크 | [optional] [default to undefined]
**simpleIntroduction** | **string** | 한 마디 소개 | [optional] [default to undefined]
**mbti** | **string** | MBTI | [optional] [default to undefined]
**interests** | **Array&lt;string&gt;** | 관심사 리스트 - 기존 데이터는 날아가고 이걸로 대체 | [optional] [default to undefined]
**profileImageExtension** | **string** | 프로필 이미지 확장자. null이 아닐 경우 프로필 이미지 업로드 URL이 반환됨. null일 경우 반환되지 않음 | [optional] [default to undefined]
**techStackIds** | **Array&lt;number&gt;** | 기술 스택 ID 목록 | [optional] [default to undefined]

## Example

```typescript
import { MemberProfileUpdateRequestDto } from './api';

const instance: MemberProfileUpdateRequestDto = {
    nickname,
    birthDate,
    githubLink,
    blogOrSnsLink,
    simpleIntroduction,
    mbti,
    interests,
    profileImageExtension,
    techStackIds,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
