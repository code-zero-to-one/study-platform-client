# MyClassProfileApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getMyClassProfile**](#getmyclassprofile) | **GET** /api/v6/mypage/class/profile | 마이페이지 프로필 통합 조회|
|[**patchMyClassProfile**](#patchmyclassprofile) | **PATCH** /api/v6/mypage/class/profile | 마이페이지 프로필 필드 저장|

# **getMyClassProfile**
> MyClassProfileResponseSchema getMyClassProfile()

FRD B-04.  `S-클래스빌더프로필` 화면을 위한 profile/info/onboarding/phone 상태 통합 조회입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v1.0/S-클래스빌더프로필.png` - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v1.0/S-%ED%81%B4%EB%9E%98%EC%8A%A4%EB%B9%8C%EB%8D%94%ED%94%84%EB%A1%9C%ED%95%84.png`  <img src=\"/api-docs/frd-screenmap/v1.0/S-%ED%81%B4%EB%9E%98%EC%8A%A4%EB%B9%8C%EB%8D%94%ED%94%84%EB%A1%9C%ED%95%84.png\" alt=\"S-클래스빌더프로필\" width=\"720\" /> 

### Example

```typescript
import {
    MyClassProfileApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MyClassProfileApi(configuration);

const { status, data } = await apiInstance.getMyClassProfile();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**MyClassProfileResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **patchMyClassProfile**
> MyClassProfilePatchResponseSchema patchMyClassProfile(myClassProfilePatchRequest)

FRD B-05.  `S-클래스빌더프로필` 화면의 필드별 저장 버튼을 위한 patch adapter입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v1.0/S-클래스빌더프로필.png` - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v1.0/S-%ED%81%B4%EB%9E%98%EC%8A%A4%EB%B9%8C%EB%8D%94%ED%94%84%EB%A1%9C%ED%95%84.png`  <img src=\"/api-docs/frd-screenmap/v1.0/S-%ED%81%B4%EB%9E%98%EC%8A%A4%EB%B9%8C%EB%8D%94%ED%94%84%EB%A1%9C%ED%95%84.png\" alt=\"S-클래스빌더프로필\" width=\"720\" /> 

### Example

```typescript
import {
    MyClassProfileApi,
    Configuration,
    MyClassProfilePatchRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new MyClassProfileApi(configuration);

let myClassProfilePatchRequest: MyClassProfilePatchRequest; //

const { status, data } = await apiInstance.patchMyClassProfile(
    myClassProfilePatchRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **myClassProfilePatchRequest** | **MyClassProfilePatchRequest**|  | |


### Return type

**MyClassProfilePatchResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 저장 성공 |  -  |
|**400** | 저장할 수 없는 profileField 또는 잘못된 값 |  -  |
|**409** | 닉네임 충돌 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

