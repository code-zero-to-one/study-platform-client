# PaymentUserApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**cancelPayment**](#cancelpayment) | **POST** /api/v1/payments/{paymentId}/cancel | |
|[**confirmTossPayment**](#confirmtosspayment) | **POST** /api/v1/payments/toss/confirm | |
|[**getMyPaymentDetail**](#getmypaymentdetail) | **GET** /api/v1/mypage/payments/{paymentId} | |
|[**getMyPayments**](#getmypayments) | **GET** /api/v1/mypage/payments | |
|[**preparePayment**](#preparepayment) | **POST** /api/v1/group-studies/{groupStudyId}/payments/prepare | |

# **cancelPayment**
> BaseResponseVoid cancelPayment()


### Example

```typescript
import {
    PaymentUserApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentUserApi(configuration);

let paymentId: number; // (default to undefined)

const { status, data } = await apiInstance.cancelPayment(
    paymentId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **paymentId** | [**number**] |  | defaults to undefined|


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

# **confirmTossPayment**
> BaseResponseStudyPaymentDetailResponse confirmTossPayment(tossPaymentConfirmRequest)


### Example

```typescript
import {
    PaymentUserApi,
    Configuration,
    TossPaymentConfirmRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentUserApi(configuration);

let tossPaymentConfirmRequest: TossPaymentConfirmRequest; //

const { status, data } = await apiInstance.confirmTossPayment(
    tossPaymentConfirmRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **tossPaymentConfirmRequest** | **TossPaymentConfirmRequest**|  | |


### Return type

**BaseResponseStudyPaymentDetailResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMyPaymentDetail**
> BaseResponseStudyPaymentDetailResponse getMyPaymentDetail()


### Example

```typescript
import {
    PaymentUserApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentUserApi(configuration);

let paymentId: number; // (default to undefined)

const { status, data } = await apiInstance.getMyPaymentDetail(
    paymentId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **paymentId** | [**number**] |  | defaults to undefined|


### Return type

**BaseResponseStudyPaymentDetailResponse**

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

# **getMyPayments**
> BaseResponsePageResponseDtoStudyPaymentSummaryResponse getMyPayments()


### Example

```typescript
import {
    PaymentUserApi,
    Configuration,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentUserApi(configuration);

let pageable: Pageable; // (default to undefined)

const { status, data } = await apiInstance.getMyPayments(
    pageable
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **pageable** | **Pageable** |  | defaults to undefined|


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

# **preparePayment**
> BaseResponseStudyPaymentPrepareResponse preparePayment(studyPaymentPrepareRequest)


### Example

```typescript
import {
    PaymentUserApi,
    Configuration,
    StudyPaymentPrepareRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentUserApi(configuration);

let groupStudyId: number; // (default to undefined)
let studyPaymentPrepareRequest: StudyPaymentPrepareRequest; //

const { status, data } = await apiInstance.preparePayment(
    groupStudyId,
    studyPaymentPrepareRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **studyPaymentPrepareRequest** | **StudyPaymentPrepareRequest**|  | |
| **groupStudyId** | [**number**] |  | defaults to undefined|


### Return type

**BaseResponseStudyPaymentPrepareResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

