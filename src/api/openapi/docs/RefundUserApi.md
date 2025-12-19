# RefundUserApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**cancelRefundRequest**](#cancelrefundrequest) | **POST** /api/v1/refunds/{refundId}/cancel | |
|[**getMyRefunds**](#getmyrefunds) | **GET** /api/v1/mypage/refunds | |
|[**requestRefund**](#requestrefund) | **POST** /api/v1/payments/{paymentId}/refunds | |

# **cancelRefundRequest**
> BaseResponseVoid cancelRefundRequest()


### Example

```typescript
import {
    RefundUserApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RefundUserApi(configuration);

let refundId: number; // (default to undefined)

const { status, data } = await apiInstance.cancelRefundRequest(
    refundId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **refundId** | [**number**] |  | defaults to undefined|


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

# **getMyRefunds**
> BaseResponsePageResponseDtoStudyRefundSummaryResponse getMyRefunds()


### Example

```typescript
import {
    RefundUserApi,
    Configuration,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new RefundUserApi(configuration);

let pageable: Pageable; // (default to undefined)

const { status, data } = await apiInstance.getMyRefunds(
    pageable
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **pageable** | **Pageable** |  | defaults to undefined|


### Return type

**BaseResponsePageResponseDtoStudyRefundSummaryResponse**

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

# **requestRefund**
> BaseResponseStudyRefundDetailResponse requestRefund(studyRefundCreateRequest)


### Example

```typescript
import {
    RefundUserApi,
    Configuration,
    StudyRefundCreateRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new RefundUserApi(configuration);

let paymentId: number; // (default to undefined)
let studyRefundCreateRequest: StudyRefundCreateRequest; //

const { status, data } = await apiInstance.requestRefund(
    paymentId,
    studyRefundCreateRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **studyRefundCreateRequest** | **StudyRefundCreateRequest**|  | |
| **paymentId** | [**number**] |  | defaults to undefined|


### Return type

**BaseResponseStudyRefundDetailResponse**

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

