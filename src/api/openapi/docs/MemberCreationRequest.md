# MemberCreationRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**loginId** | **string** | 회원의 로그인 아이디(소셜 로그인 시 비어있음) | [optional] [default to undefined]
**nickname** | **string** | 회원의 닉네임 (기존 name에서 변경됨) 필수값이지만 하위호환성을 위해 선택값으로 처리 | [optional] [default to undefined]
**name** | **string** | 호환성을 위한 임시 필드 | [optional] [default to undefined]
**jobs** | **Array&lt;string&gt;** | 직무 리스트 (최대 5개) (예: [IT_PRACTITIONER_BACKEND, IT_PRACTITIONER_FRONTEND]) | [optional] [default to undefined]
**career** | **string** | 경력 (예: JUNIOR) | [optional] [default to undefined]
**studyFormatTypes** | **Array&lt;string&gt;** | 관심 스터디 유형 리스트 (예: [\&quot;PROJECT\&quot;, \&quot;SEMINAR\&quot;]) | [optional] [default to undefined]
**goal** | **string** | 목표 및 다짐 (최대 100자) | [optional] [default to undefined]
**imageExtension** | **string** | 이미지 확장자 - DEFAULT, JPG, PNG, GIF, WEBP, SVG, JPEG | [optional] [default to undefined]

## Example

```typescript
import { MemberCreationRequest } from './api';

const instance: MemberCreationRequest = {
    loginId,
    nickname,
    name,
    jobs,
    career,
    studyFormatTypes,
    goal,
    imageExtension,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
