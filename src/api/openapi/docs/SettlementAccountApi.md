# SettlementAccountApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**_delete**](#_delete) | **DELETE** /api/v1/mypage/settlement-account | 정산 계좌 삭제|
|[**get**](#get) | **GET** /api/v1/mypage/settlement-account | 정산 계좌 조회|
|[**register**](#register) | **POST** /api/v1/mypage/settlement-account | 정산 계좌 등록|
|[**update**](#update) | **PUT** /api/v1/mypage/settlement-account | 정산 계좌 수정|

# **_delete**
> BaseResponseVoid _delete()

작성일자: 2025-12-11  작성자: 이도현  ---  ## Description  - 로그인한 회원의 정산 계좌 정보를 삭제합니다. - 삭제 후 정산 계좌는 조회할 수 없습니다.  ---  ## Response  - 성공 시 응답 바디 없이 204 No Content를 반환합니다. 

### Example

```typescript
import {
    SettlementAccountApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SettlementAccountApi(configuration);

const { status, data } = await apiInstance._delete();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**BaseResponseVoid**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | 정산 계좌 삭제 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get**
> BaseResponseSettlementAccountResponse get()

작성일자: 2025-12-11  작성자: 이도현  ---  ## Description  - 로그인한 회원의 정산 계좌 정보를 조회합니다. - 등록된 정산 계좌가 없는 경우 에러가 발생합니다.  ---  ## Response (SettlementAccountResponse)  - 회원의 정산 계좌 정보를 반환합니다. 

### Example

```typescript
import {
    SettlementAccountApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SettlementAccountApi(configuration);

const { status, data } = await apiInstance.get();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**BaseResponseSettlementAccountResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 정산 계좌 조회 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **register**
> register(settlementAccountRegisterRequest)

작성일자: 2025-12-11  작성자: 이도현  ---  ## Description  - 로그인한 회원의 정산 계좌 정보를 최초로 등록합니다. - 회원당 하나의 정산 계좌만 등록할 수 있습니다. - 이미 정산 계좌가 존재하는 경우 에러가 발생합니다.  ---  ## Request Body (SettlementAccountRegisterRequest)  | 키 | 타입 | 설명 | 필수 | |----|------|------|------| | bankName | string | 은행명 | Y | | accountNumber | string | 계좌 번호 | Y | | accountHolder | string | 예금주명 | Y |  ---  ## Response (SettlementAccountResponse)  - 등록된 정산 계좌 정보를 반환합니다. 

### Example

```typescript
import {
    SettlementAccountApi,
    Configuration,
    SettlementAccountRegisterRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new SettlementAccountApi(configuration);

let settlementAccountRegisterRequest: SettlementAccountRegisterRequest; //정산 계좌 등록 요청

const { status, data } = await apiInstance.register(
    settlementAccountRegisterRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **settlementAccountRegisterRequest** | **SettlementAccountRegisterRequest**| 정산 계좌 등록 요청 | |


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 정산 계좌 등록 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **update**
> BaseResponseSettlementAccountResponse update(settlementAccountRegisterRequest)

작성일자: 2025-12-11  작성자: 이도현  ---  ## Description  - 로그인한 회원의 정산 계좌 정보를 수정합니다. - 기존에 등록된 정산 계좌가 없는 경우 에러가 발생합니다.  ---  ## Request Body (SettlementAccountRegisterRequest)  - 등록 API와 동일한 요청 구조를 사용합니다.  ---  ## Response (SettlementAccountResponse)  - 수정된 정산 계좌 정보를 반환합니다. 

### Example

```typescript
import {
    SettlementAccountApi,
    Configuration,
    SettlementAccountRegisterRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new SettlementAccountApi(configuration);

let settlementAccountRegisterRequest: SettlementAccountRegisterRequest; //정산 계좌 수정 요청

const { status, data } = await apiInstance.update(
    settlementAccountRegisterRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **settlementAccountRegisterRequest** | **SettlementAccountRegisterRequest**| 정산 계좌 수정 요청 | |


### Return type

**BaseResponseSettlementAccountResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 정산 계좌 수정 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

