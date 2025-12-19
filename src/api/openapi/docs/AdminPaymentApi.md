# AdminPaymentApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**forceCancelPayment**](#forcecancelpayment) | **POST** /api/v1/admin/payments/{paymentId}/cancel | |
|[**getPaymentsForAdmin**](#getpaymentsforadmin) | **GET** /api/v1/admin/payments | |

# **forceCancelPayment**
> BaseResponseVoid forceCancelPayment()


### Example

```typescript
import {
    AdminPaymentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminPaymentApi(configuration);

let paymentId: number; // (default to undefined)
let reason: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.forceCancelPayment(
    paymentId,
    reason
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **paymentId** | [**number**] |  | defaults to undefined|
| **reason** | [**string**] |  | (optional) defaults to undefined|


### Return type

**BaseResponseVoid**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getPaymentsForAdmin**
> BaseResponsePageResponseDtoStudyPaymentSummaryResponse getPaymentsForAdmin()


### Example

```typescript
import {
    AdminPaymentApi,
    Configuration,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminPaymentApi(configuration);

let pageable: Pageable; // (default to undefined)
let memberId: number; // (optional) (default to undefined)
let groupStudyId: number; // (optional) (default to undefined)
let status: 'REQUESTED' | 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELED'; // (optional) (default to undefined)

const { status, data } = await apiInstance.getPaymentsForAdmin(
    pageable,
    memberId,
    groupStudyId,
    status
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **pageable** | **Pageable** |  | defaults to undefined|
| **memberId** | [**number**] |  | (optional) defaults to undefined|
| **groupStudyId** | [**number**] |  | (optional) defaults to undefined|
| **status** | [**&#39;REQUESTED&#39; | &#39;PENDING&#39; | &#39;SUCCESS&#39; | &#39;FAILED&#39; | &#39;CANCELED&#39;**]**Array<&#39;REQUESTED&#39; &#124; &#39;PENDING&#39; &#124; &#39;SUCCESS&#39; &#124; &#39;FAILED&#39; &#124; &#39;CANCELED&#39;>** |  | (optional) defaults to undefined|


### Return type

**BaseResponsePageResponseDtoStudyPaymentSummaryResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

