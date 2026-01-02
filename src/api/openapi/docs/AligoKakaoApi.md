# AligoKakaoApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getChannels**](#getchannels) | **GET** /api/v1/admin/aligo/kakao/channels | 등록된 Kakao Channel 목록 조회|
|[**getHeartInfo**](#getheartinfo) | **GET** /api/v1/admin/aligo/kakao/heart-info | 발송 가능 잔액 조회|
|[**getHistory**](#gethistory) | **GET** /api/v1/admin/aligo/kakao/history | 알림톡 전송 내역 목록 조회|
|[**getHistoryDetail**](#gethistorydetail) | **GET** /api/v1/admin/aligo/kakao/history/{mid} | 알림톡 전송 상세 결과 조회|
|[**getTemplates**](#gettemplates) | **GET** /api/v1/admin/aligo/kakao/templates | 등록된 알림톡 템플릿 목록 조회|
|[**getTemplatesSyncStatus**](#gettemplatessyncstatus) | **GET** /api/v1/admin/aligo/kakao/templates/sync-status | 템플릿 동기화 상태 확인|
|[**syncTemplates**](#synctemplates) | **PUT** /api/v1/admin/aligo/kakao/templates/sync | 템플릿 동기화 실행|

# **getChannels**
> getChannels()

현재 계정에 등록된 모든 Kakao Channel(카카오톡 채널) 목록을 조회합니다. 각 채널의 상태, 승인 상태, 알림톡 사용 여부 등을 확인할 수 있습니다. 

### Example

```typescript
import {
    AligoKakaoApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AligoKakaoApi(configuration);

const { status, data } = await apiInstance.getChannels();
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
|**200** | Kakao Channel 목록 조회 성공 |  -  |
|**500** | API 호출 실패 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getHeartInfo**
> getHeartInfo()

현재 보유한 SMS, LMS, MMS, 알림톡, 친구톡 등의 발송 가능 건수를 조회합니다. 각 채널별 잔액을 확인하여 발송 가능 여부를 판단할 수 있습니다. 

### Example

```typescript
import {
    AligoKakaoApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AligoKakaoApi(configuration);

const { status, data } = await apiInstance.getHeartInfo();
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
|**200** | 발송 가능 건수 조회 성공 |  -  |
|**500** | API 호출 실패 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getHistory**
> getHistory()

알림톡 발송 이력을 페이지 단위로 조회합니다. - page: 조회할 페이지 번호 (기본값: 1) - limit: 페이지당 조회 건수 (기본값: 50) - startdate: 조회 시작 날짜 (선택, YYYYMMDD 형식) - enddate: 조회 종료 날짜 (선택, YYYYMMDD 형식) 

### Example

```typescript
import {
    AligoKakaoApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AligoKakaoApi(configuration);

let page: number; //페이지 번호 (optional) (default to 1)
let limit: number; //페이지당 조회 건수 (optional) (default to 50)
let startdate: string; //조회 시작 날짜 (YYYYMMDD) (optional) (default to undefined)
let enddate: string; //조회 종료 날짜 (YYYYMMDD) (optional) (default to undefined)

const { status, data } = await apiInstance.getHistory(
    page,
    limit,
    startdate,
    enddate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **page** | [**number**] | 페이지 번호 | (optional) defaults to 1|
| **limit** | [**number**] | 페이지당 조회 건수 | (optional) defaults to 50|
| **startdate** | [**string**] | 조회 시작 날짜 (YYYYMMDD) | (optional) defaults to undefined|
| **enddate** | [**string**] | 조회 종료 날짜 (YYYYMMDD) | (optional) defaults to undefined|


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
|**200** | 전송 내역 조회 성공 |  -  |
|**500** | API 호출 실패 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getHistoryDetail**
> getHistoryDetail()

특정 전송 내역(mid)에 대한 상세 결과를 조회합니다. 각 수신자별 전송 상태, 결과 메시지, 전송 시간 등 상세 정보를 확인할 수 있습니다. 

### Example

```typescript
import {
    AligoKakaoApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AligoKakaoApi(configuration);

let mid: number; //전송 내역 ID (default to undefined)

const { status, data } = await apiInstance.getHistoryDetail(
    mid
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **mid** | [**number**] | 전송 내역 ID | defaults to undefined|


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
|**200** | 전송 상세 결과 조회 성공 |  -  |
|**500** | API 호출 실패 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getTemplates**
> getTemplates()

알리고 Kakao API에서 등록된 모든 알림톡 템플릿 목록을 조회합니다. 관리자용 API로 현재 Kakao Channel에 등록되어 있는 템플릿 정보를 실시간으로 확인할 수 있습니다. 

### Example

```typescript
import {
    AligoKakaoApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AligoKakaoApi(configuration);

const { status, data } = await apiInstance.getTemplates();
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
|**200** | 템플릿 목록 조회 성공 |  -  |
|**500** | API 호출 실패 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getTemplatesSyncStatus**
> getTemplatesSyncStatus()

서버에 캐시된 템플릿과 Kakao API의 최신 템플릿 상태를 비교하여 동기화 상태를 확인합니다. - 동기화됨: 캐시와 API의 템플릿이 완전히 일치 - 캐시 미초기화: 서버 시작 후 템플릿이 캐시되지 않음 - API 조회 실패: Kakao API 연결 실패 - 부분 동기화: 템플릿 개수 또는 내용 불일치 

### Example

```typescript
import {
    AligoKakaoApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AligoKakaoApi(configuration);

const { status, data } = await apiInstance.getTemplatesSyncStatus();
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
|**200** | 동기화 상태 조회 성공 |  -  |
|**500** | API 호출 실패 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **syncTemplates**
> syncTemplates()

Kakao API에서 최신 템플릿을 조회하여 서버 캐시에 동기화합니다. 기존 캐시를 삭제 후 새로운 템플릿으로 교체합니다. 

### Example

```typescript
import {
    AligoKakaoApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AligoKakaoApi(configuration);

const { status, data } = await apiInstance.syncTemplates();
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
|**200** | 동기화 성공 |  -  |
|**500** | 동기화 실패 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

