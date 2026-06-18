# MatchingRequestResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**matchingRequestId** | **number** | 매칭 요청 ID | [optional] [default to undefined]
**memberId** | **number** | 요청 회원 ID | [optional] [default to undefined]
**memberName** | **string** | 요청 회원 이름 | [optional] [default to undefined]
**partnerId** | **number** | 파트너 회원 ID | [optional] [default to undefined]
**partnerName** | **string** | 파트너 회원 이름 | [optional] [default to undefined]
**status** | **string** | 매칭 상태 | [optional] [default to undefined]
**type** | **string** | 매칭 종류 | [optional] [default to undefined]
**content** | **string** | 내용/메모 | [optional] [default to undefined]
**weeklyPeriodIdentifier** | **string** | 주차 식별자 (해당 주의 월요일 날짜) | [optional] [default to undefined]
**createdAt** | **string** | 생성 일시 | [optional] [default to undefined]
**updatedAt** | **string** | 수정 일시 | [optional] [default to undefined]

## Example

```typescript
import { MatchingRequestResponse } from './api';

const instance: MatchingRequestResponse = {
    matchingRequestId,
    memberId,
    memberName,
    partnerId,
    partnerName,
    status,
    type,
    content,
    weeklyPeriodIdentifier,
    createdAt,
    updatedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
