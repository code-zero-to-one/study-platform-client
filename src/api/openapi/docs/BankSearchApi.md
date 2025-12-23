# BankSearchApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getBanks**](#getbanks) | **GET** /api/v1/banks | 은행 목록 조회|

# **getBanks**
> getBanks()

작성일자: 2025-12-11  작성자: 이도현  ---  ## Description  - 정산 계좌 등록/수정을 위해 사용 가능한 은행 목록을 조회합니다. - 은행 코드는 PG 및 정산 연동 시 사용되는 표준 코드입니다. - 인증이 필요하지 않은 공용 API입니다.  ---  ## Response  - 은행 코드와 은행명 목록을 반환합니다. 

### Example

```typescript
import {
    BankSearchApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BankSearchApi(configuration);

const { status, data } = await apiInstance.getBanks();
```

### Parameters
This endpoint does not have any parameters.


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 은행 목록 조회 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

