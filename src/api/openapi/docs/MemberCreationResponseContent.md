# MemberCreationResponseContent


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**generatedMemberId** | **number** | 회원가입 시 자동 생성되는 memberId. loginId와 다르며, 회원을 식별하는 데 사용된다. | [optional] [default to undefined]
**uploadUrl** | **string** | 프로필 이미지를 업로드할 URL | [optional] [default to undefined]
**accessToken** | **string** | Access Token | [optional] [default to undefined]

## Example

```typescript
import { MemberCreationResponseContent } from './api';

const instance: MemberCreationResponseContent = {
    generatedMemberId,
    uploadUrl,
    accessToken,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
