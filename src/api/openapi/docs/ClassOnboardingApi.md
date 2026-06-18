# ClassOnboardingApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**complete**](#complete) | **POST** /api/v6/class-onboarding/me/complete | 클래스 온보딩 완료|
|[**getMyOnboardingStatus**](#getmyonboardingstatus) | **GET** /api/v6/class-onboarding/me | 클래스 온보딩 상태 조회|
|[**saveStep1**](#savestep1) | **POST** /api/v6/class-onboarding/me/step-1 | 클래스 온보딩 step1 저장|
|[**saveStep2**](#savestep2) | **POST** /api/v6/class-onboarding/me/step-2 | 클래스 온보딩 step2 저장|
|[**saveStep3**](#savestep3) | **POST** /api/v6/class-onboarding/me/step-3 | 클래스 온보딩 step3 저장|

# **complete**
> ClassOnboardingCompleteResponse complete(classOnboardingCompleteRequest)

FRD A-05.  `S-온보딩4-완료`의 완료 CTA를 처리하고 completed 상태를 확정합니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v1.0/S-온보딩4-완료.png` - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v1.0/S-%EC%98%A8%EB%B3%B4%EB%94%A94-%EC%99%84%EB%A3%8C.png`  <img src=\"/api-docs/frd-screenmap/v1.0/S-%EC%98%A8%EB%B3%B4%EB%94%A94-%EC%99%84%EB%A3%8C.png\" alt=\"S-온보딩4-완료\" width=\"720\" /> 

### Example

```typescript
import {
    ClassOnboardingApi,
    Configuration,
    ClassOnboardingCompleteRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new ClassOnboardingApi(configuration);

let classOnboardingCompleteRequest: ClassOnboardingCompleteRequest; //

const { status, data } = await apiInstance.complete(
    classOnboardingCompleteRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **classOnboardingCompleteRequest** | **ClassOnboardingCompleteRequest**|  | |


### Return type

**ClassOnboardingCompleteResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 완료 성공 |  -  |
|**400** | step 순서 오류 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMyOnboardingStatus**
> ClassOnboardingStatusResponse getMyOnboardingStatus()

FRD A-01.  `S-온보딩1-닉네임` 재진입 시 step/기입값을 복원하는 응답입니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v1.0/S-온보딩1-닉네임.png` - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v1.0/S-%EC%98%A8%EB%B3%B4%EB%94%A91-%EB%8B%89%EB%84%A4%EC%9E%84.png`  <img src=\"/api-docs/frd-screenmap/v1.0/S-%EC%98%A8%EB%B3%B4%EB%94%A91-%EB%8B%89%EB%84%A4%EC%9E%84.png\" alt=\"S-온보딩1-닉네임\" width=\"720\" /> 

### Example

```typescript
import {
    ClassOnboardingApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ClassOnboardingApi(configuration);

const { status, data } = await apiInstance.getMyOnboardingStatus();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**ClassOnboardingStatusResponse**

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

# **saveStep1**
> ClassOnboardingStepSaveResponse saveStep1(classOnboardingStep1Request)

FRD A-02.  `S-온보딩1-닉네임`의 닉네임/동의/경험 입력을 저장합니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v1.0/S-온보딩1-닉네임.png` - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v1.0/S-%EC%98%A8%EB%B3%B4%EB%94%A91-%EB%8B%89%EB%84%A4%EC%9E%84.png`  <img src=\"/api-docs/frd-screenmap/v1.0/S-%EC%98%A8%EB%B3%B4%EB%94%A91-%EB%8B%89%EB%84%A4%EC%9E%84.png\" alt=\"S-온보딩1-닉네임\" width=\"720\" /> 

### Example

```typescript
import {
    ClassOnboardingApi,
    Configuration,
    ClassOnboardingStep1Request
} from './api';

const configuration = new Configuration();
const apiInstance = new ClassOnboardingApi(configuration);

let classOnboardingStep1Request: ClassOnboardingStep1Request; //

const { status, data } = await apiInstance.saveStep1(
    classOnboardingStep1Request
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **classOnboardingStep1Request** | **ClassOnboardingStep1Request**|  | |


### Return type

**ClassOnboardingStepSaveResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 저장 성공 |  -  |
|**400** | 닉네임/동의 검증 오류 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **saveStep2**
> ClassOnboardingStepSaveResponse saveStep2(classOnboardingStep2Request)

FRD A-03.  `S-온보딩2-직무경력`의 직무/경력/목표 입력을 저장합니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v1.0/S-온보딩2-직무경력.png` - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v1.0/S-%EC%98%A8%EB%B3%B4%EB%94%A92-%EC%A7%81%EB%AC%B4%EA%B2%BD%EB%A0%A5.png`  <img src=\"/api-docs/frd-screenmap/v1.0/S-%EC%98%A8%EB%B3%B4%EB%94%A92-%EC%A7%81%EB%AC%B4%EA%B2%BD%EB%A0%A5.png\" alt=\"S-온보딩2-직무경력\" width=\"720\" /> 

### Example

```typescript
import {
    ClassOnboardingApi,
    Configuration,
    ClassOnboardingStep2Request
} from './api';

const configuration = new Configuration();
const apiInstance = new ClassOnboardingApi(configuration);

let classOnboardingStep2Request: ClassOnboardingStep2Request; //

const { status, data } = await apiInstance.saveStep2(
    classOnboardingStep2Request
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **classOnboardingStep2Request** | **ClassOnboardingStep2Request**|  | |


### Return type

**ClassOnboardingStepSaveResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 저장 성공 |  -  |
|**400** | 직무/경력 검증 오류 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **saveStep3**
> ClassOnboardingStepSaveResponse saveStep3(classOnboardingStep3Request)

FRD A-04.  `S-온보딩3-관심도`의 관심사/기타 상세 입력을 저장합니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v1.0/S-온보딩3-관심도.png` - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v1.0/S-%EC%98%A8%EB%B3%B4%EB%94%A93-%EA%B4%80%EC%8B%AC%EB%8F%84.png`  <img src=\"/api-docs/frd-screenmap/v1.0/S-%EC%98%A8%EB%B3%B4%EB%94%A93-%EA%B4%80%EC%8B%AC%EB%8F%84.png\" alt=\"S-온보딩3-관심도\" width=\"720\" /> 

### Example

```typescript
import {
    ClassOnboardingApi,
    Configuration,
    ClassOnboardingStep3Request
} from './api';

const configuration = new Configuration();
const apiInstance = new ClassOnboardingApi(configuration);

let classOnboardingStep3Request: ClassOnboardingStep3Request; //

const { status, data } = await apiInstance.saveStep3(
    classOnboardingStep3Request
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **classOnboardingStep3Request** | **ClassOnboardingStep3Request**|  | |


### Return type

**ClassOnboardingStepSaveResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 저장 성공 |  -  |
|**400** | 관심사 개수/기타 입력 검증 오류 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

