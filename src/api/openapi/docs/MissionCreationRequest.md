# MissionCreationRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **string** |  | [default to undefined]
**content** | **string** |  | [default to undefined]
**startTime** | **string** |  | [default to undefined]
**endTime** | **string** |  | [optional] [default to undefined]
**tasks** | [**Array&lt;MissionTaskDto&gt;**](MissionTaskDto.md) |  | [default to undefined]
**scoreAllocation** | **number** |  | [optional] [default to undefined]

## Example

```typescript
import { MissionCreationRequest } from './api';

const instance: MissionCreationRequest = {
    title,
    content,
    startTime,
    endTime,
    tasks,
    scoreAllocation,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
