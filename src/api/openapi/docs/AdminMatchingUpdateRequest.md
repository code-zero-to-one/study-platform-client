# AdminMatchingUpdateRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**partnerId** | **number** | 변경할 파트너 회원 ID | [optional] [default to undefined]
**status** | **string** | 변경할 매칭 상태 (CANCELED, DONE 등) | [optional] [default to undefined]
**content** | **string** | 관리자 메모 또는 변경 사유 | [optional] [default to undefined]

## Example

```typescript
import { AdminMatchingUpdateRequest } from './api';

const instance: AdminMatchingUpdateRequest = {
    partnerId,
    status,
    content,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
