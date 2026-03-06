# MemberDto

MVP 팀 멤버 정보

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**userId** | **number** | 사용자 ID | [optional] [default to undefined]
**nickname** | **string** | 닉네임 | [optional] [default to undefined]
**profileImage** | [**ImageDto**](ImageDto.md) | 프로필 이미지 정보 | [optional] [default to undefined]

## Example

```typescript
import { MemberDto } from './api';

const instance: MemberDto = {
    userId,
    nickname,
    profileImage,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
