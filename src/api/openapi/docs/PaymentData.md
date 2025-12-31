# PaymentData


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**paymentKey** | **string** |  | [optional] [default to undefined]
**orderId** | **string** |  | [optional] [default to undefined]
**status** | **string** |  | [optional] [default to undefined]
**method** | **string** |  | [optional] [default to undefined]
**totalAmount** | **number** |  | [optional] [default to undefined]
**balanceAmount** | **number** |  | [optional] [default to undefined]
**approvedAt** | **string** |  | [optional] [default to undefined]
**secret** | **string** |  | [optional] [default to undefined]
**cancels** | [**Array&lt;CancelData&gt;**](CancelData.md) |  | [optional] [default to undefined]

## Example

```typescript
import { PaymentData } from './api';

const instance: PaymentData = {
    paymentKey,
    orderId,
    status,
    method,
    totalAmount,
    balanceAmount,
    approvedAt,
    secret,
    cancels,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
