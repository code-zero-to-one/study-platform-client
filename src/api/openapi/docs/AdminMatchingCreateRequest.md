# AdminMatchingCreateRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**memberId** | **number** | 매칭을 요청하는 회원 ID | [default to undefined]
**partnerId** | **number** | 매칭될 파트너 회원 ID | [default to undefined]
**status** | **string** | 매칭 상태 (PENDING, RES_ACPT, RES_AUTO, RES_REJ, AUTO, DONE, CANCEL 등) | [default to undefined]
**type** | **string** | 매칭 종류 (AUTO, MANUAL) | [default to undefined]
**content** | **string** | 관리자 메모 | [optional] [default to undefined]
**weeklyPeriodIdentifier** | **string** | 주간 식별자 | [default to undefined]

## Example

```typescript
import { AdminMatchingCreateRequest } from './api';

const instance: AdminMatchingCreateRequest = {
    memberId,
    partnerId,
    status,
    type,
    content,
    weeklyPeriodIdentifier,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
