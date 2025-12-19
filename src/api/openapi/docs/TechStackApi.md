# TechStackApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getParentTechStacks**](#getparenttechstacks) | **GET** /api/v1/tech-stacks/parents | 상위 기술스택 목록 조회|
|[**getTechStacks**](#gettechstacks) | **GET** /api/v1/tech-stacks | 기술스택 목록 조회|
|[**searchTechStacks**](#searchtechstacks) | **GET** /api/v1/tech-stacks/search | [미사용] 기술스택 검색|

# **getParentTechStacks**
> getParentTechStacks()

상위 기술스택 목록을 조회합니다.

### Example

```typescript
import {
    TechStackApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TechStackApi(configuration);

const { status, data } = await apiInstance.getParentTechStacks();
```

### Parameters
This endpoint does not have any parameters.


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getTechStacks**
> getTechStacks()

선택 가능한 기술스택 목록 조회

### Example

```typescript
import {
    TechStackApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TechStackApi(configuration);

const { status, data } = await apiInstance.getTechStacks();
```

### Parameters
This endpoint does not have any parameters.


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **searchTechStacks**
> searchTechStacks()

키워드로 기술스택을 검색합니다. (자동완성 용도) -> 프론트에서 전체 리스트 받아서(기술스택 목록 조회) 처리하는 쪽으로 해주세요

### Example

```typescript
import {
    TechStackApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TechStackApi(configuration);

let keyword: string; // (default to undefined)

const { status, data } = await apiInstance.searchTechStacks(
    keyword
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **keyword** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 검색 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

