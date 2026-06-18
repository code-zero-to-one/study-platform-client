# CommunityQnAAnswerAcceptanceApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**acceptCommunityQnaAnswer**](#acceptcommunityqnaanswer) | **PUT** /api/v1/community/answers/{answerId}/acceptance | QnA 답변 채택|
|[**removeCommunityQnaAnswerAcceptance**](#removecommunityqnaansweracceptance) | **DELETE** /api/v1/community/answers/{answerId}/acceptance | QnA 답변 채택 해제|

# **acceptCommunityQnaAnswer**
> CommunityQnaAnswerAcceptanceResponse acceptCommunityQnaAnswer()

질문 작성자만 답변을 채택하거나 다른 답변으로 재채택할 수 있습니다. 채택 source of truth는 질문에 저장됩니다.

### Example

```typescript
import {
    CommunityQnAAnswerAcceptanceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CommunityQnAAnswerAcceptanceApi(configuration);

let answerId: number; // (default to undefined)

const { status, data } = await apiInstance.acceptCommunityQnaAnswer(
    answerId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **answerId** | [**number**] |  | defaults to undefined|


### Return type

**CommunityQnaAnswerAcceptanceResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 채택 성공 |  -  |
|**400** | 잘못된 path variable |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |
|**404** | 답변 또는 질문을 찾을 수 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **removeCommunityQnaAnswerAcceptance**
> CommunityQnaAnswerAcceptanceResponse removeCommunityQnaAnswerAcceptance()

질문 작성자만 현재 채택된 답변의 채택 상태를 해제할 수 있습니다. 다른 답변을 지정하면 409를 반환합니다.

### Example

```typescript
import {
    CommunityQnAAnswerAcceptanceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CommunityQnAAnswerAcceptanceApi(configuration);

let answerId: number; // (default to undefined)

const { status, data } = await apiInstance.removeCommunityQnaAnswerAcceptance(
    answerId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **answerId** | [**number**] |  | defaults to undefined|


### Return type

**CommunityQnaAnswerAcceptanceResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 채택 해제 성공 |  -  |
|**400** | 잘못된 path variable |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |
|**404** | 답변 또는 질문을 찾을 수 없음 |  -  |
|**409** | 현재 채택된 답변과 answerId가 다름 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

