# MentorCoreKeywordRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**type** | **string** | 핵심키워드 입력 타입. 기존 운영 키워드는 PREDEFINED, 직접 입력 키워드는 CUSTOM. | [default to undefined]
**code** | **string** | PREDEFINED 타입일 때 전송하는 운영 키워드 코드. CUSTOM이면 null이어야 합니다. | [optional] [default to undefined]
**label** | **string** | CUSTOM 타입일 때 전송하는 사용자 입력 키워드. PREDEFINED이면 null이어야 합니다. | [optional] [default to undefined]

## Example

```typescript
import { MentorCoreKeywordRequest } from './api';

const instance: MentorCoreKeywordRequest = {
    type,
    code,
    label,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
