# TossWebhookPayload


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**eventType** | **string** |  | [optional] [default to undefined]
**createdAt** | **string** |  | [optional] [default to undefined]
**data** | [**PaymentData**](PaymentData.md) |  | [optional] [default to undefined]
**paymentStatusChanged** | **boolean** |  | [optional] [default to undefined]
**depositCallback** | **boolean** |  | [optional] [default to undefined]
**latestCancel** | [**CancelData**](CancelData.md) |  | [optional] [default to undefined]
**paymentRelatedEvent** | **boolean** |  | [optional] [default to undefined]

## Example

```typescript
import { TossWebhookPayload } from './api';

const instance: TossWebhookPayload = {
    eventType,
    createdAt,
    data,
    paymentStatusChanged,
    depositCallback,
    latestCancel,
    paymentRelatedEvent,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
