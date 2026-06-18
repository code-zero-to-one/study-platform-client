# MyBuilderFeedManagementApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getMyBuilderFeeds**](#getmybuilderfeeds) | **GET** /api/v6/mypage/class/my-builder-feeds | 내가 작성한 빌더피드 관리형 목록|

# **getMyBuilderFeeds**
> MyBuilderFeedManagementResponse getMyBuilderFeeds()

FRD B-09.  `S-마이클래스-내가-작성한-빌더피드`용 관리형 목록/필터 응답입니다. persisted draft 도입 이후 `myBuilderFeeds[].status`로 게시 완료/임시저장 섹션을 분리합니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v1.0/S-마이클래스-내가-작성한-빌더피드.png` - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v1.0/S-%EB%A7%88%EC%9D%B4%ED%81%B4%EB%9E%98%EC%8A%A4-%EB%82%B4%EA%B0%80-%EC%9E%91%EC%84%B1%ED%95%9C-%EB%B9%8C%EB%8D%94%ED%94%BC%EB%93%9C.png`  <img src=\"/api-docs/frd-screenmap/v1.0/S-%EB%A7%88%EC%9D%B4%ED%81%B4%EB%9E%98%EC%8A%A4-%EB%82%B4%EA%B0%80-%EC%9E%91%EC%84%B1%ED%95%9C-%EB%B9%8C%EB%8D%94%ED%94%BC%EB%93%9C.png\" alt=\"S-마이클래스-내가-작성한-빌더피드\" width=\"720\" /> 

### Example

```typescript
import {
    MyBuilderFeedManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MyBuilderFeedManagementApi(configuration);

let courseId: number; // (optional) (default to undefined)
let lessonId: number; // (optional) (default to undefined)
let status: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getMyBuilderFeeds(
    courseId,
    lessonId,
    status
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **courseId** | [**number**] |  | (optional) defaults to undefined|
| **lessonId** | [**number**] |  | (optional) defaults to undefined|
| **status** | [**string**] |  | (optional) defaults to undefined|


### Return type

**MyBuilderFeedManagementResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**400** | 허용되지 않은 피드 status 필터 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

