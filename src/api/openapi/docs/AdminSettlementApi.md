# AdminSettlementApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**completeSettlement**](#completesettlement) | **POST** /api/v1/admin/settlements/{settlementId}/complete | |
|[**createSettlement**](#createsettlement) | **POST** /api/v1/admin/settlements | |
|[**getSettlementsForAdmin**](#getsettlementsforadmin) | **GET** /api/v1/admin/settlements | |

# **completeSettlement**
> BaseResponseStudySettlementDetailResponse completeSettlement()


### Example

```typescript
import {
    AdminSettlementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminSettlementApi(configuration);

let settlementId: number; // (default to undefined)

const { status, data } = await apiInstance.completeSettlement(
    settlementId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **settlementId** | [**number**] |  | defaults to undefined|


### Return type

**BaseResponseStudySettlementDetailResponse**

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

# **createSettlement**
> BaseResponseStudySettlementDetailResponse createSettlement(studySettlementCreateRequest)


### Example

```typescript
import {
    AdminSettlementApi,
    Configuration,
    StudySettlementCreateRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminSettlementApi(configuration);

let studySettlementCreateRequest: StudySettlementCreateRequest; //

const { status, data } = await apiInstance.createSettlement(
    studySettlementCreateRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **studySettlementCreateRequest** | **StudySettlementCreateRequest**|  | |


### Return type

**BaseResponseStudySettlementDetailResponse**

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

# **getSettlementsForAdmin**
> BaseResponsePageResponseDtoStudySettlementSummaryResponse getSettlementsForAdmin()


### Example

```typescript
import {
    AdminSettlementApi,
    Configuration,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminSettlementApi(configuration);

let pageable: Pageable; // (default to undefined)
let status: 'PENDING' | 'APPROVED' | 'COMPLETED'; // (optional) (default to undefined)

const { status, data } = await apiInstance.getSettlementsForAdmin(
    pageable,
    status
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **pageable** | **Pageable** |  | defaults to undefined|
| **status** | [**&#39;PENDING&#39; | &#39;APPROVED&#39; | &#39;COMPLETED&#39;**]**Array<&#39;PENDING&#39; &#124; &#39;APPROVED&#39; &#124; &#39;COMPLETED&#39;>** |  | (optional) defaults to undefined|


### Return type

**BaseResponsePageResponseDtoStudySettlementSummaryResponse**

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

