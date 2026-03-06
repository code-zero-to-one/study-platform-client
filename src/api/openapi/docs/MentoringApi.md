# MentoringApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**generateIntroImageUploadUrl**](#generateintroimageuploadurl) | **POST** /api/v1/mentors/me/intro-images/upload-url | 멘토 소개 이미지 업로드 URL 발급|
|[**getMentorDetail**](#getmentordetail) | **GET** /api/v1/mentors/{mentorId} | 멘토 상세 조회|
|[**getMentorEntryOnboardingStatus**](#getmentorentryonboardingstatus) | **GET** /api/v1/mentors/onboarding/entry | 멘토 등록 엔트리 온보딩 상태 조회|
|[**getMentorList**](#getmentorlist) | **GET** /api/v1/mentors | 멘토 목록 조회|
|[**getMentorRegistrationOptions**](#getmentorregistrationoptions) | **GET** /api/v1/mentors/registration/options | 멘토 등록 옵션 조회|
|[**getMyMentorSettings**](#getmymentorsettings) | **GET** /api/v1/mentors/me | 내 멘토 설정 조회|
|[**markMentorEntryOnboardingSeen**](#markmentorentryonboardingseen) | **POST** /api/v1/mentors/onboarding/entry/seen | 멘토 등록 엔트리 온보딩 확인 처리|
|[**upsertMyMentorSettings**](#upsertmymentorsettings) | **PUT** /api/v1/mentors/me | 내 멘토 설정 저장|

# **generateIntroImageUploadUrl**
> GetMentorIntroImageUploadUrlResponseSchema generateIntroImageUploadUrl()

멘토 소개 마크다운에 삽입할 이미지 업로드 URL을 발급합니다.

### Example

```typescript
import {
    MentoringApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MentoringApi(configuration);

let extension: 'DEFAULT' | 'JPG' | 'PNG' | 'GIF' | 'WEBP' | 'SVG' | 'JPEG'; // (default to undefined)

const { status, data } = await apiInstance.generateIntroImageUploadUrl(
    extension
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **extension** | [**&#39;DEFAULT&#39; | &#39;JPG&#39; | &#39;PNG&#39; | &#39;GIF&#39; | &#39;WEBP&#39; | &#39;SVG&#39; | &#39;JPEG&#39;**]**Array<&#39;DEFAULT&#39; &#124; &#39;JPG&#39; &#124; &#39;PNG&#39; &#124; &#39;GIF&#39; &#124; &#39;WEBP&#39; &#124; &#39;SVG&#39; &#124; &#39;JPEG&#39;>** |  | defaults to undefined|


### Return type

**GetMentorIntroImageUploadUrlResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 발급 성공 |  -  |
|**400** | 유효성 오류 |  -  |
|**401** | 인증 실패 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMentorDetail**
> GetMentorDetailResponseSchema getMentorDetail()

멘토 상세 정보를 조회합니다.

### Example

```typescript
import {
    MentoringApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MentoringApi(configuration);

let mentorId: number; // (default to undefined)

const { status, data } = await apiInstance.getMentorDetail(
    mentorId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **mentorId** | [**number**] |  | defaults to undefined|


### Return type

**GetMentorDetailResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**404** | 멘토를 찾을 수 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMentorEntryOnboardingStatus**
> GetMentorEntryOnboardingStatusResponseSchema getMentorEntryOnboardingStatus()

로그인한 사용자의 멘토 등록 진입 온보딩 노출 여부를 조회합니다.

### Example

```typescript
import {
    MentoringApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MentoringApi(configuration);

const { status, data } = await apiInstance.getMentorEntryOnboardingStatus();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**GetMentorEntryOnboardingStatusResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**401** | 인증 실패 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMentorList**
> GetMentorListResponseSchema getMentorList()

멘토 목록을 조회합니다. keyword/sortType/careerCodes/page/size를 지원합니다.

### Example

```typescript
import {
    MentoringApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MentoringApi(configuration);

let keyword: string; // (optional) (default to undefined)
let sortType: string; // (optional) (default to 'default')
let careerCodes: Array<string>; // (optional) (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 20)

const { status, data } = await apiInstance.getMentorList(
    keyword,
    sortType,
    careerCodes,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **keyword** | [**string**] |  | (optional) defaults to undefined|
| **sortType** | [**string**] |  | (optional) defaults to 'default'|
| **careerCodes** | **Array&lt;string&gt;** |  | (optional) defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 20|


### Return type

**GetMentorListResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**400** | 잘못된 요청 파라미터 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMentorRegistrationOptions**
> GetMentorRegistrationOptionsResponseSchema getMentorRegistrationOptions()

멘토 등록 화면에서 사용하는 직군/직무/경력/핵심키워드 옵션을 조회합니다.

### Example

```typescript
import {
    MentoringApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MentoringApi(configuration);

const { status, data } = await apiInstance.getMentorRegistrationOptions();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**GetMentorRegistrationOptionsResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMyMentorSettings**
> GetMyMentorResponseSchema getMyMentorSettings()

로그인한 사용자의 멘토 설정을 조회합니다. 미등록 사용자는 registered=false로 반환됩니다.

### Example

```typescript
import {
    MentoringApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MentoringApi(configuration);

const { status, data } = await apiInstance.getMyMentorSettings();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**GetMyMentorResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**401** | 인증 실패 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **markMentorEntryOnboardingSeen**
> MarkMentorEntryOnboardingSeenResponseSchema markMentorEntryOnboardingSeen()

로그인한 사용자의 멘토 등록 진입 온보딩을 확인 처리합니다.

### Example

```typescript
import {
    MentoringApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MentoringApi(configuration);

const { status, data } = await apiInstance.markMentorEntryOnboardingSeen();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**MarkMentorEntryOnboardingSeenResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 처리 성공 |  -  |
|**401** | 인증 실패 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **upsertMyMentorSettings**
> UpsertMyMentorResponseSchema upsertMyMentorSettings(mentorSettingsUpsertRequest)

로그인한 사용자의 멘토 설정을 신규/수정 저장합니다.

### Example

```typescript
import {
    MentoringApi,
    Configuration,
    MentorSettingsUpsertRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new MentoringApi(configuration);

let mentorSettingsUpsertRequest: MentorSettingsUpsertRequest; //

const { status, data } = await apiInstance.upsertMyMentorSettings(
    mentorSettingsUpsertRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **mentorSettingsUpsertRequest** | **MentorSettingsUpsertRequest**|  | |


### Return type

**UpsertMyMentorResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 저장 성공 |  -  |
|**400** | 유효성 오류 |  -  |
|**401** | 인증 실패 |  -  |
|**403** | 권한 없음 |  -  |
|**422** | 도메인 검증 실패 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

