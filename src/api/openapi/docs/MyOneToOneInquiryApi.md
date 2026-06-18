# MyOneToOneInquiryApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createOneToOneInquiry**](#createonetooneinquiry) | **POST** /api/v6/mypage/one-to-one-inquiries | 마이페이지 1:1 문의 등록|
|[**getMyOneToOneInquiries**](#getmyonetooneinquiries) | **GET** /api/v6/mypage/one-to-one-inquiries | 마이페이지 1:1 문의 목록 조회|
|[**getMyOneToOneInquiryDetail**](#getmyonetooneinquirydetail) | **GET** /api/v6/mypage/one-to-one-inquiries/{oneToOneInquiryId} | 마이페이지 1:1 문의 상세 조회|
|[**saveDraft**](#savedraft) | **PATCH** /api/v6/mypage/one-to-one-inquiries/{oneToOneInquiryId}/draft | 마이페이지 1:1 문의 draft 저장|

# **createOneToOneInquiry**
> MyOneToOneInquiryCreateResponse createOneToOneInquiry(myOneToOneInquiryCreateRequest)

FRD B-18.  `S-마이페이지일대일문의작성`의 카테고리/본문/첨부/알림옵션으로 1:1 문의를 등록합니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v1.0/S-마이페이지일대일문의작성.png` - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v1.0/S-%EB%A7%88%EC%9D%B4%ED%8E%98%EC%9D%B4%EC%A7%80%EC%9D%BC%EB%8C%80%EC%9D%BC%EB%AC%B8%EC%9D%98%EC%9E%91%EC%84%B1.png`  <img src=\"/api-docs/frd-screenmap/v1.0/S-%EB%A7%88%EC%9D%B4%ED%8E%98%EC%9D%B4%EC%A7%80%EC%9D%BC%EB%8C%80%EC%9D%BC%EB%AC%B8%EC%9D%98%EC%9E%91%EC%84%B1.png\" alt=\"S-마이페이지일대일문의작성\" width=\"720\" /> 

### Example

```typescript
import {
    MyOneToOneInquiryApi,
    Configuration,
    MyOneToOneInquiryCreateRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new MyOneToOneInquiryApi(configuration);

let myOneToOneInquiryCreateRequest: MyOneToOneInquiryCreateRequest; //

const { status, data } = await apiInstance.createOneToOneInquiry(
    myOneToOneInquiryCreateRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **myOneToOneInquiryCreateRequest** | **MyOneToOneInquiryCreateRequest**|  | |


### Return type

**MyOneToOneInquiryCreateResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 등록 성공 |  -  |
|**400** | 본문/첨부 검증 오류 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMyOneToOneInquiries**
> MyOneToOneInquiryListResponse getMyOneToOneInquiries()

FRD B-17.  최근 3개월 `1:1 문의` 목록과 답변 상태를 조회합니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v1.0/S-마이페이지-일대일문의하기.png` - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v1.0/S-%EB%A7%88%EC%9D%B4%ED%8E%98%EC%9D%B4%EC%A7%80-%EC%9D%BC%EB%8C%80%EC%9D%BC%EB%AC%B8%EC%9D%98%ED%95%98%EA%B8%B0.png`  <img src=\"/api-docs/frd-screenmap/v1.0/S-%EB%A7%88%EC%9D%B4%ED%8E%98%EC%9D%B4%EC%A7%80-%EC%9D%BC%EB%8C%80%EC%9D%BC%EB%AC%B8%EC%9D%98%ED%95%98%EA%B8%B0.png\" alt=\"S-마이페이지-일대일문의하기\" width=\"720\" /> 

### Example

```typescript
import {
    MyOneToOneInquiryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MyOneToOneInquiryApi(configuration);

let months: number; // (optional) (default to undefined)
let status: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getMyOneToOneInquiries(
    months,
    status
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **months** | [**number**] |  | (optional) defaults to undefined|
| **status** | [**string**] |  | (optional) defaults to undefined|


### Return type

**MyOneToOneInquiryListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**400** | 필터 오류 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMyOneToOneInquiryDetail**
> MyOneToOneInquiryDetailResponse getMyOneToOneInquiryDetail()

FRD B-20.  `S-마이페이지-일대일문의하기답변완료`에서 문의 본문, 첨부 URL, 운영 답변 목록을 조회합니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v1.0/S-마이페이지-일대일문의하기답변완료.png` - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v1.0/S-%EB%A7%88%EC%9D%B4%ED%8E%98%EC%9D%B4%EC%A7%80-%EC%9D%BC%EB%8C%80%EC%9D%BC%EB%AC%B8%EC%9D%98%ED%95%98%EA%B8%B0%EB%8B%B5%EB%B3%80%EC%99%84%EB%A3%8C.png`                  <img src=\"/api-docs/frd-screenmap/v1.0/S-%EB%A7%88%EC%9D%B4%ED%8E%98%EC%9D%B4%EC%A7%80-%EC%9D%BC%EB%8C%80%EC%9D%BC%EB%AC%B8%EC%9D%98%ED%95%98%EA%B8%B0%EB%8B%B5%EB%B3%80%EC%99%84%EB%A3%8C.png\" alt=\"S-마이페이지-일대일문의하기답변완료\" width=\"720\" /> 

### Example

```typescript
import {
    MyOneToOneInquiryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MyOneToOneInquiryApi(configuration);

let oneToOneInquiryId: number; // (default to undefined)

const { status, data } = await apiInstance.getMyOneToOneInquiryDetail(
    oneToOneInquiryId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **oneToOneInquiryId** | [**number**] |  | defaults to undefined|


### Return type

**MyOneToOneInquiryDetailResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |
|**404** | 문의 없음 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **saveDraft**
> MyOneToOneInquiryDraftResponse saveDraft(myOneToOneInquiryDraftRequest)

FRD B-19.  `S-마이페이지일대일문의작성`의 inquiryCategory/inquiryContent 일부만으로 draft를 저장합니다. 신규 draft 생성은 path id 0으로 요청할 수 있습니다.  - Screenmap Path: `src/main/resources/static/api-docs/frd-screenmap/v1.0/S-마이페이지일대일문의작성.png` - Screenmap Raw URL: `https://raw.githubusercontent.com/code-zero-to-one/study-platform-mvp/dev/src/main/resources/static/api-docs/frd-screenmap/v1.0/S-%EB%A7%88%EC%9D%B4%ED%8E%98%EC%9D%B4%EC%A7%80%EC%9D%BC%EB%8C%80%EC%9D%BC%EB%AC%B8%EC%9D%98%EC%9E%91%EC%84%B1.png`  <img src=\"/api-docs/frd-screenmap/v1.0/S-%EB%A7%88%EC%9D%B4%ED%8E%98%EC%9D%B4%EC%A7%80%EC%9D%BC%EB%8C%80%EC%9D%BC%EB%AC%B8%EC%9D%98%EC%9E%91%EC%84%B1.png\" alt=\"S-마이페이지일대일문의작성\" width=\"720\" /> 

### Example

```typescript
import {
    MyOneToOneInquiryApi,
    Configuration,
    MyOneToOneInquiryDraftRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new MyOneToOneInquiryApi(configuration);

let oneToOneInquiryId: number; // (default to undefined)
let myOneToOneInquiryDraftRequest: MyOneToOneInquiryDraftRequest; //

const { status, data } = await apiInstance.saveDraft(
    oneToOneInquiryId,
    myOneToOneInquiryDraftRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **myOneToOneInquiryDraftRequest** | **MyOneToOneInquiryDraftRequest**|  | |
| **oneToOneInquiryId** | [**number**] |  | defaults to undefined|


### Return type

**MyOneToOneInquiryDraftResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 저장 성공 |  -  |
|**400** | 첨부 제한 오류 |  -  |
|**409** | draft 상태 전이 오류 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

