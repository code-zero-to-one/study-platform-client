# MissionApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createMission**](#createmission) | **POST** /group-studies/{groupStudyId}/missions | |
|[**updateMission**](#updatemission) | **PUT** /missions/{missionId} | |

# **createMission**
> BaseResponseMissionCreationResult createMission(missionCreationRequest)


### Example

```typescript
import {
    MissionApi,
    Configuration,
    MissionCreationRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new MissionApi(configuration);

let groupStudyId: number; // (default to undefined)
let missionCreationRequest: MissionCreationRequest; //

const { status, data } = await apiInstance.createMission(
    groupStudyId,
    missionCreationRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **missionCreationRequest** | **MissionCreationRequest**|  | |
| **groupStudyId** | [**number**] |  | defaults to undefined|


### Return type

**BaseResponseMissionCreationResult**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateMission**
> BaseResponseVoid updateMission(missionUpdateRequest)


### Example

```typescript
import {
    MissionApi,
    Configuration,
    MissionUpdateRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new MissionApi(configuration);

let missionId: number; // (default to undefined)
let missionUpdateRequest: MissionUpdateRequest; //

const { status, data } = await apiInstance.updateMission(
    missionId,
    missionUpdateRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **missionUpdateRequest** | **MissionUpdateRequest**|  | |
| **missionId** | [**number**] |  | defaults to undefined|


### Return type

**BaseResponseVoid**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

