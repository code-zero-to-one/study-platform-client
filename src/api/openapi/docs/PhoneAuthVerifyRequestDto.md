# PhoneAuthVerifyRequestDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**realName** | **string** | 실명 | [default to undefined]
**phoneNumber** | **string** | 전화번호 (01로 시작하는 10-11자리) | [default to undefined]
**code** | **string** | 6자리 인증번호 | [default to undefined]

## Example

```typescript
import { PhoneAuthVerifyRequestDto } from './api';

const instance: PhoneAuthVerifyRequestDto = {
    realName,
    phoneNumber,
    code,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
