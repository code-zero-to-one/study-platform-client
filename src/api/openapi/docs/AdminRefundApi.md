# AdminRefundApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**approveRefund**](#approverefund) | **POST** /api/v1/admin/refunds/{refundId}/approve | |
|[**completeRefund**](#completerefund) | **POST** /api/v1/admin/refunds/{refundId}/complete | |
|[**getRefundsForAdmin**](#getrefundsforadmin) | **GET** /api/v1/admin/refunds | |

# **approveRefund**
> BaseResponseStudyRefundDetailResponse approveRefund(studyRefundApproveRequest)


### Example

```typescript
import {
    AdminRefundApi,
    Configuration,
    StudyRefundApproveRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminRefundApi(configuration);

let refundId: number; // (default to undefined)
let studyRefundApproveRequest: StudyRefundApproveRequest; //

const { status, data } = await apiInstance.approveRefund(
    refundId,
    studyRefundApproveRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **studyRefundApproveRequest** | **StudyRefundApproveRequest**|  | |
| **refundId** | [**number**] |  | defaults to undefined|


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

# **completeRefund**
> BaseResponseStudyRefundDetailResponse completeRefund()


### Example

```typescript
import {
    AdminRefundApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminRefundApi(configuration);

let refundId: number; // (default to undefined)

const { status, data } = await apiInstance.completeRefund(
    refundId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **refundId** | [**number**] |  | defaults to undefined|


### Return type

**BaseResponseStudyRefundDetailResponse**

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

# **getRefundsForAdmin**
> BaseResponsePageResponseDtoStudyRefundSummaryResponse getRefundsForAdmin()


### Example

```typescript
import {
    AdminRefundApi,
    Configuration,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminRefundApi(configuration);

let pageable: Pageable; // (default to undefined)
let memberId: number; // (optional) (default to undefined)
let status: 'REQUESTED' | 'APPROVED' | 'COMPLETED' | 'REJECTED' | 'CANCELED'; // (optional) (default to undefined)

const { status, data } = await apiInstance.getRefundsForAdmin(
    pageable,
    memberId,
    status
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **pageable** | **Pageable** |  | defaults to undefined|
| **memberId** | [**number**] |  | (optional) defaults to undefined|
| **status** | [**&#39;REQUESTED&#39; | &#39;APPROVED&#39; | &#39;COMPLETED&#39; | &#39;REJECTED&#39; | &#39;CANCELED&#39;**]**Array<&#39;REQUESTED&#39; &#124; &#39;APPROVED&#39; &#124; &#39;COMPLETED&#39; &#124; &#39;REJECTED&#39; &#124; &#39;CANCELED&#39;>** |  | (optional) defaults to undefined|


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

