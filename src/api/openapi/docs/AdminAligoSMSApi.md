# AdminAligoSMSApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getRemainCount**](#getremaincount) | **GET** /api/v1/admin/aligo/remain | 알리고 잔여 발송 건수 조회|
|[**getSendList**](#getsendlist) | **GET** /api/v1/admin/aligo/list | 알리고 전송 내역 조회|

# **getRemainCount**
> AligoRemainResponseSchema getRemainCount()

작성일자: 2025-12-11  작성자: 최현준  ---  ## Description  - 현재 알리고 계정의 SMS/LMS/MMS 잔여 발송 건수를 조회합니다.  - 관리자용 API입니다.  ---  ## Response  | **키** | **타입** | **설명** | **예시** | | --- | --- | --- | --- | | result_code | number | 결과 코드 | 1 (성공) | | message | string | 메시지 | \"success\" | | SMS_CNT | number | SMS 잔여 건수 | 5555 | | LMS_CNT | number | LMS 잔여 건수 | 1930 | | MMS_CNT | number | MMS 잔여 건수 | 833 | 

### Example

```typescript
import {
    AdminAligoSMSApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminAligoSMSApi(configuration);

const { status, data } = await apiInstance.getRemainCount();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**AligoRemainResponseSchema**

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

# **getSendList**
> AligoListResponseSchema getSendList()

작성일자: 2025-12-11  작성자: 최현준  ---  ## Description  - 알리고 SMS 전송 내역을 조회합니다.  - 관리자용 API입니다.  ---  ## Request  | **키** | **타입** | **설명** | **기본값** | | --- | --- | --- | --- | | page | number | 페이지 번호 | 1 | | page_size | number | 페이지당 개수 | 30 | | limit_day | number | 조회 기간 (일) | 7 |  ---  ## Response  | **키** | **타입** | **설명** | | --- | --- | --- | | result_code | number | 결과 코드 | | message | string | 메시지 | | list | array | 전송 내역 리스트 | | list[].mid | string | 메시지 ID | | list[].type | string | 메시지 타입 (SMS/LMS) | | list[].reserve_state | string | 전송 상태 | 

### Example

```typescript
import {
    AdminAligoSMSApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminAligoSMSApi(configuration);

let page: number; // (optional) (default to 1)
let pageSize: number; // (optional) (default to 30)
let limitDay: number; // (optional) (default to 7)

const { status, data } = await apiInstance.getSendList(
    page,
    pageSize,
    limitDay
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **page** | [**number**] |  | (optional) defaults to 1|
| **pageSize** | [**number**] |  | (optional) defaults to 30|
| **limitDay** | [**number**] |  | (optional) defaults to 7|


### Return type

**AligoListResponseSchema**

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

