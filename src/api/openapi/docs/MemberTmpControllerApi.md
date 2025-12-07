# MemberTmpControllerApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**deleteMemberPermanently**](#deletememberpermanently) | **GET** /api/v1/members/{memberId}/permanently | |

# **deleteMemberPermanently**
> BaseResponseVoid deleteMemberPermanently()


### Example

```typescript
import {
    MemberTmpControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MemberTmpControllerApi(configuration);

let memberId: number; // (default to undefined)

const { status, data } = await apiInstance.deleteMemberPermanently(
    memberId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **memberId** | [**number**] |  | defaults to undefined|


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
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

