# MemberCreationRequestDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**loginId** | **string** | 로그인 시 사용될 ID (혹은 소셜 로그인 ID). 소셜 로그인 시 생략된다. | [optional] [default to undefined]
**name** | **string** | 회원의 이름 | [default to undefined]
**imageExtension** | **string** | 이미지 확장자 - jpg, jpeg, png 등.  | [optional] [default to undefined]

## Example

```typescript
import { MemberCreationRequestDto } from './api';

const instance: MemberCreationRequestDto = {
    loginId,
    name,
    imageExtension,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
