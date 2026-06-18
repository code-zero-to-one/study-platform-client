# MyQnaManagementApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getMyQnaStats**](#getmyqnastats) | **GET** /api/v6/mypage/class/my-qna-stats | 내 질문 통계|
|[**getMyQnas**](#getmyqnas) | **GET** /api/v6/mypage/class/my-qnas | 내 질문 관리형 목록|

# **getMyQnaStats**
> MyQnaStatsResponse getMyQnaStats()

FRD B-12.  `S-마이클래스-질문답변`용 내 질문 수/반응 합계 카드 응답입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v1.0/S-마이클래스-질문답변.png` - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v1.0/S-%EB%A7%88%EC%9D%B4%ED%81%B4%EB%9E%98%EC%8A%A4-%EC%A7%88%EB%AC%B8%EB%8B%B5%EB%B3%80.png`  <img src=\"/api-docs/frd-screenmap/v1.0/S-%EB%A7%88%EC%9D%B4%ED%81%B4%EB%9E%98%EC%8A%A4-%EC%A7%88%EB%AC%B8%EB%8B%B5%EB%B3%80.png\" alt=\"S-마이클래스-질문답변\" width=\"720\" /> 

### Example

```typescript
import {
    MyQnaManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MyQnaManagementApi(configuration);

const { status, data } = await apiInstance.getMyQnaStats();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**MyQnaStatsResponse**

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

# **getMyQnas**
> MyQnaManagementResponse getMyQnas()

FRD B-11.  `S-마이클래스-질문답변`용 내 질문 목록/답변 상태 응답입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v1.0/S-마이클래스-질문답변.png` - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v1.0/S-%EB%A7%88%EC%9D%B4%ED%81%B4%EB%9E%98%EC%8A%A4-%EC%A7%88%EB%AC%B8%EB%8B%B5%EB%B3%80.png`  <img src=\"/api-docs/frd-screenmap/v1.0/S-%EB%A7%88%EC%9D%B4%ED%81%B4%EB%9E%98%EC%8A%A4-%EC%A7%88%EB%AC%B8%EB%8B%B5%EB%B3%80.png\" alt=\"S-마이클래스-질문답변\" width=\"720\" /> 

### Example

```typescript
import {
    MyQnaManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MyQnaManagementApi(configuration);

let answerStatus: string; // (optional) (default to undefined)
let lessonId: number; // (optional) (default to undefined)
let sort: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getMyQnas(
    answerStatus,
    lessonId,
    sort
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **answerStatus** | [**string**] |  | (optional) defaults to undefined|
| **lessonId** | [**number**] |  | (optional) defaults to undefined|
| **sort** | [**string**] |  | (optional) defaults to undefined|


### Return type

**MyQnaManagementResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**400** | 허용되지 않은 질문 필터 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

