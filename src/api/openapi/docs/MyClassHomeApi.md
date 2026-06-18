# MyClassHomeApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getMyClassHome**](#getmyclasshome) | **GET** /api/v6/mypage/class/home | 마이클래스 홈 집계 조회|

# **getMyClassHome**
> MyClassHomeResponseSchema getMyClassHome()

FRD B-01.  `S-마이클래스`를 그리기 위한 홈 집계 응답입니다. 알림 시간, 참여중인 클래스, 완주한 클래스를 한 번에 반환합니다. timezone query는 화면의 일자/시간 표시에 사용할 기준 timezone이며, 기본값은 `Asia/Seoul`입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v1.0/S-마이클래스.png` - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v1.0/S-%EB%A7%88%EC%9D%B4%ED%81%B4%EB%9E%98%EC%8A%A4.png`  <img src=\"/api-docs/frd-screenmap/v1.0/S-%EB%A7%88%EC%9D%B4%ED%81%B4%EB%9E%98%EC%8A%A4.png\" alt=\"S-마이클래스\" width=\"720\" /> 

### Example

```typescript
import {
    MyClassHomeApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MyClassHomeApi(configuration);

let timezone: string; // (optional) (default to 'Asia/Seoul')

const { status, data } = await apiInstance.getMyClassHome(
    timezone
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **timezone** | [**string**] |  | (optional) defaults to 'Asia/Seoul'|


### Return type

**MyClassHomeResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**400** | timezone 형식 오류 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

