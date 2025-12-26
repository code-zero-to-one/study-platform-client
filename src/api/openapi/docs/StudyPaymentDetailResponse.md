# StudyPaymentDetailResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**paymentId** | **number** |  | [optional] [default to undefined]
**paymentCode** | **string** |  | [optional] [default to undefined]
**memberId** | **number** |  | [optional] [default to undefined]
**memberName** | **string** |  | [optional] [default to undefined]
**groupStudyId** | **number** |  | [optional] [default to undefined]
**groupStudyTitle** | **string** |  | [optional] [default to undefined]
**studyStartDate** | **string** |  | [optional] [default to undefined]
**amount** | **number** |  | [optional] [default to undefined]
**currency** | **string** |  | [optional] [default to undefined]
**status** | **string** |  | [optional] [default to undefined]
**method** | **string** |  | [optional] [default to undefined]
**pgProvider** | **string** |  | [optional] [default to undefined]
**pgTransactionId** | **string** |  | [optional] [default to undefined]
**tossOrderId** | **string** |  | [optional] [default to undefined]
**tossPaymentKey** | **string** |  | [optional] [default to undefined]
**receiptUrl** | **string** |  | [optional] [default to undefined]
**createdAt** | **string** |  | [optional] [default to undefined]
**paidAt** | **string** |  | [optional] [default to undefined]
**canceledAt** | **string** |  | [optional] [default to undefined]
**histories** | [**Array&lt;PaymentHistoryResponse&gt;**](PaymentHistoryResponse.md) |  | [optional] [default to undefined]

## Example

```typescript
import { StudyPaymentDetailResponse } from './api';

const instance: StudyPaymentDetailResponse = {
    paymentId,
    paymentCode,
    memberId,
    memberName,
    groupStudyId,
    groupStudyTitle,
    studyStartDate,
    amount,
    currency,
    status,
    method,
    pgProvider,
    pgTransactionId,
    tossOrderId,
    tossPaymentKey,
    receiptUrl,
    createdAt,
    paidAt,
    canceledAt,
    histories,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
